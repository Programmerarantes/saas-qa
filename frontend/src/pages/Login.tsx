import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoggedInUser('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })

      const body = await response.json()

      if (!response.ok) {
        setError(body.error ?? 'Não foi possível entrar')
        return
      }

      localStorage.setItem('auth_token', body.token)
      setLoggedInUser(body.user.username)
    } catch {
      setError('Não foi possível conectar à API')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
            SaaS QA
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Acesse sua conta
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Entre usando seu email ou username.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Email ou username</span>
            <input
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="admin ou admin@teste.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Senha</span>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Sua senha"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {loggedInUser && (
            <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Login realizado. Olá, {loggedInUser}!
            </p>
          )}

          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </section>
    </main>
  )
}
