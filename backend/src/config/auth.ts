import { SignOptions } from 'jsonwebtoken'

export const ADMIN_JWT_SECRET = process.env.JWT_SECRET ?? 'local-admin-secret-change-me'
export const ADMIN_JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '8h') as SignOptions['expiresIn']
export const LAB_SESSION_TTL_MS = 1000 * 60 * 60
