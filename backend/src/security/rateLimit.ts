import { NextFunction, Request, Response } from 'express'
import { TooManyRequestsException } from '../exceptions/HttpException'

const attempts = new Map<string, { count: number; resetAt: number }>()

export function simpleRateLimit(max = 10, windowMs = 60_000) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`
    const now = Date.now()
    const current = attempts.get(key)
    if (!current || current.resetAt <= now) {
      attempts.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }
    current.count += 1
    if (current.count > max) return next(new TooManyRequestsException('muitas tentativas; tente novamente mais tarde'))
    return next()
  }
}
