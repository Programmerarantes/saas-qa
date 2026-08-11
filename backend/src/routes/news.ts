import { Router } from 'express'
import { listNewsController } from '../controllers/newsController'
import { validateQuery } from '../middlewares/validate'
import { asyncHandler } from '../utils/asyncHandler'
import { newsQuerySchema } from '../schemas/news.schema'

export const newsRouter = Router()

newsRouter.get(
  '/',
  validateQuery(newsQuerySchema),
  asyncHandler(listNewsController),
)
