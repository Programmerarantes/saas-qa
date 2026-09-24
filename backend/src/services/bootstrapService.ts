import bcrypt from 'bcrypt'
import { pool } from '../db'

export async function ensureSystemUsers(): Promise<void> {
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@softwarequalitylab.local').trim().toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!'
  const labEmail = (process.env.LAB_DEMO_EMAIL ?? 'demo@lab.local').trim().toLowerCase()
  const labPassword = process.env.LAB_DEMO_PASSWORD ?? 'LabPass123!'

  const [adminHash, labHash] = await Promise.all([
    bcrypt.hash(adminPassword, 12),
    bcrypt.hash(labPassword, 12),
  ])

  await pool.query(
    `INSERT INTO admin_users (email, display_name, password_hash)
     VALUES ($1, 'Software Quality Lab Admin', $2)
     ON CONFLICT (email) DO NOTHING`,
    [adminEmail, adminHash],
  )
  await pool.query(
    `INSERT INTO lab_users (email, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (email) DO NOTHING`,
    [labEmail, labHash],
  )
}
