import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'

async function adminToken(request: any) {
  const response = await request.post('/admin/auth/login', { data: { identifier: 'admin@softwarequalitylab.local', password: 'ChangeMe123!' } })
  expect(response.status()).toBe(200)
  return (await response.json()).token as string
}

test.describe('conteúdo e Admin', () => {
  test('protege o Admin e autentica o administrador', async ({ request }) => {
    expect((await request.get('/admin/content')).status()).toBe(401)
    expect((await request.post('/admin/auth/login', { data: { identifier: 'admin@softwarequalitylab.local', password: 'errada' } })).status()).toBe(401)
    expect(await adminToken(request)).toBeTruthy()
  })

  test('cria, salva e publica conteúdo sem alterar código', async ({ request }) => {
    const token = await adminToken(request)
    const slug = `article-${randomUUID()}`
    const payload = {
      type: 'ARTICLE', slug, category: 'Automation', tags: ['playwright', 'e2e'], status: 'PUBLISHED', featured: true,
      translations: [{ locale: 'pt-BR', title: 'Artigo de teste', summary: 'Resumo de teste', content: '# Olá\n\n```ts\nconst ok = true\n```' }],
    }
    const create = await request.post('/admin/content', { headers: { Authorization: `Bearer ${token}` }, data: payload })
    expect(create.status()).toBe(201)
    const item = (await create.json()).item
    const publicResponse = await request.get(`/content/${slug}?locale=pt-BR`)
    expect(publicResponse.status()).toBe(200)
    expect((await publicResponse.json()).item.renderedContent).toContain('<h1>Olá</h1>')
    const draft = await request.put(`/admin/content/${item.id}`, { headers: { Authorization: `Bearer ${token}` }, data: { ...payload, status: 'DRAFT' } })
    expect(draft.status()).toBe(200)
    expect((await request.get(`/content/${slug}`)).status()).toBe(404)
  })

  test('faz fallback para PT-BR quando EN não existe', async ({ request }) => {
    const token = await adminToken(request)
    const slug = `fallback-${randomUUID()}`
    await request.post('/admin/content', { headers: { Authorization: `Bearer ${token}` }, data: { type: 'ARTICLE', slug, category: 'Engineering', tags: [], status: 'PUBLISHED', featured: false, translations: [{ locale: 'pt-BR', title: 'Somente português', summary: 'Resumo', content: 'Conteúdo' }] } })
    const response = await request.get(`/content/${slug}?locale=en`)
    expect(response.status()).toBe(200)
    expect((await response.json()).item.fallbackLocale).toBe('pt-BR')
  })
})
