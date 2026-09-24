import { createHash, randomBytes } from 'node:crypto'
import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { pool } from '../db'
import { validate } from '../middlewares/validate'
import { loginSchema } from '../schemas/auth.schema'
import { asyncHandler } from '../utils/asyncHandler'
import { authenticateLab } from '../middlewares/authenticateLab'
import { UnauthorizedException } from '../exceptions/HttpException'
import { LAB_SESSION_TTL_MS } from '../config/auth'
import { simpleRateLimit } from '../security/rateLimit'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60_000

function hashToken(token: string) { return createHash('sha256').update(token).digest('hex') }

export const labAuthRouter = Router()

labAuthRouter.post('/login', simpleRateLimit(10), validate(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query<any>('SELECT * FROM lab_users WHERE email = $1', [req.body.identifier])
  const user = result.rows[0]
  const validPassword = user ? await bcrypt.compare(req.body.password, user.password_hash) : false
  const locked = user?.status === 'LOCKED' && user.locked_until && new Date(user.locked_until).getTime() > Date.now()
  if (!user || locked || !validPassword) {
    if (user && !locked) {
      const attempts = user.failed_attempts + 1
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        await pool.query(`UPDATE lab_users SET failed_attempts=$1, status='LOCKED', locked_until=$2, updated_at=NOW() WHERE id=$3`, [attempts, new Date(Date.now() + LOCKOUT_MS), user.id])
      } else {
        await pool.query('UPDATE lab_users SET failed_attempts=$1, updated_at=NOW() WHERE id=$2', [attempts, user.id])
      }
    }
    throw new UnauthorizedException('credenciais inválidas')
  }
  await pool.query(`UPDATE lab_users SET failed_attempts=0, status='ACTIVE', locked_until=NULL, updated_at=NOW() WHERE id=$1`, [user.id])
  const token = randomBytes(32).toString('hex')
  await pool.query('INSERT INTO lab_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)', [user.id, hashToken(token), new Date(Date.now() + LAB_SESSION_TTL_MS)])
  res.json({ token, user: { id: user.id, email: user.email } })
}))

labAuthRouter.get('/me', authenticateLab, (req: Request, res: Response) => res.json({ user: req.labUser }))
labAuthRouter.post('/logout', authenticateLab, asyncHandler(async (req: Request, res: Response) => {
  const token = req.header('authorization')!.slice(7)
  await pool.query('UPDATE lab_sessions SET revoked_at=NOW() WHERE token_hash=$1', [hashToken(token)])
  res.status(204).send()
}))
