import { useEffect, useState } from 'react'
import { diagnosticsStore } from '../core/diagnostics/diagnosticsStore'

const levelClassMap = {
  info: 'text-emerald-300',
  warn: 'text-amber-300',
  error: 'text-rose-300',
}

export default function DiagnosticsScreen() {
  const [entries, setEntries] = useState(diagnosticsStore.getEntries())

  useEffect(() => {
    return diagnosticsStore.subscribe((nextEntries) => {
      setEntries(nextEntries)
    })
  }, [])

  return (
    <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Diagnostics</h2>
        <button
          type="button"
          onClick={() => diagnosticsStore.clear()}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-100 hover:bg-slate-800"
        >
          Clear
        </button>
      </div>

      <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="px-3 py-2 font-medium">Time</th>
              <th className="px-3 py-2 font-medium">Level</th>
              <th className="px-3 py-2 font-medium">Event</th>
              <th className="px-3 py-2 font-medium">Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/70 text-slate-200">
            {entries.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-400" colSpan={4}>
                  No logs yet.
                </td>
              </tr>
            ) : (
              [...entries]
                .reverse()
                .map((entry) => (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-400">{entry.timestamp}</td>
                    <td className={`px-3 py-2 uppercase ${levelClassMap[entry.level] ?? 'text-slate-300'}`}>
                      {entry.level}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-100">{entry.event}</td>
                    <td className="px-3 py-2 text-xs text-slate-400">
                      <pre className="overflow-auto whitespace-pre-wrap">{JSON.stringify(entry.payload, null, 2)}</pre>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
