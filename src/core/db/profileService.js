import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getFirebaseServices } from '../firebase/app'
import { logger } from '../logging/logger'

function getUserProfileRef(db, uid) {
  return doc(db, 'users', uid)
}

export async function loadUserProfile(uid) {
  const { db } = getFirebaseServices()
  logger.info('db.profile.load.attempt', { uid })

  const snapshot = await getDoc(getUserProfileRef(db, uid))

  if (!snapshot.exists()) {
    logger.warn('db.profile.load.empty', { uid })
    return null
  }

  const profile = snapshot.data()
  logger.info('db.profile.load.success', { uid })
  return profile
}

export async function saveUserProfile(uid, profilePatch) {
  const { db } = getFirebaseServices()
  logger.info('db.profile.save.attempt', {
    uid,
    keys: Object.keys(profilePatch),
  })

  await setDoc(
    getUserProfileRef(db, uid),
    {
      ...profilePatch,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  logger.info('db.profile.save.success', { uid })
}
