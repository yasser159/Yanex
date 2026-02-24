import { useEffect, useState } from 'react'
import { loadUserProfile, saveUserProfile } from '../core/db/profileService'
import { logger } from '../core/logging/logger'

export default function ProfileScreen({ user }) {
  const [dailyGlucoseTarget, setDailyGlucoseTarget] = useState('')
  const [lastReadingNote, setLastReadingNote] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchProfile() {
      setLoading(true)
      try {
        const profile = await loadUserProfile(user.uid)
        if (!mounted || !profile) {
          return
        }

        setDailyGlucoseTarget(profile.dailyGlucoseTarget ? String(profile.dailyGlucoseTarget) : '')
        setLastReadingNote(profile.lastReadingNote ?? '')
      } catch (error) {
        logger.error('ui.profile.load.failed', {
          message: error instanceof Error ? error.message : 'Failed to load profile',
        })
        setStatusMessage('Could not load profile from database.')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      mounted = false
    }
  }, [user.uid])

  async function onSave(event) {
    event.preventDefault()
    setStatusMessage('')

    try {
      await saveUserProfile(user.uid, {
        dailyGlucoseTarget: dailyGlucoseTarget ? Number(dailyGlucoseTarget) : null,
        lastReadingNote,
      })
      setStatusMessage('Profile saved to Firestore.')
    } catch (error) {
      logger.error('ui.profile.save.failed', {
        message: error instanceof Error ? error.message : 'Failed to save profile',
      })
      setStatusMessage('Save failed. Check diagnostics logs.')
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl">
      <header>
        <h2 className="text-lg font-semibold text-white">Health Profile (Firestore)</h2>
        <p className="mt-1 text-sm text-slate-400">Signed in as {user.email}</p>
      </header>

      <form className="space-y-4" onSubmit={onSave}>
        <div>
          <label className="mb-1 block text-sm text-slate-300" htmlFor="glucose-target">
            Daily glucose target
          </label>
          <input
            id="glucose-target"
            type="number"
            min="0"
            step="1"
            value={dailyGlucoseTarget}
            onChange={(event) => setDailyGlucoseTarget(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-400/70 focus:ring"
            placeholder="95"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300" htmlFor="reading-note">
            Last reading note
          </label>
          <textarea
            id="reading-note"
            value={lastReadingNote}
            onChange={(event) => setLastReadingNote(event.target.value)}
            className="min-h-24 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-400/70 focus:ring"
            placeholder="Before lunch reading looked stable."
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
        >
          Save profile
        </button>
      </form>

      {statusMessage ? <p className="text-sm text-slate-300">{statusMessage}</p> : null}
      {loading ? <p className="text-sm text-slate-500">Loading profile...</p> : null}
    </section>
  )
}
