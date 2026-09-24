import { test, expect } from '@playwright/test'

test.describe('Authentication Lab', () => {
  test('login, sessão, request autenticada e logout', async ({ request }) => {
    const login = await request.post('/lab/auth/login', { data: { identifier: 'demo@lab.local', password: 'LabPass123!' } })
    expect(login.status()).toBe(200)
    const token = (await login.json()).token
    expect((await request.get('/lab/auth/me', { headers: { Authorization: `Bearer ${token}` } })).status()).toBe(200)
    expect((await request.get('/lab/protected-resource', { headers: { Authorization: `Bearer ${token}` } })).status()).toBe(200)
    expect((await request.post('/lab/auth/logout', { headers: { Authorization: `Bearer ${token}` } })).status()).toBe(204)
    expect((await request.get('/lab/auth/me', { headers: { Authorization: `Bearer ${token}` } })).status()).toBe(401)
  })

  test('não expõe se o usuário existe', async ({ request }) => {
    const response = await request.post('/lab/auth/login', { data: { identifier: 'missing@lab.local', password: 'wrong' } })
    expect(response.status()).toBe(401)
    expect(await response.json()).toEqual({ error: 'credenciais inválidas' })
  })
})
