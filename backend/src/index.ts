import { app } from './app'
import { ensureSystemUsers } from './services/bootstrapService'

const port = Number(process.env.PORT ?? 3000)

ensureSystemUsers()
  .then(() => {
    app.listen(port, () => console.log(`Software Quality Lab API: http://localhost:${port}`))
  })
  .catch((error) => {
    console.error('Não foi possível inicializar o sistema', error)
    process.exit(1)
  })
