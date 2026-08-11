import { pool } from '../db'
import { NewsItem, NewsSource } from '../domain/news'

export type NewsItemInput = Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>

export interface ListNewsInput {
  source?: NewsSource
  limit: number
  offset: number
}

export interface ListNewsResult {
  items: NewsItem[]
  total: number
}

type NewsRow = {
  id: string
  source: NewsSource
  external_id: string
  title: string
  url: string
  summary: string | null
  author: string | null
  image_url: string | null
  published_at: Date | null
  score: number | null
  created_at: Date
  updated_at: Date
}

function mapNewsRow(row: NewsRow): NewsItem {
  return {
    id: row.id,
    source: row.source,
    externalId: row.external_id,
    title: row.title,
    url: row.url,
    summary: row.summary,
    author: row.author,
    imageUrl: row.image_url,
    publishedAt: row.published_at?.toISOString() ?? null,
    score: row.score,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

export async function listNews(input: ListNewsInput): Promise<ListNewsResult> {
  const values: unknown[] = []
  const conditions: string[] = []

  if (input.source) {
    values.push(input.source)
    conditions.push(`source = $${values.length}`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const countResult = await pool.query<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM news_items ${where}`,
    values,
  )

  values.push(input.limit, input.offset)
  const result = await pool.query<NewsRow>(
    `SELECT id, source, external_id, title, url, summary, author,
            image_url, published_at, score, created_at, updated_at
       FROM news_items
       ${where}
      ORDER BY published_at DESC NULLS LAST, created_at DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  )

  return {
    items: result.rows.map(mapNewsRow),
    total: Number(countResult.rows[0].total),
  }
}

export async function upsertNews(items: NewsItemInput[]): Promise<number> {
  for (const item of items) {
    await pool.query(
      `INSERT INTO news_items
        (source, external_id, title, url, summary, author, image_url, published_at, score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (source, external_id) DO UPDATE SET
        title = EXCLUDED.title,
        url = EXCLUDED.url,
        summary = EXCLUDED.summary,
        author = EXCLUDED.author,
        image_url = EXCLUDED.image_url,
        published_at = EXCLUDED.published_at,
        score = EXCLUDED.score,
        updated_at = NOW()` ,
      [item.source, item.externalId, item.title, item.url, item.summary,
        item.author, item.imageUrl, item.publishedAt, item.score],
    )
  }

  return items.length
}
