import { describe, expect, it } from 'vitest'
import { newsQuerySchema } from './news.schema'

describe('newsQuerySchema', () => {
  it('applies the default pagination', () => {
    expect(newsQuerySchema.parse({})).toEqual({ limit: 20, offset: 0 })
  })

  it('coerces valid query string values', () => {
    expect(newsQuerySchema.parse({
      source: 'github',
      limit: '10',
      offset: '20',
    })).toEqual({ source: 'github', limit: 10, offset: 20 })
  })

  it('rejects an unknown source', () => {
    expect(newsQuerySchema.safeParse({ source: 'unknown' }).success).toBe(false)
  })

  it('rejects invalid pagination values', () => {
    expect(newsQuerySchema.safeParse({ limit: '0' }).success).toBe(false)
    expect(newsQuerySchema.safeParse({ limit: '101' }).success).toBe(false)
    expect(newsQuerySchema.safeParse({ offset: '-1' }).success).toBe(false)
  })
})
