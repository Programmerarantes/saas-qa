export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (response.status === 204) return undefined as T
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error ?? 'Não foi possível completar a requisição')
  return body as T
}

export function getContent(locale: string, type?: string, featured?: boolean) {
  const query = new URLSearchParams({ locale })
  if (type) query.set('type', type)
  if (featured) query.set('featured', 'true')
  return request<{ items: ContentItem[] }>(`/content?${query}`)
}

export function getContentBySlug(slug: string, locale: string) {
  return request<{ item: ContentItem }>(`/content/${encodeURIComponent(slug)}?locale=${locale}`)
}

export interface ContentTranslation { locale: 'pt-BR' | 'en'; title: string; summary: string; content: string }
export interface ContentItem {
  id: string; type: 'ARTICLE' | 'CASE_STUDY'; slug: string; category: string; tags: string[];
  status: 'DRAFT' | 'PUBLISHED'; featured: boolean; createdAt: string; updatedAt: string;
  publishedAt: string | null; translation: ContentTranslation; translations?: ContentTranslation[];
  renderedContent?: string; fallbackLocale?: 'pt-BR'
}

export interface ContentPayload {
  type: 'ARTICLE' | 'CASE_STUDY'; slug: string; category: string; tags: string[];
  status: 'DRAFT' | 'PUBLISHED'; featured: boolean; translations: ContentTranslation[]
}

function adminHeaders(): Record<string, string> {
  const token = localStorage.getItem('sql_admin_token')
  return token ? { Authorization: `Bearer ${token}` } : { }
}

export function adminLogin(identifier: string, password: string) {
  return request<{ token: string; user: { displayName: string; email: string } }>('/admin/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) })
}
export function adminList() { return request<{ items: ContentItem[] }>('/admin/content', { headers: adminHeaders() }) }

export function adminGet(id: string) { return request<{ item: ContentItem }>('/admin/content/' + id, { headers: adminHeaders() }) }

export function adminCreate(payload: ContentPayload) { return request<{ item: ContentItem }>('/admin/content', { method: 'POST', headers: adminHeaders(), body: JSON.stringify(payload) }) }

export function adminUpdate(id: string, payload: ContentPayload) { return request<{ item: ContentItem }>('/admin/content/' + id, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(payload) }) }

export function adminDelete(id: string) { return request<void>('/admin/content/' + id, { method: 'DELETE', headers: adminHeaders() }) }

export function adminLogout() { return request<void>('/admin/auth/logout', { method: 'POST', headers: adminHeaders() }) }

export function labLogin(identifier: string, password: string) {
  return request<{ token: string; user: { email: string } }>('/lab/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) })
}
export function labMe(token: string) { return request<{ user: { email: string } }>('/lab/auth/me', { headers: { Authorization: `Bearer ${token}` } }) }
export function labLogout(token: string) { return request<void>('/lab/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }) }
export function labProtected(token: string) { return request<{ message: string }>('/lab/protected-resource', { headers: { Authorization: `Bearer ${token}` } }) }
