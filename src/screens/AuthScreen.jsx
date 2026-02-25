import { useState } from 'react'
import { MESSAGES, t } from '../i18n'

function mapFirebaseAuthError(error, copy) {
  const errorCode = typeof error === 'object' && error !== null ? error.code : ''
  const suffix = errorCode ? ` (code: ${errorCode})` : ''

  switch (errorCode) {
    case 'auth/invalid-credential':
      return `${copy.errors.invalidCredential}${suffix}`
    case 'auth/user-not-found':
      return `${copy.errors.userNotFound}${suffix}`
    case 'auth/wrong-password':
      return `${copy.errors.wrongPassword}${suffix}`
    case 'auth/email-already-in-use':
      return `${copy.errors.emailInUse}${suffix}`
    case 'auth/weak-password':
      return `${copy.errors.weakPassword}${suffix}`
    case 'auth/popup-closed-by-user':
      return `${copy.errors.popupClosed}${suffix}`
    case 'auth/popup-blocked':
      return `${copy.errors.popupBlocked}${suffix}`
    case 'auth/unauthorized-domain':
      return `${copy.errors.unauthorizedDomain}${suffix}`
    case 'auth/operation-not-allowed':
      return `${copy.errors.operationNotAllowed}${suffix}`
    case 'auth/configuration-not-found':
      return `${copy.errors.configNotFound}${suffix}`
    default:
      return error instanceof Error ? `${error.message}${suffix}` : `${copy.authFailed}${suffix}`
  }
}

export default function AuthScreen({ onLogin, onRegister, onGoogleLogin, busy, language = 'en' }) {
  const copy = MESSAGES[language]?.auth ?? MESSAGES.en.auth
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
      setErrorMessage(mapFirebaseAuthError(error, copy))
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
        setInfoMessage(t(language, 'auth.redirectingGoogle'))
      }
    } catch (error) {
      setErrorMessage(mapFirebaseAuthError(error, copy))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-md">
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-transparent p-6">

        <input
          id="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="auth-transparent-input mb-3 w-full rounded border border-white/65 bg-transparent px-3 py-2 text-white placeholder-white/70 outline-none transition"
          placeholder={copy.email}
          type="email"
        />

        <input
          id="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="auth-transparent-input mb-3 w-full rounded border border-white/65 bg-transparent px-3 py-2 text-white placeholder-white/70 outline-none transition"
          placeholder={copy.password}
          type="password"
        />

        {errorMessage ? <p className="mb-2 text-center text-sm text-rose-300">{errorMessage}</p> : null}
        {infoMessage ? <p className="mb-2 text-center text-sm text-emerald-300">{infoMessage}</p> : null}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <button
            disabled={busy || submitting}
            type="button"
            onClick={() => runAction(onLogin)}
            className="min-w-[104px] rounded-full border border-white/45 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-950 disabled:opacity-50"
          >
            {copy.login}
          </button>
          <button
            disabled={busy || submitting}
            type="button"
            onClick={() => runAction(onRegister)}
            className="min-w-[104px] rounded-full border border-white/35 bg-transparent px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-950 disabled:opacity-50"
          >
            {copy.register}
          </button>
          <button
            disabled={busy || submitting}
            type="button"
            onClick={handleGoogleLogin}
            className="min-w-[170px] rounded-full border border-cyan-200/50 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-950 disabled:opacity-50"
          >
            {copy.loginGoogle}
          </button>
        </div>

        <button
          type="button"
          className="mt-4 block w-full text-center text-xs text-white/70 transition hover:text-white"
        >
          {copy.forgotPassword}
        </button>

        {shouldShowHostHint ? (
          <p className="mt-3 text-center text-xs text-white/65">
            {copy.testingOn} <code>{currentHost}</code>. {copy.hostHintSuffix}
          </p>
        ) : null}
      </div>
    </section>
  )
}
