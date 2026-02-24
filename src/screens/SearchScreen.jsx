import { useMemo, useState } from 'react'

const MOCK_MARKERS = [
  { marker: 'BRCA1', category: 'Risk', confidence: 'High' },
  { marker: 'MTHFR', category: 'Metabolism', confidence: 'Medium' },
  { marker: 'APOE', category: 'Neurology', confidence: 'High' },
  { marker: 'CYP2C19', category: 'Drug Response', confidence: 'High' },
]

export default function SearchScreen() {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return MOCK_MARKERS
    }
    return MOCK_MARKERS.filter((row) =>
      `${row.marker} ${row.category} ${row.confidence}`.toLowerCase().includes(normalizedQuery),
    )
  }, [query])

  return (
    <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl">
      <header>
        <h2 className="text-lg font-semibold text-white">Search DNA Markers</h2>
        <p className="mt-1 text-sm text-slate-400">Find genes, marker groups, and confidence tiers.</p>
      </header>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-400/70 focus:ring"
        placeholder="Search BRCA1, metabolism, high confidence..."
        type="search"
      />

      <div className="overflow-auto rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="px-3 py-2 font-medium">Marker</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/70 text-slate-200">
            {results.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-400" colSpan={3}>
                  No results found.
                </td>
              </tr>
            ) : (
              results.map((result) => (
                <tr key={result.marker}>
                  <td className="px-3 py-2 font-medium text-slate-100">{result.marker}</td>
                  <td className="px-3 py-2">{result.category}</td>
                  <td className="px-3 py-2">{result.confidence}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
