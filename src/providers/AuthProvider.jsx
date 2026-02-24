import { useEffect, useMemo, useState } from 'react'
import {
  loginWithEmailPassword,
  logout,
  registerWithEmailPassword,
  subscribeToAuthState,
} from '../core/auth/authService'
import { getFirebaseStatus } from '../core/firebase/app'
import { AuthContext } from './AuthContext'
import { logger } from '../core/logging/logger'

export function AuthProvider({ children }) {
  const firebaseStatus = useMemo(() => getFirebaseStatus(), [])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(firebaseStatus.ready)

  useEffect(() => {
    if (!firebaseStatus.ready) {
      logger.warn('auth.provider.unavailable', firebaseStatus)
      return () => {}
    }

    const unsubscribe = subscribeToAuthState((nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })

    return unsubscribe
  }, [firebaseStatus])

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(email, password) {
        try {
          return await loginWithEmailPassword(email, password)
        } catch (error) {
          logger.error('auth.login.failed', {
            message: error instanceof Error ? error.message : 'Unknown login error',
          })
          throw error
        }
      },
      async register(email, password) {
        try {
          return await registerWithEmailPassword(email, password)
        } catch (error) {
          logger.error('auth.register.failed', {
            message: error instanceof Error ? error.message : 'Unknown registration error',
          })
          throw error
        }
      },
      async logout() {
        try {
          return await logout()
        } catch (error) {
          logger.error('auth.logout.failed', {
            message: error instanceof Error ? error.message : 'Unknown logout error',
          })
          throw error
        }
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
