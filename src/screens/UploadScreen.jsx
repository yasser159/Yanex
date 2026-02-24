import { useState } from 'react'
import { logger } from '../core/logging/logger'

export default function UploadScreen() {
  const [sampleType, setSampleType] = useState('saliva')
  const [statusMessage, setStatusMessage] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('')

  function onFileChange(event) {
    const file = event.target.files?.[0]
    setSelectedFileName(file?.name ?? '')
  }

  function onSubmit(event) {
    event.preventDefault()
    logger.info('ui.upload.submit', {
      sampleType,
      fileName: selectedFileName || null,
    })
    setStatusMessage('Upload request queued. Processing pipeline will start after backend integration.')
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl">
      <header>
        <h2 className="text-lg font-semibold text-white">Upload DNA File</h2>
        <p className="mt-1 text-sm text-slate-400">Submit raw DNA data for parsing and indexing.</p>
      </header>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm text-slate-300" htmlFor="sample-type">
            Sample type
          </label>
          <select
            id="sample-type"
            value={sampleType}
            onChange={(event) => setSampleType(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-emerald-400/70 focus:ring"
          >
            <option value="saliva">Saliva</option>
            <option value="blood">Blood</option>
            <option value="swab">Buccal swab</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300" htmlFor="dna-file">
            DNA file
          </label>
          <input
            id="dna-file"
            type="file"
            accept=".vcf,.txt,.csv"
            onChange={onFileChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-500 file:px-3 file:py-1 file:font-medium file:text-emerald-950 hover:file:bg-emerald-400"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-emerald-950 transition hover:bg-emerald-400"
        >
          Upload sample
        </button>
      </form>

      {statusMessage ? <p className="text-sm text-slate-300">{statusMessage}</p> : null}
    </section>
  )
}
