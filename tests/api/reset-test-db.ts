import { Pool } from "pg";

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgres://qa_user:qa_pass@localhost:5432/qa_saas_test";

  export async function resetTestDb(): Promise<void> {
    const pool = new Pool({ connectionString: TEST_DATABASE_URL })

    try {
        await pool.query('TRUNCATE TABLE users, news_items RESTART IDENTITY CASCADE;')
    } finally {
        await pool.end()
    }
  }

  const isMainModule = require.main === module
  if (isMainModule) {
    resetTestDb().then(() => {
        console.log('Banco de testes resetado com sucesso.')
        process.exit(0)
    }).catch((err) => {
        console.error('Falha ao resetar o banco de teste:', err)
        process.exit(1)
    })
  }
