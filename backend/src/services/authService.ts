import { pool } from "../db";
import { ConflictException, UnauthorizedException } from "../exceptions/HttpException";
import { LoginInput, RegisterInput } from "../schemas/auth.schema"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/auth";

const SALT_ROUNDS = 10

export interface RegisteredUser {
    id: string
    username: string
    email: string
    created_at: string
}

export async function registerUser (input: RegisterInput): Promise<RegisteredUser> {
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)

    try {
        const result = await pool.query(
            `INSERT INTO users (email, username, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, email, username, created_at`,
            [input.email, input.username, passwordHash]
        )
        return result.rows[0]
    } catch (err: any) {
        if(err.code === '23505') {
            throw new ConflictException('email já cadastrado')
        }
        throw err
    }
}

export interface LoggedInUser {
    id: string
    username: string
    email: string
}

export interface LoginResult {
    token: string
    user: LoggedInUser
}

export async function loginUser (input: LoginInput): Promise<LoginResult> {
    const result = await pool.query(
        `SELECT id, username, email, password_hash
         FROM users
         WHERE email = $1 OR username = $1
         LIMIT 1`,
        [input.identifier]
    )

    const user = result.rows[0]
    const passwordMatches = user
        ? await bcrypt.compare(input.password, user.password_hash)
        : false

    if (!user || !passwordMatches) {
        throw new UnauthorizedException('credenciais inválidas')
    }

    const token = jwt.sign(
        { sub: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    )

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
    }
}
