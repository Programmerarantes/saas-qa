import { Router, Request, Response } from 'express'
import { authenticateLab } from '../middlewares/authenticateLab'

export const labRouter = Router()
labRouter.get('/protected-resource', authenticateLab, (req: Request, res: Response) => {
  res.json({ message: 'Requisição autenticada no Authentication Lab.', user: req.labUser })
})
