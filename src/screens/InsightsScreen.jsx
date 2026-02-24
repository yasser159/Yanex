const INSIGHT_ROWS = [
  { area: 'Ancestry confidence', status: 'Stable', score: '91%' },
  { area: 'Marker quality', status: 'Improving', score: '84%' },
  { area: 'Interpretation readiness', status: 'Stable', score: '88%' },
]

export default function InsightsScreen() {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl">
      <header>
        <h2 className="text-lg font-semibold text-white">Insights</h2>
        <p className="mt-1 text-sm text-slate-400">
          Snapshot of analysis quality and interpretation confidence.
        </p>
      </header>

      <div className="overflow-auto rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="px-3 py-2 font-medium">Insight Area</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/70 text-slate-200">
            {INSIGHT_ROWS.map((row) => (
              <tr key={row.area}>
                <td className="px-3 py-2 font-medium text-slate-100">{row.area}</td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2">{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
