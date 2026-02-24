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
    <section className="mx-auto w-full max-w-md">
      <div className="relative overflow-hidden rounded-2xl border border-white/35 bg-black/35 p-6 shadow-2xl backdrop-blur-md">

        <input
          id="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mb-3 w-full rounded border border-white/65 bg-transparent px-3 py-2 text-white placeholder-white/70 outline-none transition focus:bg-white focus:text-black"
          placeholder="Email"
          type="email"
        />

        <input
          id="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mb-3 w-full rounded border border-white/65 bg-transparent px-3 py-2 text-white placeholder-white/70 outline-none transition focus:bg-white focus:text-black"
          placeholder="Password"
          type="password"
        />

        {errorMessage ? <p className="mb-2 text-center text-sm text-rose-300">{errorMessage}</p> : null}
        {infoMessage ? <p className="mb-2 text-center text-sm text-emerald-300">{infoMessage}</p> : null}

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            disabled={busy || submitting}
            type="button"
            onClick={() => runAction(onLogin)}
            className="rounded border border-white bg-transparent px-3 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black disabled:opacity-50"
          >
            Login
          </button>
          <button
            disabled={busy || submitting}
            type="button"
            onClick={() => runAction(onRegister)}
            className="rounded border border-white/65 bg-transparent px-3 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black disabled:opacity-50"
          >
            Register
          </button>
          <button
            disabled={busy || submitting}
            type="button"
            onClick={handleGoogleLogin}
            className="rounded border border-white/65 bg-transparent px-3 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black disabled:opacity-50"
          >
            Login with Google
          </button>
        </div>

        <button
          type="button"
          className="mt-4 block w-full text-center text-xs text-white/70 transition hover:text-white"
        >
          forgot password?
        </button>

        {shouldShowHostHint ? (
          <p className="mt-3 text-center text-xs text-white/65">
            Testing on <code>{currentHost}</code>. If Google sign-in fails, add this host to Firebase Auth authorized domains.
          </p>
        ) : null}
      </div>
    </section>
  )
}
