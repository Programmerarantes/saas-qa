import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../db'
import { ADMIN_JWT_EXPIRES_IN, ADMIN_JWT_SECRET } from '../config/auth'
import { validate } from '../middlewares/validate'
import { loginSchema } from '../schemas/auth.schema'
import { authenticateAdmin } from '../middlewares/authenticateAdmin'
import { UnauthorizedException } from '../exceptions/HttpException'
import { asyncHandler } from '../utils/asyncHandler'
import { simpleRateLimit } from '../security/rateLimit'

export const adminAuthRouter = Router()

adminAuthRouter.post('/login', simpleRateLimit(8), validate(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query<{ id: string; email: string; display_name: string; password_hash: string }>(
    'SELECT id, email, display_name, password_hash FROM admin_users WHERE email = $1', [req.body.identifier],
  )
  const user = result.rows[0]
  const passwordMatches = user ? await bcrypt.compare(req.body.password, user.password_hash) : false
  if (!user || !passwordMatches) throw new UnauthorizedException('credenciais administrativas inválidas')
  const token = jwt.sign({ sub: user.id, email: user.email, displayName: user.display_name }, ADMIN_JWT_SECRET, { expiresIn: ADMIN_JWT_EXPIRES_IN })
  res.json({ token, user: { id: user.id, email: user.email, displayName: user.display_name } })
}))

adminAuthRouter.get('/me', authenticateAdmin, (req: Request, res: Response) => res.json({ user: req.admin }))
adminAuthRouter.post('/logout', authenticateAdmin, (_req, res) => res.status(204).send())
