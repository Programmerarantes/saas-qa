import { Router } from 'express'
import { listNewsController } from '../controllers/newsController'
import { validateQuery } from '../middlewares/validate'
import { asyncHandler } from '../utils/asyncHandler'
import { newsQuerySchema } from '../schemas/news.schema'
import { executeSyncNews } from '../usecases/syncNews'

const syncNewsSchema = newsQuerySchema.pick({ limit: true })

export const newsRouter = Router()

newsRouter.get(
  '/',
  validateQuery(newsQuerySchema),
  asyncHandler(listNewsController),
)

newsRouter.post(
  '/sync',
  validateQuery(syncNewsSchema),
  asyncHandler(async (req, res) => {
    const result = await executeSyncNews(Number(req.query.limit))
    res.status(200).json(result)
  }),
)
