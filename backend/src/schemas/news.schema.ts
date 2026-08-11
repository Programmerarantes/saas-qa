import { z } from 'zod'
import { NEWS_SOURCES } from '../domain/news'

export const newsQuerySchema = z.object({
  source: z.enum(NEWS_SOURCES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export type NewsQuery = z.infer<typeof newsQuerySchema>
