import { useEffect, useMemo, useState } from 'react'
import { logger } from '../core/logging/logger'
import { DNA_MARKERS, filterDnaMarkers, getDnaFilterOptions } from '../core/search/dnaSearchService'

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'impact', label: 'Impact score' },
  { value: 'confidence', label: 'Confidence' },
  { value: 'marker', label: 'Marker name' },
]

function renderClinicalTag(isClinical) {
  return isClinical ? (
    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-200">Clinical</span>
  ) : (
    <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-xs text-slate-300">Research</span>
  )
}

export default function SearchScreen() {
  const filterOptions = useMemo(() => getDnaFilterOptions(DNA_MARKERS), [])

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [confidence, setConfidence] = useState('All')
  const [chromosome, setChromosome] = useState('All')
  const [clinicalOnly, setClinicalOnly] = useState(false)
  const [minImpactScore, setMinImpactScore] = useState(0)
  const [sortBy, setSortBy] = useState('relevance')

  const results = useMemo(
    () =>
      filterDnaMarkers(DNA_MARKERS, {
        query,
        category,
        confidence,
        chromosome,
        clinicalOnly,
        minImpactScore,
        sortBy,
      }),
    [category, chromosome, clinicalOnly, confidence, minImpactScore, query, sortBy],
  )

  useEffect(() => {
    logger.info('ui.search.filters.updated', {
      query,
      category,
      confidence,
      chromosome,
      clinicalOnly,
      minImpactScore,
      sortBy,
      resultCount: results.length,
    })
  }, [category, chromosome, clinicalOnly, confidence, minImpactScore, query, results.length, sortBy])

  function clearFilters() {
    setQuery('')
    setCategory('All')
    setConfidence('All')
    setChromosome('All')
    setClinicalOnly(false)
    setMinImpactScore(0)
    setSortBy('relevance')
  }

  return (
    <section className="space-y-5 rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl">
      <header>
        <h2 className="text-lg font-semibold text-white">Search DNA Markers</h2>
        <p className="mt-1 text-sm text-slate-400">
          Use multi-filter DNA tools to narrow genes by chromosome, clinical relevance, confidence, and impact score.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-slate-400">Free text</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-400/70 focus:ring"
            placeholder="BRCA1, neuro, methylation"
            type="search"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-slate-400">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-400/70 focus:ring"
          >
            <option value="All">All</option>
            {filterOptions.categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-slate-400">Confidence</span>
          <select
            value={confidence}
            onChange={(event) => setConfidence(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-400/70 focus:ring"
          >
            <option value="All">All</option>
            {filterOptions.confidenceLevels.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-slate-400">Chromosome</span>
          <select
            value={chromosome}
            onChange={(event) => setChromosome(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-400/70 focus:ring"
          >
            <option value="All">All</option>
            {filterOptions.chromosomes.map((option) => (
              <option key={option} value={option}>
                Chr {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Minimum impact score: <strong className="text-slate-200">{minImpactScore}</strong>
          </span>
          <input
            value={minImpactScore}
            onChange={(event) => setMinImpactScore(Number(event.target.value))}
            className="w-full accent-emerald-400"
            type="range"
            min={0}
            max={100}
            step={1}
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-wide text-slate-400">Sort by</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-400/70 focus:ring"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={clinicalOnly}
            onChange={(event) => setClinicalOnly(event.target.checked)}
            className="h-4 w-4 accent-emerald-400"
          />
          Clinical markers only
        </label>

        <button
          type="button"
          onClick={clearFilters}
          className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"
        >
          Clear filters
        </button>

        <p className="text-sm text-slate-300">
          <strong className="text-white">{results.length}</strong> result{results.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="overflow-auto rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="px-3 py-2 font-medium">Marker</th>
              <th className="px-3 py-2 font-medium">Chromosome</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Confidence</th>
              <th className="px-3 py-2 font-medium">Impact</th>
              <th className="px-3 py-2 font-medium">Class</th>
              <th className="px-3 py-2 font-medium">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/70 text-slate-200">
            {results.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-slate-400" colSpan={7}>
                  No markers found for current filters.
                </td>
              </tr>
            ) : (
              results.map((result) => (
                <tr key={result.marker}>
                  <td className="px-3 py-2 font-medium text-slate-100">
                    <div>{result.marker}</div>
                    <div className="text-xs text-slate-400">{result.description}</div>
                  </td>
                  <td className="px-3 py-2">Chr {result.chromosome}</td>
                  <td className="px-3 py-2">{result.category}</td>
                  <td className="px-3 py-2">{result.confidence}</td>
                  <td className="px-3 py-2">{result.impactScore}</td>
                  <td className="px-3 py-2">{renderClinicalTag(result.clinical)}</td>
                  <td className="px-3 py-2 text-xs text-slate-300">{result.tags.join(', ')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
