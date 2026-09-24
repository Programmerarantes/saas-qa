import { Router, Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { validateQuery, validateParams } from '../middlewares/validate'
import { contentSlugSchema, publicContentQuerySchema } from '../schemas/content.schema'
import { findPublicContent, listPublicContent } from '../repositories/contentRepository'
import { NotFoundException } from '../exceptions/HttpException'
import { renderSafeMarkdown } from '../security/markdown'

export const contentRouter = Router()

contentRouter.get('/', validateQuery(publicContentQuerySchema), asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as { type?: 'ARTICLE' | 'CASE_STUDY'; locale: 'pt-BR' | 'en'; featured?: boolean }
  const items = await listPublicContent(query.type, query.locale, query.featured)
  res.json({ items })
}))

contentRouter.get('/:slug', validateParams(contentSlugSchema), asyncHandler(async (req: Request, res: Response) => {
  const locale = req.query.locale === 'en' ? 'en' : 'pt-BR'
  const content = await findPublicContent(req.params.slug, locale)
  if (!content) throw new NotFoundException('conteúdo não encontrado')
  content.renderedContent = await renderSafeMarkdown(content.translation.content)
  res.json({ item: content })
}))
