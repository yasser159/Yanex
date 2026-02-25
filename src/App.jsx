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
const BOTTOM_BACKGROUND_VIDEO = '/dna-animation-2.mp4'

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

function BootstrapHorizontalSections({ onPrimaryAction }) {
  const sections = [
    {
      id: 'section-upload',
      eyebrow: 'Upload',
      title: 'Drag in your DNA data without friction',
      description:
        'A clean intake flow that feels instant. Think of it like airport express check-in: less standing around, more moving forward.',
      actionLabel: 'Try Upload Flow',
      accent: 'from-emerald-300/20 to-cyan-300/20',
    },
    {
      id: 'section-search',
      eyebrow: 'Search',
      title: 'Run precise matches across your library',
      description:
        'Search behaves like a spotlight in a dark room. You point it once and hidden details step into view, fast and clear.',
      actionLabel: 'Open Search Setup',
      accent: 'from-sky-300/20 to-blue-300/20',
    },
    {
      id: 'section-diagnostics',
      eyebrow: 'Diagnostics',
      title: 'See the full execution story in one timeline',
      description:
        'When something acts weird, logs become your black box recorder. You get chronological signals instead of guesswork.',
      actionLabel: 'Inspect Logs',
      accent: 'from-teal-300/20 to-indigo-300/20',
    },
  ]

  return (
    <section className="space-y-6 pb-8 pt-2 md:space-y-8 md:pb-12">
      {sections.map((section, index) => (
        <article
          key={section.id}
          className="animate-fade-up cover-glass overflow-hidden rounded-3xl p-5 md:p-7"
        >
          <div className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
            <div className={index % 2 === 1 ? 'md:order-2' : ''}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">
                {section.eyebrow}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
                {section.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-100/85 md:text-base">
                {section.description}
              </p>
              <button
                type="button"
                onClick={onPrimaryAction}
                className="magnetic cool-cta mt-5 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                {section.actionLabel}
              </button>
            </div>

            <div className={index % 2 === 1 ? 'md:order-1' : ''}>
              <div
                className={`relative h-44 rounded-2xl border border-white/15 bg-gradient-to-br ${section.accent} p-4 md:h-52`}
              >
                <div className="absolute right-4 top-4 text-xs font-medium uppercase tracking-[0.14em] text-white/70">
                  Bootstrap style
                </div>
                <div className="mt-10 space-y-3">
                  <div className="h-2.5 w-2/3 rounded-full bg-white/70" />
                  <div className="h-2.5 w-1/2 rounded-full bg-white/45" />
                  <div className="h-2.5 w-3/4 rounded-full bg-white/35" />
                </div>
              </div>
            </div>
          </div>
        </article>
      ))}
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
      const reduceMotion =
        typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const navOffset = 96
      const targetY = Math.max(
        0,
        window.scrollY + authPanel.getBoundingClientRect().top - navOffset
      )

      logger.info('ui.auth.scroll_to_panel', { trigger: 'start_now' })
      if (reduceMotion) {
        window.scrollTo({ top: targetY, behavior: 'auto' })
        return
      }

      anime({
        targets: [document.scrollingElement || document.documentElement],
        scrollTop: targetY,
        duration: 950,
        easing: 'easeInOutQuart',
      })
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
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <div aria-hidden="true" className="cover-background-rotate pointer-events-none absolute inset-x-0 top-0 h-screen">
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
      <div aria-hidden="true" className="cover-overlay pointer-events-none absolute inset-x-0 top-0 h-screen" />
      <div aria-hidden="true" className="cover-scanlines pointer-events-none absolute inset-x-0 top-0 h-screen" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-screen overflow-hidden">
        <div className="cover-orb cover-orb-1" />
        <div className="cover-orb cover-orb-2" />
        <div className="cover-orb cover-orb-3" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col p-6">
        <header className="sticky top-3 z-40 mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="animate-fade-up">
            <h1 className="animate-pop-in brand-title text-2xl md:text-3xl">Yanex</h1>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300/90">
              DNA checking service
            </p>
          </div>

          <nav className="animate-fade-up flex items-center gap-2">
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
            <TabsList className="cover-tabs-list flex w-full flex-wrap justify-center gap-4 md:justify-end">
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

        {!firebaseStatus.ready ? (
          <section className="mx-auto flex w-full max-w-5xl flex-1 items-center">
            <div className="animate-fade-up cover-glass w-full space-y-4 rounded-3xl p-6 md:p-8">
              <h2 className="text-3xl font-semibold">Firebase setup required</h2>
              <FirebaseConfigWarning
                message={firebaseStatus.message ?? 'Missing required Firebase environment variables.'}
              />
              <DiagnosticsScreen />
            </div>
          </section>
        ) : loading ? (
          <section className="mx-auto flex w-full max-w-5xl flex-1 items-center">
            <div className="animate-fade-up cover-glass w-full rounded-3xl p-8 text-center">
              <p className="text-lg text-slate-100">Checking authentication state...</p>
            </div>
          </section>
        ) : user ? (
          <section className="mx-auto flex w-full max-w-5xl flex-1 items-center">
            <div className="animate-fade-up cover-glass tab-panel-animate w-full space-y-6 rounded-3xl p-6 md:p-8">
              <div key={activeTab} className="tab-content-transition">
                {renderAuthenticatedTab()}
              </div>
            </div>
          </section>
        ) : (
          <>
            <div className="mx-auto w-full max-w-5xl">
              <section className="flex min-h-[calc(100vh-9rem)] items-center justify-center text-center">
                <article className="animate-fade-up mx-auto max-w-3xl">
                  <h2 className="animate-pop-in hero-title text-4xl font-semibold leading-tight md:text-6xl">
                    DNA checking service
                  </h2>
                  <p className="animate-fade-up mx-auto mt-4 max-w-xl text-base text-slate-100/90 md:text-lg">
                    Minimal, fast, and focused.
                  </p>
                  <div className="mt-8 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={scrollToAuth}
                      className="animate-pop-in magnetic cool-cta rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                    >
                      Start Now
                    </button>
                  </div>
                </article>
              </section>
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none relative left-1/2 right-1/2 -mt-20 h-56 w-screen -translate-x-1/2 bg-gradient-to-b from-black/0 via-black/65 to-black"
            />

            <section className="relative left-1/2 right-1/2 -mt-px min-h-[72vh] w-screen -translate-x-1/2 bg-black py-10 md:min-h-[78vh] md:py-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-black via-black/65 to-black/0 md:h-72"
              />
              <div className="relative z-10 mx-auto w-full max-w-5xl px-6">
                <BootstrapHorizontalSections onPrimaryAction={scrollToAuth} />
              </div>
            </section>

            <section className="relative left-1/2 right-1/2 min-h-screen w-screen -translate-x-1/2 overflow-hidden bg-black/70 px-6 py-8 md:py-10">
              <video
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onCanPlay={() => {
                  logger.info('ui.background.bottom_video.ready', { src: BOTTOM_BACKGROUND_VIDEO })
                }}
                onError={() => {
                  logger.warn('ui.background.bottom_video.failed', { src: BOTTOM_BACKGROUND_VIDEO })
                }}
              >
                <source src={BOTTOM_BACKGROUND_VIDEO} type="video/mp4" />
              </video>
              <div aria-hidden="true" className="absolute inset-0 bg-slate-950/55" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-black to-black/45 to-transparent md:h-72"
              />

              <div className="relative z-10 mx-auto w-full max-w-5xl">
                <section id="auth-panel" className="scroll-mt-28 pb-2 pt-2 md:pb-4 md:pt-4">
                  <div className="animate-fade-up mx-auto w-full max-w-xl">
                    <AuthScreen
                      onLogin={login}
                      onRegister={register}
                      onGoogleLogin={loginWithGoogle}
                      busy={loading}
                    />
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowGuestDiagnostics((currentValue) => !currentValue)}
                      className="animate-pop-in magnetic cool-cta rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    >
                      {showGuestDiagnostics ? 'Hide Diagnostics' : 'View Diagnostics'}
                    </button>
                  </div>

                  {showGuestDiagnostics ? (
                    <div className="animate-fade-up tab-panel-animate mx-auto mt-8 w-full max-w-4xl text-left">
                      <DiagnosticsScreen />
                    </div>
                  ) : null}
                </section>
              </div>
            </section>
          </>
        )}

        <footer className="mx-auto w-full max-w-5xl py-3 text-center text-sm text-slate-100/80">
          Imagined &amp; founded by Yan Xing, MSc
        </footer>
      </div>
    </main>
  )
}

export default App
