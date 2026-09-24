import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z
    .string({ error: 'username ou email é obrigatório' })
    .trim()
    .toLowerCase()
    .min(1, 'username ou email é obrigatório'),

  password: z
    .string({ error: 'senha é obrigatória' })
    .min(1, 'senha é obrigatória'),
})

export type LoginInput = z.infer<typeof loginSchema>
