import { describe, expect, it, vi } from 'vitest'
import { createHackerNewsProvider } from './hackerNewsProvider'

function response(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response
}

describe('Hacker News provider', () => {
  it('busca e normaliza top stories', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response([101, 102]))
      .mockResolvedValueOnce(response({
        id: 101,
        type: 'story',
        title: '  TypeScript 5.9  ',
        by: 'ada',
        url: 'https://example.com/typescript',
        score: 42,
        time: 1_700_000_000,
      }))
      .mockResolvedValueOnce(response({ id: 102, type: 'comment', text: 'ignorar' }))

    const provider = createHackerNewsProvider({ apiUrl: 'https://hn.test/v0', fetcher })

    await expect(provider.fetchTopStories(2)).resolves.toEqual([{
      source: 'hackernews',
      externalId: '101',
      title: 'TypeScript 5.9',
      url: 'https://example.com/typescript',
      summary: null,
      author: 'ada',
      imageUrl: null,
      publishedAt: '2023-11-14T22:13:20.000Z',
      score: 42,
    }])

    expect(fetcher).toHaveBeenCalledWith(
      'https://hn.test/v0/topstories.json',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('usa o link do Hacker News quando a story não tem url', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response([7]))
      .mockResolvedValueOnce(response({ id: 7, type: 'story', title: 'Sem URL' }))

    const provider = createHackerNewsProvider({ fetcher })
    const [item] = await provider.fetchTopStories(1)

    expect(item.url).toBe('https://news.ycombinator.com/item?id=7')
    expect(item.publishedAt).toBeNull()
  })

  it('propaga falhas HTTP da fonte', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({}, false, 503))
    const provider = createHackerNewsProvider({ fetcher })

    await expect(provider.fetchTopStories()).rejects.toThrow('Hacker News respondeu 503')
  })
})
