import { NewsItem } from '../domain/news'

const DEFAULT_API_URL = 'https://hacker-news.firebaseio.com/v0'

type HackerNewsStory = {
  id: number
  type?: string
  by?: string
  title?: string
  url?: string
  text?: string
  score?: number
  time?: number
}

export interface HackerNewsProviderOptions {
  apiUrl?: string
  fetcher?: typeof fetch
  timeoutMs?: number
}

function normalizeStory(story: HackerNewsStory): Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'> | null {
  if (story.type !== 'story' || !story.id || !story.title?.trim()) return null

  return {
    source: 'hackernews',
    externalId: String(story.id),
    title: story.title.trim(),
    url: story.url ?? `https://news.ycombinator.com/item?id=${story.id}`,
    summary: story.text ?? null,
    author: story.by ?? null,
    imageUrl: null,
    publishedAt: story.time ? new Date(story.time * 1000).toISOString() : null,
    score: typeof story.score === 'number' ? story.score : null,
  }
}

async function getJson<T>(url: string, fetcher: typeof fetch, timeoutMs: number): Promise<T> {
  const signal = AbortSignal.timeout(timeoutMs)
  const response = await fetcher(url, { signal })
  if (!response.ok) throw new Error(`Hacker News respondeu ${response.status}`)
  return response.json() as Promise<T>
}

export function createHackerNewsProvider(options: HackerNewsProviderOptions = {}) {
  const apiUrl = (options.apiUrl ?? process.env.HACKER_NEWS_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '')
  const fetcher = options.fetcher ?? fetch
  const timeoutMs = options.timeoutMs ?? 10_000

  return {
    async fetchTopStories(limit = 20) {
      const ids = await getJson<number[]>(`${apiUrl}/topstories.json`, fetcher, timeoutMs)
      const stories = await Promise.all(
        ids.slice(0, limit).map((id) =>
          getJson<HackerNewsStory | null>(`${apiUrl}/item/${id}.json`, fetcher, timeoutMs),
        ),
      )

      return stories
        .map((story) => story && normalizeStory(story))
        .filter((story): story is NonNullable<typeof story> => story !== null)
    },
  }
}

export type HackerNewsProvider = ReturnType<typeof createHackerNewsProvider>
