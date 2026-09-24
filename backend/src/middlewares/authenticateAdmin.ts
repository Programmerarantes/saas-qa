import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { UnauthorizedException } from '../exceptions/HttpException'
import { ADMIN_JWT_SECRET } from '../config/auth'

export interface AdminUser {
  id: string
  email: string
  displayName: string
}

export function authenticateAdmin(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization')
  if (!header?.startsWith('Bearer ')) return next(new UnauthorizedException('sessão administrativa não informada'))
  try {
    const payload = jwt.verify(header.slice(7), ADMIN_JWT_SECRET) as JwtPayload & { email?: string; displayName?: string }
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') throw new Error('invalid admin token')
    req.admin = { id: payload.sub, email: payload.email, displayName: payload.displayName ?? 'Admin' }
    return next()
  } catch {
    return next(new UnauthorizedException('sessão administrativa inválida'))
  }
}

declare global {
  namespace Express {
    interface Request { admin?: AdminUser }
  }
}
