export const CONTENT_TYPES = ['ARTICLE', 'CASE_STUDY'] as const
export const CONTENT_CATEGORIES = ['Test Design', 'Automation', 'Quality Engineering', 'Engineering'] as const
export const CONTENT_STATUSES = ['DRAFT', 'PUBLISHED'] as const
export const LOCALES = ['pt-BR', 'en'] as const

export type ContentType = typeof CONTENT_TYPES[number]
export type ContentCategory = typeof CONTENT_CATEGORIES[number]
export type ContentStatus = typeof CONTENT_STATUSES[number]
export type Locale = typeof LOCALES[number]

export interface Translation {
  locale: Locale
  title: string
  summary: string
  content: string
}

export interface ContentEntry {
  id: string
  type: ContentType
  slug: string
  category: ContentCategory
  tags: string[]
  status: ContentStatus
  featured: boolean
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  translation: Translation
  translations?: Translation[]
  renderedContent?: string
  fallbackLocale?: Locale
}
