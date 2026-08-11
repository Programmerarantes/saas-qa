import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { UnauthorizedException } from '../exceptions/HttpException'
import { JWT_SECRET } from '../config/auth'

export interface AuthenticatedUser {
  id: string
  username?: string
  email?: string
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authorization = req.header('authorization')

  if (!authorization?.startsWith('Bearer ')) {
    return next(new UnauthorizedException('token não informado'))
  }

  const token = authorization.slice('Bearer '.length).trim()

  if (!token) {
    return next(new UnauthorizedException('token não informado'))
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload

    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      return next(new UnauthorizedException('token inválido'))
    }

    req.user = {
      id: payload.sub,
      username: typeof payload.username === 'string' ? payload.username : undefined,
      email: typeof payload.email === 'string' ? payload.email : undefined,
    }

    return next()
  } catch (_error) {
    return next(new UnauthorizedException('token inválido'))
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}

export type AuthTokenPayload = JwtPayload & {
  username?: string
  email?: string
}
