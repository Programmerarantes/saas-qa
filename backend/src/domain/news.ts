export const NEWS_SOURCES = [
  'hackernews',
  'devto',
  'reddit',
  'github',
  'producthunt',
] as const

export type NewsSource = typeof NEWS_SOURCES[number]

export interface NewsItem {
  id: string
  source: NewsSource
  externalId: string
  title: string
  url: string
  summary: string | null
  author: string | null
  imageUrl: string | null
  publishedAt: string | null
  score: number | null
  createdAt: string
  updatedAt: string
}
