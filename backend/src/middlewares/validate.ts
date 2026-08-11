import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { BadRequestException } from "../exceptions/HttpException";

export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || '(corpo da requisição)',
        message: issue.message,
      }))

      return next(new BadRequestException('dados inválidos', details))
    }

    req.body = result.data
    next()
  }
}

export function validateQuery(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || '(query string)',
        message: issue.message,
      }))

      return next(new BadRequestException('parâmetros inválidos', details))
    }

    req.query = result.data as typeof req.query
    next()
  }
}
