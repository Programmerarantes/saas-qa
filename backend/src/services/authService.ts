import { pool } from "../db";
import { ConflictException } from "../exceptions/HttpException";
import { RegisterInput } from "../schemas/auth.schema"
import bcrypt from "bcrypt";

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