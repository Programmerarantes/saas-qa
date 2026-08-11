import express, { Request, Response } from 'express'
import cors from 'cors'
import { checkDbConnection, pool } from './db'
import { authRouter } from './routes/auth'
import { errorHandler } from './middlewares/errorHandler'
import { authenticate } from './middlewares/authenticate'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
}))
app.use('/auth', authRouter)

app.get('/health', async (_req: Request, res: Response) => {
    const dbOk = await checkDbConnection()
    res.status(dbOk ? 200: 503).json({
        status: dbOk ? 'ok' : 'degraded',
        db: dbOk,
    })
})

app.get('/users', authenticate, async (_req: Request, res: Response) => {
    const result = await pool.query(
        `SELECT id, username, email, created_at
         FROM users
         ORDER BY created_at DESC`
    )
    res.json(result.rows)
})

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
