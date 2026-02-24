import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockAuth = { id: 'mock-auth' }
const mockProviderInstance = {
  setCustomParameters: vi.fn(),
}

const signInWithPopupMock = vi.fn()
const signInWithRedirectMock = vi.fn()
const googleAuthProviderCtorMock = vi.fn(function GoogleAuthProviderMock() {
  return mockProviderInstance
})

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: googleAuthProviderCtorMock,
  browserPopupRedirectResolver: { resolver: 'mock' },
  signInWithPopup: signInWithPopupMock,
  signInWithRedirect: signInWithRedirectMock,
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('../firebase/app', () => ({
  getFirebaseServices: vi.fn(() => ({ auth: mockAuth })),
}))

vi.mock('../logging/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('loginWithGoogle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('uses popup flow on localhost when popup succeeds', async () => {
    vi.stubGlobal('window', { location: { hostname: 'localhost' } })
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0' })

    const mockUser = { uid: 'user-1' }
    signInWithPopupMock.mockResolvedValueOnce({ user: mockUser })

    const { loginWithGoogle } = await import('./authService')
    const result = await loginWithGoogle()

    expect(googleAuthProviderCtorMock).toHaveBeenCalledTimes(1)
    expect(mockProviderInstance.setCustomParameters).toHaveBeenCalledWith({ prompt: 'select_account' })
    expect(signInWithPopupMock).toHaveBeenCalledTimes(1)
    expect(signInWithRedirectMock).not.toHaveBeenCalled()
    expect(result).toEqual(mockUser)
  })

  it('falls back to redirect when popup is blocked', async () => {
    vi.stubGlobal('window', { location: { hostname: 'localhost' } })
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0' })

    signInWithPopupMock.mockRejectedValueOnce({ code: 'auth/popup-blocked' })
    signInWithRedirectMock.mockResolvedValueOnce(undefined)

    const { loginWithGoogle } = await import('./authService')
    const result = await loginWithGoogle()

    expect(signInWithPopupMock).toHaveBeenCalledTimes(1)
    expect(signInWithRedirectMock).toHaveBeenCalledTimes(1)
    expect(result).toBeNull()
  })

  it('uses popup flow on non-localhost desktop browsers', async () => {
    vi.stubGlobal('window', { location: { hostname: 'yanex-d2d34.web.app' } })
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0' })

    const mockUser = { uid: 'user-2' }
    signInWithPopupMock.mockResolvedValueOnce({ user: mockUser })

    const { loginWithGoogle } = await import('./authService')
    const result = await loginWithGoogle()

    expect(signInWithPopupMock).toHaveBeenCalledTimes(1)
    expect(signInWithRedirectMock).not.toHaveBeenCalled()
    expect(result).toEqual(mockUser)
  })

  it('prefers redirect flow on iOS user agents', async () => {
    vi.stubGlobal('window', { location: { hostname: 'localhost' } })
    vi.stubGlobal('navigator', { userAgent: 'iPhone OS 17_0 like Mac OS X' })

    signInWithRedirectMock.mockResolvedValueOnce(undefined)

    const { loginWithGoogle } = await import('./authService')
    const result = await loginWithGoogle()

    expect(signInWithPopupMock).not.toHaveBeenCalled()
    expect(signInWithRedirectMock).toHaveBeenCalledTimes(1)
    expect(result).toBeNull()
  })
})
