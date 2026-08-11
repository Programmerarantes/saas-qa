import { z } from 'zod'

const USERNAME_REGEX = /^[a-z0-9._-]+$/
const PASSWORD_SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/

export const registerSchema = z.object({
  username: z
    .string({ error: 'username é obrigatório' })
    .trim()
    .toLowerCase()
    .min(3, 'username deve ter no mínimo 3 caracteres')
    .max(50, 'username deve ter no máximo 50 caracteres')
    .regex(
      USERNAME_REGEX,
      'username deve conter apenas letras, números, ponto, hífen ou underline',
    )
    .refine(
      (username) => !username.startsWith('.') && !username.endsWith('.'),
      'username não pode começar ou terminar com ponto',
    )
    .refine(
      (username) => !username.includes('..'),
      'username não pode conter pontos consecutivos',
    ),

  email: z
    .string({ error: 'email é obrigatório' })
    .trim()
    .toLowerCase()
    .max(254, 'email deve ter no máximo 254 caracteres')
    .pipe(z.email({ message: 'email inválido' })),

  password: z
    .string({ error: 'senha é obrigatória' })
    .min(12, 'senha deve ter no mínimo 12 caracteres')
    .max(72, 'senha deve ter no máximo 72 caracteres')
    .regex(/[a-z]/, 'senha deve conter pelo menos uma letra minúscula')
    .regex(/[A-Z]/, 'senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'senha deve conter pelo menos um número')
    .regex(
      PASSWORD_SPECIAL_CHAR_REGEX,
      'senha deve conter pelo menos um caractere especial',
    )
    .refine(
      (password) => !/\s/.test(password),
      'senha não deve conter espaços em branco',
    ),
})

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

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
