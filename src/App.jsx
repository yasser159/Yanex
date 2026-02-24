import { useMemo, useState } from 'react'
import './App.css'
import { getFirebaseStatus } from './core/firebase/app'
import { useAuth } from './providers/useAuth'
import AuthScreen from './screens/AuthScreen'
import DiagnosticsScreen from './screens/DiagnosticsScreen'
import ProfileScreen from './screens/ProfileScreen'

function FirebaseConfigWarning({ message }) {
  return (
    <section className="rounded-2xl border border-amber-500/50 bg-amber-500/10 p-4 text-amber-100">
      <h2 className="text-lg font-semibold">Firebase not configured</h2>
      <p className="mt-2 text-sm">{message}</p>
      <p className="mt-2 text-sm">
        Create a <code>.env.local</code> using <code>.env.example</code> and restart the dev server.
      </p>
    </section>
  )
}

function App() {
  const firebaseStatus = useMemo(() => getFirebaseStatus(), [])
  const { user, loading, login, register, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  if (!firebaseStatus.ready) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <h1 className="text-3xl font-bold">Yanex Firebase Starter</h1>
          <FirebaseConfigWarning
            message={firebaseStatus.message ?? 'Missing required Firebase environment variables.'}
          />
          <DiagnosticsScreen />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Yanex Firebase Starter</h1>
            <p className="text-sm text-slate-400">Auth + Firestore + Diagnostics logging stream</p>
          </div>

          {user ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"
            >
              Log out
            </button>
          ) : null}
        </header>

        {loading ? (
          <p className="text-slate-400">Checking authentication state...</p>
        ) : user ? (
          <>
            <nav className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`rounded-lg px-3 py-2 text-sm ${
                  activeTab === 'profile'
                    ? 'bg-emerald-500 text-emerald-950'
                    : 'border border-slate-600 text-slate-100'
                }`}
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('diagnostics')}
                className={`rounded-lg px-3 py-2 text-sm ${
                  activeTab === 'diagnostics'
                    ? 'bg-emerald-500 text-emerald-950'
                    : 'border border-slate-600 text-slate-100'
                }`}
              >
                Diagnostics
              </button>
            </nav>

            {activeTab === 'profile' ? <ProfileScreen user={user} /> : <DiagnosticsScreen />}
          </>
        ) : (
          <>
            <AuthScreen onLogin={login} onRegister={register} busy={loading} />
            <DiagnosticsScreen />
          </>
        )}
      </div>
    </main>
  )
}

export default App
