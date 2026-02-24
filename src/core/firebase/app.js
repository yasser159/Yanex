import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFirebaseConfig, hasFirebaseConfig } from './config'
import { logger } from '../logging/logger'

let cachedServices = null

export function getFirebaseServices() {
  if (cachedServices) {
    return cachedServices
  }

  const firebaseConfig = getFirebaseConfig()
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

  if (getApps().length === 1) {
    logger.info('firebase.app.initialized', { projectId: firebaseConfig.projectId })
  }

  cachedServices = {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  }

  return cachedServices
}

export function getFirebaseStatus() {
  if (!hasFirebaseConfig()) {
    return {
      ready: false,
      reason: 'missing_env',
    }
  }

  try {
    getFirebaseServices()
    return { ready: true }
  } catch (error) {
    logger.error('firebase.app.failed', {
      message: error instanceof Error ? error.message : 'Unknown firebase error',
    })

    return {
      ready: false,
      reason: 'initialization_failed',
      message: error instanceof Error ? error.message : 'Unknown firebase error',
    }
  }
}
