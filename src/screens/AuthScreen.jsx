import { useState } from 'react'

export default function AuthScreen({ onLogin, onRegister, busy }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function runAction(action) {
    setErrorMessage('')
    try {
      await action(email, password)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed')
    }
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl">
      <h2 className="text-xl font-semibold text-white">Welcome to Yanex</h2>
      <p className="mt-1 text-sm text-slate-400">Sign in or create an account to sync your data.</p>

      <div className="mt-4 space-y-3">
        <label className="block text-sm text-slate-300" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-400/70 focus:ring"
          placeholder="you@example.com"
          type="email"
        />

        <label className="block text-sm text-slate-300" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-400/70 focus:ring"
          placeholder="Min 6 chars"
          type="password"
        />
      </div>

      {errorMessage ? <p className="mt-3 text-sm text-rose-300">{errorMessage}</p> : null}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          disabled={busy}
          type="button"
          onClick={() => runAction(onLogin)}
          className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
        >
          Log in
        </button>
        <button
          disabled={busy}
          type="button"
          onClick={() => runAction(onRegister)}
          className="rounded-lg border border-slate-600 px-4 py-2 font-medium text-slate-100 transition hover:bg-slate-800 disabled:opacity-50"
        >
          Register
        </button>
      </div>
    </section>
  )
}
