import { pool } from '../db'
import { ContentCategory, ContentEntry, ContentStatus, ContentType, Locale, Translation } from '../domain/content'

type ContentRow = {
  id: string; type: ContentType; slug: string; category: ContentCategory; tags: string[]; status: ContentStatus
  featured: boolean; created_at: Date; updated_at: Date; published_at: Date | null
  locale: Locale; title: string; summary: string; content: string
}

function map(row: ContentRow, translation: Translation, translations?: Translation[]): ContentEntry {
  return {
    id: row.id, type: row.type, slug: row.slug, category: row.category, tags: row.tags,
    status: row.status, featured: row.featured, createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(), publishedAt: row.published_at?.toISOString() ?? null,
    translation, ...(translations ? { translations } : {}),
  }
}

const columns = `e.id, e.type, e.slug, e.category, e.tags, e.status, e.featured,
  e.created_at, e.updated_at, e.published_at, t.locale, t.title, t.summary, t.content`

export async function listPublicContent(type?: ContentType, locale: Locale = 'pt-BR', featured?: boolean) {
  const values: unknown[] = [locale]
  const conditions = ["e.status = 'PUBLISHED'"]
  if (type) { values.push(type); conditions.push(`e.type = $${values.length}`) }
  if (featured !== undefined) { values.push(featured); conditions.push(`e.featured = $${values.length}`) }
  const result = await pool.query<ContentRow>(
    `SELECT ${columns} FROM content_entries e
     JOIN content_translations t ON t.content_id = e.id AND t.locale = $1
     WHERE ${conditions.join(' AND ')} ORDER BY e.published_at DESC NULLS LAST, e.created_at DESC`, values,
  )
  return result.rows.map((row) => map(row, { locale: row.locale, title: row.title, summary: row.summary, content: row.content }))
}

export async function findPublicContent(slug: string, requestedLocale: Locale) {
  const result = await pool.query<ContentRow>(
    `SELECT ${columns} FROM content_entries e JOIN content_translations t ON t.content_id = e.id
     WHERE e.slug = $1 AND e.status = 'PUBLISHED' AND t.locale IN ($2, 'pt-BR')
     ORDER BY CASE WHEN t.locale = $2 THEN 0 ELSE 1 END LIMIT 1`, [slug, requestedLocale],
  )
  if (!result.rows[0]) return null
  const row = result.rows[0]
  const entry = map(row, { locale: row.locale, title: row.title, summary: row.summary, content: row.content })
  return { ...entry, fallbackLocale: row.locale === requestedLocale ? undefined : 'pt-BR' as Locale }
}

export async function listAdminContent() {
  const result = await pool.query<ContentRow>(
    `SELECT ${columns} FROM content_entries e JOIN content_translations t ON t.content_id = e.id
     WHERE t.locale = 'pt-BR' ORDER BY e.updated_at DESC`,
  )
  return result.rows.map((row) => map(row, { locale: row.locale, title: row.title, summary: row.summary, content: row.content }))
}

export async function findAdminContent(id: string) {
  const result = await pool.query<ContentRow>(
    `SELECT ${columns} FROM content_entries e JOIN content_translations t ON t.content_id = e.id
     WHERE e.id = $1 ORDER BY t.locale`, [id],
  )
  if (!result.rows[0]) return null
  const translations = result.rows.map((row) => ({ locale: row.locale, title: row.title, summary: row.summary, content: row.content }))
  return { ...map(result.rows[0], translations[0], translations), translations }
}

export interface ContentInput {
  type: ContentType; slug: string; category: ContentCategory; tags: string[]; status: ContentStatus; featured: boolean
  translations: Translation[]
}

export async function createContent(input: ContentInput) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await client.query<{ id: string }>(
      `INSERT INTO content_entries (type, slug, category, tags, status, featured, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, CASE WHEN $5::varchar = 'PUBLISHED' THEN NOW() ELSE NULL END) RETURNING id`,
      [input.type, input.slug, input.category, input.tags, input.status, input.featured],
    )
    for (const translation of input.translations) {
      await client.query(
        `INSERT INTO content_translations (content_id, locale, title, summary, content) VALUES ($1, $2, $3, $4, $5)`,
        [result.rows[0].id, translation.locale, translation.title, translation.summary, translation.content],
      )
    }
    await client.query('COMMIT')
    return findAdminContent(result.rows[0].id)
  } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
}

export async function updateContent(id: string, input: ContentInput) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(
      `UPDATE content_entries SET type=$1, slug=$2, category=$3, tags=$4, status=$5, featured=$6,
       published_at = CASE WHEN $5::varchar = 'PUBLISHED' THEN COALESCE(published_at, NOW()) ELSE NULL END, updated_at=NOW() WHERE id=$7`,
      [input.type, input.slug, input.category, input.tags, input.status, input.featured, id],
    )
    await client.query('DELETE FROM content_translations WHERE content_id = $1', [id])
    for (const translation of input.translations) {
      await client.query(
        `INSERT INTO content_translations (content_id, locale, title, summary, content) VALUES ($1, $2, $3, $4, $5)`,
        [id, translation.locale, translation.title, translation.summary, translation.content],
      )
    }
    await client.query('COMMIT')
    return findAdminContent(id)
  } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
}

export async function deleteContent(id: string) {
  const result = await pool.query('DELETE FROM content_entries WHERE id = $1', [id])
  return result.rowCount === 1
}
