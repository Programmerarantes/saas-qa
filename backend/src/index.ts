import express, { Request, Response } from 'express'
import { checkDbConnection, pool } from './db'
import { authRouter } from './routes/auth'
import { errorHandler } from './middlewares/errorHandler'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())
app.use('/auth', authRouter)

app.get('/health', async (_req: Request, res: Response) => {
    const dbOk = await checkDbConnection()
    res.status(dbOk ? 200: 503).json({
        status: dbOk ? 'ok' : 'degraded',
        db: dbOk,
    })
})

app.get('/users', async (_req: Request, res: Response) => {
    const result = await pool.query('SELECT * from users ORDER BY created_at DESC')
    res.json(result.rows)
})

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
