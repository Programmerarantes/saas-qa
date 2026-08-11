import { Request, Response } from 'express'
import { NewsQuery } from '../schemas/news.schema'
import { executeGetNews } from '../usecases/getNews'

export async function listNewsController(req: Request, res: Response) {
  const result = await executeGetNews(req.query as unknown as NewsQuery)
  res.status(200).json({
    items: result.items,
    total: result.total,
    limit: Number(req.query.limit),
    offset: Number(req.query.offset),
  })
}
