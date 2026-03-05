'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, FileCheck, Loader2, AlertCircle, X, CheckCircle2 } from 'lucide-react'

interface FitUploadDropzoneProps {
  onUploaded?: () => void
}

export default function FitUploadDropzone({ onUploaded }: FitUploadDropzoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ count: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Strava connection state
  const [stravaConnected, setStravaConnected] = useState<boolean | null>(null)
  const [stravaJustConnected, setStravaJustConnected] = useState(false)

  useEffect(() => {
    // Check for ?strava=connected in URL (safe to read after mount)
    const params = new URLSearchParams(window.location.search)
    if (params.get('strava') === 'connected') {
      setStravaJustConnected(true)
      params.delete('strava')
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : '')
      window.history.replaceState(null, '', newUrl)
    }

    // Fetch existing integrations
    fetch('/api/integrations')
      .then((r) => r.json())
      .then((data: { provider: string; sync_status: string }[]) => {
        const strava = data.find((c) => c.provider === 'strava')
        setStravaConnected(!!strava && strava.sync_status === 'active')
      })
      .catch(() => setStravaConnected(false))
  }, [])

  const validExtensions = ['fit', 'tcx', 'gpx', 'csv']

  function validateFile(file: File): boolean {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !validExtensions.includes(ext)) {
      setError(`Unsupported format: .${ext || 'unknown'}. Use .fit, .tcx, .gpx, or .csv`)
      return false
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum 50MB.')
      return false
    }
    return true
  }

  async function uploadFile(file: File) {
    if (!validateFile(file)) return

    setUploading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/import', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Upload failed')
      } else if (data.count === 0 && data.insert_errors?.length > 0) {
        setError(`Parsed ${data.parsed_count} workouts but insert failed: ${data.insert_errors[0]}`)
      } else {
        setResult({ count: data.count })
        onUploaded?.()
      }
    } catch {
      setError('Upload failed. Please try again.')
    }

    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ''
  }

  const isStravaActive = stravaConnected || stravaJustConnected

  return (
    <div className="card-squircle p-6">
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
        Import Workout
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          dragActive
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".fit,.tcx,.gpx,.csv"
          onChange={handleFileInput}
          className="hidden"
        />

        {uploading ? (
          <>
            <Loader2 size={24} className="text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-500">Processing file...</p>
          </>
        ) : result ? (
          <>
            <FileCheck size={24} className="text-green-500 mb-2" />
            <p className="text-sm font-medium text-green-600">
              {result.count} workout{result.count !== 1 ? 's' : ''} imported
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); setResult(null) }}
              className="mt-2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Upload another
            </button>
          </>
        ) : (
          <>
            <Upload size={24} className="text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Drop a file or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">.fit, .tcx, .gpx, .csv</p>
          </>
        )}
      </div>

      {/* Strava connect section */}
      <div className="mt-3 flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116z" fill="#FC4C02" />
          <path d="M11.584 13.828l2.089 4.116 2.084-4.116h-4.173zM9.234 9.712l2.35 4.116h4.173L13.407 9.712h-4.173z" fill="#FC4C02" opacity="0.6" />
          <path d="M3.449 13.828L6.254 19l2.805-5.172H3.449zM6.254 9.712L3.449 13.828h5.61L6.254 9.712z" fill="#FC4C02" />
        </svg>

        {stravaConnected === null ? (
          <span className="text-sm text-gray-400">Checking Strava...</span>
        ) : isStravaActive ? (
          <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
            <CheckCircle2 size={16} />
            Strava synced
          </span>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Sync from Strava</p>
            <button
              onClick={() => { window.location.href = '/api/strava/auth' }}
              className="text-sm font-semibold text-[#FC4C02] hover:underline cursor-pointer"
            >
              Connect Strava
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="cursor-pointer">
            <X size={14} className="text-red-400" />
          </button>
        </div>
      )}
    </div>
  )
}
