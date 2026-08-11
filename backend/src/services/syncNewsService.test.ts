import { describe, expect, it, vi } from 'vitest'
import { syncHackerNews } from './syncNewsService'

vi.mock('../repositories/newsRepository', () => ({
  upsertNews: vi.fn(),
}))

import { upsertNews } from '../repositories/newsRepository'

describe('syncHackerNews', () => {
  it('normaliza a sincronização e persiste as notícias recebidas', async () => {
    const items = [{
      source: 'hackernews' as const,
      externalId: '1',
      title: 'Uma notícia',
      url: 'https://news.ycombinator.com/item?id=1',
      summary: null,
      author: 'author',
      imageUrl: null,
      publishedAt: null,
      score: 10,
    }]
    vi.mocked(upsertNews).mockResolvedValue(1)
    const provider = { fetchTopStories: vi.fn().mockResolvedValue(items) }

    await expect(syncHackerNews(1, provider)).resolves.toEqual({ fetched: 1, persisted: 1 })
    expect(provider.fetchTopStories).toHaveBeenCalledWith(1)
    expect(upsertNews).toHaveBeenCalledWith(items)
  })
})
