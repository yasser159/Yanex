import { useState } from 'react'

function mapFirebaseAuthError(error) {
  const errorCode = typeof error === 'object' && error !== null ? error.code : ''
  const suffix = errorCode ? ` (code: ${errorCode})` : ''

  switch (errorCode) {
    case 'auth/invalid-credential':
      return `Invalid email or password.${suffix}`
    case 'auth/user-not-found':
      return `No account found with that email.${suffix}`
    case 'auth/wrong-password':
      return `Wrong password. Try again.${suffix}`
    case 'auth/email-already-in-use':
      return `This email is already in use.${suffix}`
    case 'auth/weak-password':
      return `Password is too weak. Use at least 6 characters.${suffix}`
    case 'auth/popup-closed-by-user':
      return `Google sign-in popup was closed before completion.${suffix}`
    case 'auth/popup-blocked':
      return `Popup was blocked. We started a redirect flow instead.${suffix}`
    case 'auth/unauthorized-domain':
      return `Current domain is not authorized in Firebase Auth settings.${suffix}`
    case 'auth/operation-not-allowed':
      return `Google sign-in is not enabled in Firebase Console.${suffix}`
    case 'auth/configuration-not-found':
      return `Google auth configuration is missing in Firebase Console (enable provider + support email).${suffix}`
    default:
      return error instanceof Error ? `${error.message}${suffix}` : `Authentication failed${suffix}`
  }
}

export default function AuthScreen({ onLogin, onRegister, onGoogleLogin, busy }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : ''
  const shouldShowHostHint = currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1'

  async function runAction(action) {
    setErrorMessage('')
    setInfoMessage('')
    setSubmitting(true)
    try {
      await action(email, password)
    } catch (error) {
      setErrorMessage(mapFirebaseAuthError(error))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleLogin() {
    setErrorMessage('')
    setInfoMessage('')
    setSubmitting(true)
    try {
      const user = await onGoogleLogin()
      if (!user) {
        setInfoMessage('Redirecting to Google sign-in...')
      }
    } catch (error) {
      setErrorMessage(mapFirebaseAuthError(error))
    } finally {
      setSubmitting(false)
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
      {infoMessage ? <p className="mt-2 text-sm text-emerald-300">{infoMessage}</p> : null}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          disabled={busy || submitting}
          type="button"
          onClick={() => runAction(onLogin)}
          className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
        >
          Log in
        </button>
        <button
          disabled={busy || submitting}
          type="button"
          onClick={() => runAction(onRegister)}
          className="rounded-lg border border-slate-600 px-4 py-2 font-medium text-slate-100 transition hover:bg-slate-800 disabled:opacity-50"
        >
          Register
        </button>
      </div>

      <button
        disabled={busy || submitting}
        type="button"
        onClick={handleGoogleLogin}
        className="mt-3 w-full rounded-lg border border-slate-500 bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
      >
        Continue with Google
      </button>

      {shouldShowHostHint ? (
        <p className="mt-2 text-xs text-slate-300">
          Testing on <code>{currentHost}</code>. If Google sign-in fails, add this host to Firebase Auth authorized domains.
        </p>
      ) : null}
    </section>
  )
}
