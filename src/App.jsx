import { useMemo, useState } from 'react'
import './App.css'
import { getFirebaseStatus } from './core/firebase/app'
import { useAuth } from './providers/useAuth'
import AuthScreen from './screens/AuthScreen'
import DiagnosticsScreen from './screens/DiagnosticsScreen'
import InsightsScreen from './screens/InsightsScreen'
import ProfileScreen from './screens/ProfileScreen'
import SearchScreen from './screens/SearchScreen'
import UploadScreen from './screens/UploadScreen'

const COVER_BACKGROUND_GIF =
  '/dna-background.gif'

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
  const { user, loading, login, register, loginWithGoogle, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [showGuestDiagnostics, setShowGuestDiagnostics] = useState(false)

  function scrollToAuth() {
    const authPanel = document.getElementById('auth-panel')
    if (authPanel) {
      authPanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function renderAuthenticatedTab() {
    switch (activeTab) {
      case 'upload':
        return <UploadScreen />
      case 'search':
        return <SearchScreen />
      case 'insights':
        return <InsightsScreen />
      case 'diagnostics':
        return <DiagnosticsScreen />
      case 'profile':
      default:
        return <ProfileScreen user={user} />
    }
  }

  const authenticatedTabs = [
    { id: 'upload', label: 'Upload' },
    { id: 'search', label: 'Search' },
    { id: 'insights', label: 'Insights' },
    { id: 'profile', label: 'Profile' },
    { id: 'diagnostics', label: 'Diagnostics' },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div
        aria-hidden="true"
        className="cover-background absolute inset-0"
        style={{ backgroundImage: `url(${COVER_BACKGROUND_GIF})` }}
      />
      <div aria-hidden="true" className="cover-overlay absolute inset-0" />

      <div className="relative z-10 flex min-h-screen flex-col p-6">
        <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 py-2">
          <div>
            <h1 className="text-2xl font-bold tracking-wide md:text-3xl">Yanex</h1>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300/90">
              DNA checking service
            </p>
          </div>

          <nav className="flex items-center gap-2">
            {!user ? (
              <button
                type="button"
                onClick={scrollToAuth}
                className="rounded-full border border-white/40 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Get Started
              </button>
            ) : null}
            {user ? (
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-white/40 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Log out
              </button>
            ) : null}
          </nav>
        </header>

        <section className="mx-auto flex w-full max-w-5xl flex-1 items-center">
          {!firebaseStatus.ready ? (
            <div className="cover-glass w-full space-y-4 rounded-3xl p-6 md:p-8">
              <h2 className="text-3xl font-semibold">Firebase setup required</h2>
              <FirebaseConfigWarning
                message={firebaseStatus.message ?? 'Missing required Firebase environment variables.'}
              />
              <DiagnosticsScreen />
            </div>
          ) : loading ? (
            <div className="cover-glass w-full rounded-3xl p-8 text-center">
              <p className="text-lg text-slate-100">Checking authentication state...</p>
            </div>
          ) : user ? (
            <div className="cover-glass w-full space-y-6 rounded-3xl p-6 md:p-8">
              <nav className="flex flex-wrap gap-2">
                {authenticatedTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      activeTab === tab.id
                        ? 'bg-emerald-400 text-emerald-950'
                        : 'border border-white/40 text-white hover:bg-white/15'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              {renderAuthenticatedTab()}
            </div>
          ) : (
            <div className="w-full space-y-8 text-center">
              <article className="mx-auto max-w-3xl">
                <h2 className="text-4xl font-semibold leading-tight md:text-6xl">Cover your DNA insights in real time</h2>
                <p className="mx-auto mt-4 max-w-2xl text-base text-slate-100 md:text-xl">
                  Yanex tracks DNA marker thresholds, keeps profile updates synced, and exposes every system move through diagnostics logs.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={scrollToAuth}
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                  >
                    Start Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGuestDiagnostics((currentValue) => !currentValue)}
                    className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    {showGuestDiagnostics ? 'Hide Diagnostics' : 'View Diagnostics'}
                  </button>
                </div>
              </article>

              <div id="auth-panel" className="mx-auto w-full max-w-xl">
                <AuthScreen
                  onLogin={login}
                  onRegister={register}
                  onGoogleLogin={loginWithGoogle}
                  busy={loading}
                />
              </div>

              {showGuestDiagnostics ? (
                <div className="mx-auto w-full max-w-4xl text-left">
                  <DiagnosticsScreen />
                </div>
              ) : null}
            </div>
          )}
        </section>

        <footer className="mx-auto w-full max-w-5xl py-3 text-center text-sm text-slate-100/80">
          Inspired by Bootstrap Cover, powered by Firebase and React.
        </footer>
      </div>
    </main>
  )
}

export default App
