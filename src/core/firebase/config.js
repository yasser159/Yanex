import { logger } from '../logging/logger'

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

export function hasFirebaseConfig() {
  return requiredKeys.every((key) => Boolean(import.meta.env[key]))
}

export function getFirebaseConfig() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }

  const missingKeys = requiredKeys.filter((key) => !import.meta.env[key])

  if (missingKeys.length > 0) {
    logger.warn('firebase.config.missing', { missingKeys })
    throw new Error(`Missing Firebase env keys: ${missingKeys.join(', ')}`)
  }

  logger.info('firebase.config.loaded', { projectId: config.projectId })
  return config
}
