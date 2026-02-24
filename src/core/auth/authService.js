import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { getFirebaseServices } from '../firebase/app'
import { logger } from '../logging/logger'

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

export async function logout() {
  const { auth } = getFirebaseServices()
  logger.info('auth.logout.attempt', {})
  await signOut(auth)
  logger.info('auth.logout.success', {})
}
