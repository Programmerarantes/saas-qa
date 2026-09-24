import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { pool } from '../db'

const migrationsDirectory = process.env.MIGRATIONS_DIR ?? path.resolve(process.cwd(), 'db/migrations')
const migrationLockKey = 'software-quality-lab-schema-migrations'

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

async function migrationFiles() {
  const files = await readdir(migrationsDirectory)
  return files.filter((file) => /^\d+_.+\.sql$/.test(file)).sort()
}

export async function migrate() {
  await ensureMigrationsTable()
  const files = await migrationFiles()

  for (const version of files) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [migrationLockKey])

      const applied = await client.query('SELECT 1 FROM schema_migrations WHERE version = $1', [version])
      if (applied.rowCount) {
        await client.query('COMMIT')
        continue
      }

      const sql = await readFile(path.join(migrationsDirectory, version), 'utf8')
      console.log(`Applying migration ${version}`)
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version])
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}

if (require.main === module) {
  migrate()
    .then(async () => {
      console.log('Database migrations are up to date.')
      await pool.end()
    })
    .catch(async (error) => {
      console.error('Database migration failed', error)
      await pool.end()
      process.exit(1)
    })
}
