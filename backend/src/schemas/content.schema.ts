import { z } from 'zod'
import { CONTENT_CATEGORIES, CONTENT_STATUSES, CONTENT_TYPES, LOCALES } from '../domain/content'

const translation = z.object({
  locale: z.enum(LOCALES),
  title: z.string().trim().min(1).max(240),
  summary: z.string().trim().min(1).max(500),
  content: z.string().min(1).max(100_000),
})

export const contentInputSchema = z.object({
  type: z.enum(CONTENT_TYPES),
  slug: z.string().trim().toLowerCase().min(3).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.enum(CONTENT_CATEGORIES),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(40)).max(20).default([]),
  status: z.enum(CONTENT_STATUSES).default('DRAFT'),
  featured: z.boolean().default(false),
  translations: z.array(translation).min(1).refine((items) => items.some((item) => item.locale === 'pt-BR'), 'tradução PT-BR é obrigatória')
    .refine((items) => new Set(items.map((item) => item.locale)).size === items.length, 'não repita o idioma'),
})

export const publicContentQuerySchema = z.object({
  type: z.enum(CONTENT_TYPES).optional(),
  locale: z.enum(LOCALES).default('pt-BR'),
  featured: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
})

export const contentIdSchema = z.object({ id: z.string().uuid() })
export const contentSlugSchema = z.object({ slug: z.string().min(1) })
export type ContentInput = z.infer<typeof contentInputSchema>
