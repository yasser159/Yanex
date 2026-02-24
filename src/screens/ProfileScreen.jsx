import { useEffect, useState } from 'react'
import { loadUserProfile, saveUserProfile } from '../core/db/profileService'
import { logger } from '../core/logging/logger'

export default function ProfileScreen({ user }) {
  const [dnaMarkerThreshold, setDnaMarkerThreshold] = useState('')
  const [sampleObservationNote, setSampleObservationNote] = useState('')
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

        const markerValue = profile.dnaMarkerThreshold
        const noteValue = profile.sampleObservationNote
        setDnaMarkerThreshold(markerValue ? String(markerValue) : '')
        setSampleObservationNote(noteValue ?? '')
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
        dnaMarkerThreshold: dnaMarkerThreshold ? Number(dnaMarkerThreshold) : null,
        sampleObservationNote,
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
        <h2 className="text-lg font-semibold text-white">DNA Service Profile (Firestore)</h2>
        <p className="mt-1 text-sm text-slate-400">Signed in as {user.email}</p>
      </header>

      <form className="space-y-4" onSubmit={onSave}>
        <div>
          <label className="mb-1 block text-sm text-slate-300" htmlFor="dna-marker-threshold">
            DNA marker threshold
          </label>
          <input
            id="dna-marker-threshold"
            type="number"
            min="0"
            step="1"
            value={dnaMarkerThreshold}
            onChange={(event) => setDnaMarkerThreshold(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-400/70 focus:ring"
            placeholder="42"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300" htmlFor="sample-observation-note">
            Sample observation note
          </label>
          <textarea
            id="sample-observation-note"
            value={sampleObservationNote}
            onChange={(event) => setSampleObservationNote(event.target.value)}
            className="min-h-24 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-400/70 focus:ring"
            placeholder="Marker panel indicates stable baseline variance."
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
