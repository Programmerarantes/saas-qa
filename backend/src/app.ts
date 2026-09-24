import cors from 'cors'
import express, { Request, Response } from 'express'
import { adminAuthRouter } from './routes/adminAuth'
import { adminContentRouter } from './routes/adminContent'
import { contentRouter } from './routes/content'
import { labAuthRouter } from './routes/labAuth'
import { labRouter } from './routes/lab'
import { errorHandler } from './middlewares/errorHandler'
import { checkDbConnection } from './db'

export const app = express()

app.disable('x-powered-by')
app.use(express.json({ limit: '200kb' }))
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173' }))

app.get('/health', async (_req: Request, res: Response) => {
  const dbOk = await checkDbConnection()
  res.status(dbOk ? 200 : 503).json({ status: dbOk ? 'ok' : 'degraded', db: dbOk })
})

app.use('/content', contentRouter)
app.use('/admin/auth', adminAuthRouter)
app.use('/admin/content', adminContentRouter)
app.use('/lab/auth', labAuthRouter)
app.use('/lab', labRouter)
app.use(errorHandler)
