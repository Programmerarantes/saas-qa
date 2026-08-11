import { test, expect } from '@playwright/test'
import { Pool } from 'pg'
import { randomUUID } from 'node:crypto'

const databaseUrl = process.env.TEST_DATABASE_URL ??
  'postgres://qa_user:qa_pass@localhost:5432/qa_saas_test'

const pool = new Pool({ connectionString: databaseUrl })

async function insertNewsItem(source: string, title = `Notícia ${randomUUID()}`) {
  const externalId = randomUUID()
  await pool.query(
    `INSERT INTO news_items
      (source, external_id, title, url, summary, author, published_at, score)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`,
    [source, externalId, title, `https://example.com/${externalId}`, 'Resumo', 'QA', 10],
  )
  return title
}

test.afterAll(async () => {
  await pool.end()
})

test.describe('GET /news', () => {
  test('retorna lista vazia e paginação padrão', async ({ request }) => {
    const response = await request.get('/news?source=producthunt')

    expect(response.status()).toBe(200)
    await expect(response.json()).resolves.toEqual({
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
    })
  })

  test('retorna notícias filtradas por fonte', async ({ request }) => {
    const title = await insertNewsItem('github')

    const response = await request.get('/news?source=github')
    const body = await response.json()

    expect(response.status()).toBe(200)
    expect(body.total).toBeGreaterThanOrEqual(1)
    expect(body.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ source: 'github', title }),
    ]))
  })

  test('aplica limit e offset', async ({ request }) => {
    await insertNewsItem('devto')
    await insertNewsItem('devto')

    const response = await request.get('/news?source=devto&limit=1&offset=1')
    const body = await response.json()

    expect(response.status()).toBe(200)
    expect(body.limit).toBe(1)
    expect(body.offset).toBe(1)
    expect(body.items).toHaveLength(1)
    expect(body.total).toBeGreaterThanOrEqual(2)
  })

  test('rejeita parâmetros inválidos', async ({ request }) => {
    const response = await request.get('/news?source=invalid&limit=101')

    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('parâmetros inválidos')
    expect(Array.isArray(body.details)).toBe(true)
  })
})
