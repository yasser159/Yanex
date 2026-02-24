import { useEffect, useMemo, useRef, useState } from 'react'
import anime from 'animejs/lib/anime.es.js'
import './App.css'
import { getFirebaseStatus } from './core/firebase/app'
import { logger } from './core/logging/logger'
import { useAuth } from './providers/useAuth'
import AuthScreen from './screens/AuthScreen'
import DiagnosticsScreen from './screens/DiagnosticsScreen'
import InsightsScreen from './screens/InsightsScreen'
import ProfileScreen from './screens/ProfileScreen'
import SearchScreen from './screens/SearchScreen'
import UploadScreen from './screens/UploadScreen'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const COVER_BACKGROUND_GIF =
  '/dna-background.gif'
const COVER_BACKGROUND_VIDEO = '/dna-animation.webm'

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
  const [backgroundVideoReady, setBackgroundVideoReady] = useState(false)
  const [backgroundVideoFailed, setBackgroundVideoFailed] = useState(false)
  const hasRunIntroMotion = useRef(false)
  const backgroundVideoRef = useRef(null)

  useEffect(() => {
    if (hasRunIntroMotion.current) {
      return
    }
    hasRunIntroMotion.current = true

    logger.info('ui.motion.run', {
      activeTab,
      isAuthenticated: Boolean(user),
      isLoading: loading,
      firebaseReady: firebaseStatus.ready,
    })

    anime({
      targets: '.animate-fade-up',
      opacity: [0, 1],
      translateY: [18, 0],
      easing: 'easeOutExpo',
      duration: 650,
      delay: anime.stagger(85),
    })

    anime({
      targets: '.animate-pop-in',
      opacity: [0, 1],
      scale: [0.96, 1],
      easing: 'easeOutBack',
      duration: 520,
      delay: anime.stagger(70),
    })

    anime({
      targets: '.animate-glow',
      boxShadow: [
        '0 0 0 rgba(16, 185, 129, 0)',
        '0 0 18px rgba(16, 185, 129, 0.25)',
      ],
      direction: 'alternate',
      loop: 1,
      easing: 'easeInOutSine',
      duration: 750,
    })

    anime({
      targets: '.cover-orb-1, .cover-orb-2, .cover-orb-3',
      translateY: [0, -18],
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      duration: 3200,
      delay: anime.stagger(400),
    })
  }, [activeTab, firebaseStatus.ready, loading, showGuestDiagnostics, user])

  useEffect(() => {
    logger.info('ui.tab.transition', { activeTab, showGuestDiagnostics })
    anime({
      targets: '.tab-panel-animate',
      opacity: [0.86, 1],
      translateY: [12, 0],
      easing: 'easeOutSine',
      duration: 520,
    })

    anime({
      targets: '.tab-content-transition',
      opacity: [0, 1],
      translateX: [14, 0],
      filter: ['blur(8px)', 'blur(0px)'],
      easing: 'easeOutSine',
      duration: 680,
    })
  }, [activeTab, showGuestDiagnostics])

  useEffect(() => {
    const magneticElements = Array.from(document.querySelectorAll('.magnetic'))
    const cleanups = magneticElements.map((element) => {
      const onMove = (event) => {
        const rect = element.getBoundingClientRect()
        const x = event.clientX - rect.left - rect.width / 2
        const y = event.clientY - rect.top - rect.height / 2
        anime({
          targets: element,
          translateX: x * 0.08,
          translateY: y * 0.08,
          duration: 250,
          easing: 'easeOutQuad',
        })
      }

      const onLeave = () => {
        anime({
          targets: element,
          translateX: 0,
          translateY: 0,
          duration: 350,
          easing: 'easeOutElastic(1, .6)',
        })
      }

      element.addEventListener('mousemove', onMove)
      element.addEventListener('mouseleave', onLeave)

      return () => {
        element.removeEventListener('mousemove', onMove)
        element.removeEventListener('mouseleave', onLeave)
      }
    })

    return () => {
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [activeTab, user])

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
      <div aria-hidden="true" className="cover-background-rotate absolute inset-0">
        <video
          ref={backgroundVideoRef}
          className="cover-background-video absolute inset-0"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={() => {
            if (backgroundVideoRef.current) {
              backgroundVideoRef.current.playbackRate = 0.7
            }
          }}
          onCanPlay={() => {
            setBackgroundVideoReady(true)
            logger.info('ui.background.video.ready', {
              src: COVER_BACKGROUND_VIDEO,
              playbackRate: backgroundVideoRef.current?.playbackRate ?? 1,
            })
          }}
          onError={() => {
            setBackgroundVideoFailed(true)
            logger.warn('ui.background.video.failed', { src: COVER_BACKGROUND_VIDEO })
          }}
        >
          <source src={COVER_BACKGROUND_VIDEO} type="video/webm" />
        </video>
        <div
          className={`cover-background absolute inset-0 ${
            backgroundVideoReady && !backgroundVideoFailed ? 'cover-background-hidden' : ''
          }`}
          style={{ backgroundImage: `url(${COVER_BACKGROUND_GIF})` }}
        />
      </div>
      <div aria-hidden="true" className="cover-overlay absolute inset-0" />
      <div aria-hidden="true" className="cover-scanlines absolute inset-0" />
      <div aria-hidden="true" className="cover-orb cover-orb-1" />
      <div aria-hidden="true" className="cover-orb cover-orb-2" />
      <div aria-hidden="true" className="cover-orb cover-orb-3" />

      <div className="relative z-10 flex min-h-screen flex-col p-6">
        <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 py-2">
          <div className="animate-fade-up">
            <h1 className="animate-pop-in brand-title text-2xl md:text-3xl">Yanex</h1>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300/90">
              DNA checking service
            </p>
          </div>

          <nav className="animate-fade-up flex items-center gap-2">
            {!user ? (
              <button
                type="button"
                onClick={scrollToAuth}
                className="animate-pop-in rounded-full border border-white/40 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Get Started
              </button>
            ) : null}
            {user ? (
              <button
                type="button"
                onClick={logout}
                aria-label="Log out"
                title="Log out"
                className="animate-pop-in inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white transition hover:bg-white/20"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect x="3.75" y="3.75" width="14.5" height="16.5" rx="2.25" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M13 12H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M18 9L21 12L18 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : null}
          </nav>
        </header>

        {user ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="cover-top-tabs animate-fade-up mx-auto mt-1 w-full max-w-5xl"
          >
            <TabsList variant="line" className="flex w-full flex-wrap justify-center gap-4 md:justify-end">
              {authenticatedTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`cover-tab-btn animate-pop-in magnetic ${activeTab === tab.id ? 'cover-tab-active' : ''}`}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        ) : null}

        <section className="mx-auto flex w-full max-w-5xl flex-1 items-center">
          {!firebaseStatus.ready ? (
            <div className="animate-fade-up cover-glass w-full space-y-4 rounded-3xl p-6 md:p-8">
              <h2 className="text-3xl font-semibold">Firebase setup required</h2>
              <FirebaseConfigWarning
                message={firebaseStatus.message ?? 'Missing required Firebase environment variables.'}
              />
              <DiagnosticsScreen />
            </div>
          ) : loading ? (
            <div className="animate-fade-up cover-glass w-full rounded-3xl p-8 text-center">
              <p className="text-lg text-slate-100">Checking authentication state...</p>
            </div>
          ) : user ? (
            <div className="animate-fade-up cover-glass tab-panel-animate w-full space-y-6 rounded-3xl p-6 md:p-8">
              <div key={activeTab} className="tab-content-transition">
                {renderAuthenticatedTab()}
              </div>
            </div>
          ) : (
            <div className="w-full space-y-8 text-center">
              <article className="animate-fade-up mx-auto max-w-3xl">
                <h2 className="animate-pop-in hero-title text-4xl font-semibold leading-tight md:text-6xl">Cover your DNA insights in real time</h2>
                <p className="animate-fade-up mx-auto mt-4 max-w-2xl text-base text-slate-100 md:text-xl">
                  Yanex tracks DNA marker thresholds, keeps profile updates synced, and exposes every system move through diagnostics logs.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={scrollToAuth}
                    className="animate-pop-in magnetic cool-cta rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                  >
                    Start Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGuestDiagnostics((currentValue) => !currentValue)}
                    className="animate-pop-in magnetic cool-cta rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    {showGuestDiagnostics ? 'Hide Diagnostics' : 'View Diagnostics'}
                  </button>
                </div>
              </article>

              <div id="auth-panel" className="animate-fade-up mx-auto w-full max-w-xl">
                <AuthScreen
                  onLogin={login}
                  onRegister={register}
                  onGoogleLogin={loginWithGoogle}
                  busy={loading}
                />
              </div>

              {showGuestDiagnostics ? (
                <div className="animate-fade-up tab-panel-animate mx-auto w-full max-w-4xl text-left">
                  <DiagnosticsScreen />
                </div>
              ) : null}
            </div>
          )}
        </section>

        <footer className="mx-auto w-full max-w-5xl py-3 text-center text-sm text-slate-100/80">
          Imagined &amp; founded by Yan Xing, MSc
        </footer>
      </div>
    </main>
  )
}

export default App
