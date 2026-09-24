import { Router, Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { authenticateAdmin } from '../middlewares/authenticateAdmin'
import { validate, validateParams } from '../middlewares/validate'
import { contentIdSchema, contentInputSchema } from '../schemas/content.schema'
import { createContent, deleteContent, findAdminContent, listAdminContent, updateContent } from '../repositories/contentRepository'
import { ConflictException, NotFoundException } from '../exceptions/HttpException'
import { renderSafeMarkdown } from '../security/markdown'

export const adminContentRouter = Router()
adminContentRouter.use(authenticateAdmin)

adminContentRouter.get('/', asyncHandler(async (_req, res) => res.json({ items: await listAdminContent() })))

adminContentRouter.get('/:id', validateParams(contentIdSchema), asyncHandler(async (req: Request, res: Response) => {
  const item = await findAdminContent(req.params.id)
  if (!item) throw new NotFoundException('conteúdo não encontrado')
  res.json({ item })
}))

adminContentRouter.post('/', validate(contentInputSchema), asyncHandler(async (req: Request, res: Response) => {
  try {
    const item = await createContent(req.body)
    res.status(201).json({ item })
  } catch (error: any) {
    if (error?.code === '23505') throw new ConflictException('slug já cadastrado')
    throw error
  }
}))

adminContentRouter.put('/:id', validateParams(contentIdSchema), validate(contentInputSchema), asyncHandler(async (req: Request, res: Response) => {
  try {
    const item = await updateContent(req.params.id, req.body)
    if (!item) throw new NotFoundException('conteúdo não encontrado')
    res.json({ item })
  } catch (error: any) {
    if (error?.code === '23505') throw new ConflictException('slug já cadastrado')
    throw error
  }
}))

adminContentRouter.delete('/:id', validateParams(contentIdSchema), asyncHandler(async (req: Request, res: Response) => {
  if (!await deleteContent(req.params.id)) throw new NotFoundException('conteúdo não encontrado')
  res.status(204).send()
}))

adminContentRouter.post('/preview', asyncHandler(async (req: Request, res: Response) => {
  const markdown = typeof req.body?.content === 'string' ? req.body.content : ''
  res.json({ html: await renderSafeMarkdown(markdown) })
}))
