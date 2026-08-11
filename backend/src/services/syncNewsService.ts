import { upsertNews } from '../repositories/newsRepository'
import { createHackerNewsProvider, HackerNewsProvider } from '../providers/hackerNewsProvider'

export async function syncHackerNews(
  limit = 20,
  provider: HackerNewsProvider = createHackerNewsProvider(),
) {
  const items = await provider.fetchTopStories(limit)
  const persisted = await upsertNews(items)

  return { fetched: items.length, persisted }
}
