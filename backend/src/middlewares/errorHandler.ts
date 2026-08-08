import { NextFunction, Request, Response } from "express";
import { HttpException } from "../exceptions/HttpException";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    if (err instanceof HttpException) {
        return res.status(err.status).json({
            error: err.message,
            ...(err.content !== undefined ? { details: err.content } : {}),
        })
    }

    console.error('Erro não tratado', err)
    return res.status(500).json({ error: 'erro interno' })
}