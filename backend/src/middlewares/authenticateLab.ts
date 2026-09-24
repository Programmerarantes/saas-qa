import { createHash } from 'node:crypto'
import { NextFunction, Request, Response } from 'express'
import { pool } from '../db'
import { UnauthorizedException } from '../exceptions/HttpException'

export async function authenticateLab(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization')
  if (!header?.startsWith('Bearer ')) return next(new UnauthorizedException('sessão do laboratório não informada'))
  const tokenHash = createHash('sha256').update(header.slice(7)).digest('hex')
  try {
    const result = await pool.query<{ id: string; email: string }>(
      `SELECT u.id, u.email
       FROM lab_sessions s JOIN lab_users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > NOW() AND u.status = 'ACTIVE'`,
      [tokenHash],
    )
    if (!result.rows[0]) return next(new UnauthorizedException('sessão do laboratório inválida ou expirada'))
    req.labUser = result.rows[0]
    return next()
  } catch (error) {
    return next(error)
  }
}

declare global {
  namespace Express {
    interface Request { labUser?: { id: string; email: string } }
  }
}
