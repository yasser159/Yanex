import {
  browserPopupRedirectResolver,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { getFirebaseServices } from '../firebase/app'
import { logger } from '../logging/logger'

function shouldPreferRedirectFlow() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }

  const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent)
  const isEmbeddedWebView = /FBAN|FBAV|Instagram|Line|wv/i.test(navigator.userAgent)

  return isIOS || isEmbeddedWebView
}

export function subscribeToAuthState(listener) {
  logger.info('auth.subscribe.start', {})
  const { auth } = getFirebaseServices()

  return onAuthStateChanged(auth, (user) => {
    logger.info('auth.state.changed', {
      isAuthenticated: Boolean(user),
      uid: user?.uid ?? null,
    })
    listener(user)
  })
}

export async function registerWithEmailPassword(email, password) {
  const { auth } = getFirebaseServices()
  logger.info('auth.register.attempt', { email })

  const result = await createUserWithEmailAndPassword(auth, email, password)
  logger.info('auth.register.success', { uid: result.user.uid })
  return result.user
}

export async function loginWithEmailPassword(email, password) {
  const { auth } = getFirebaseServices()
  logger.info('auth.login.attempt', { email })

  const result = await signInWithEmailAndPassword(auth, email, password)
  logger.info('auth.login.success', { uid: result.user.uid })
  return result.user
}

export async function loginWithGoogle() {
  const { auth } = getFirebaseServices()
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  logger.info('auth.google.login.attempt', {})

  if (shouldPreferRedirectFlow()) {
    logger.info('auth.google.login.redirect_preferred', {
      host: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    })
    await signInWithRedirect(auth, provider, browserPopupRedirectResolver)
    logger.info('auth.google.login.redirect_started', {})
    return null
  }

  try {
    const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver)
    logger.info('auth.google.login.success', { uid: result.user.uid, mode: 'popup' })
    return result.user
  } catch (error) {
    const errorCode = typeof error === 'object' && error !== null ? error.code : 'unknown'
    logger.warn('auth.google.login.popup_failed', { errorCode })

    // Fallback for browsers/environments where popup auth is brittle.
    const shouldFallbackToRedirect = [
      'auth/popup-blocked',
      'auth/popup-closed-by-user',
      'auth/cancelled-popup-request',
      'auth/operation-not-supported-in-this-environment',
    ].includes(errorCode)

    if (shouldFallbackToRedirect) {
      await signInWithRedirect(auth, provider, browserPopupRedirectResolver)
      logger.info('auth.google.login.redirect_started', {})
      return null
    }

    throw error
  }
}

export async function logout() {
  const { auth } = getFirebaseServices()
  logger.info('auth.logout.attempt', {})
  await signOut(auth)
  logger.info('auth.logout.success', {})
}
