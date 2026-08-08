import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL ?? 'postgresql://user:password@localhost:5432/qa_saas';

export const pool = new Pool({ connectionString });

export async function checkDbConnection(): Promise<boolean> {
    try {
        await pool.query('SELECT 1');
        return true;
    } catch (error) {
        console.error('Database connection error:', error);
        return false;
    }
}