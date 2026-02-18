'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import DropZone from '@/components/ui/DropZone'
import WorkoutForm from '@/components/forms/WorkoutForm'
import ManualLogForm from '@/components/forms/ManualLogForm'
import ParsedWorkoutPreview from '@/components/forms/ParsedWorkoutPreview'
import { parseFile, ParsedWorkout } from '@/lib/parsers'
import { Loader2, AlertCircle } from 'lucide-react'

type Tab = 'workout' | 'manual' | 'upload'

export default function LogPage() {
  const [activeTab, setActiveTab] = useState<Tab>('workout')
  const [parsedWorkouts, setParsedWorkouts] = useState<ParsedWorkout[]>([])
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'workout', label: 'Log Workout' },
    { key: 'manual', label: 'Manual Data' },
    { key: 'upload', label: 'Upload Files' },
  ]

  const handleFilesSelected = async (files: File[]) => {
    setParsing(true)
    setParseError(null)

    try {
      const results: ParsedWorkout[] = []
      for (const file of files) {
        const parsed = await parseFile(file)
        results.push(...parsed)
      }
      setParsedWorkouts((prev) => [...prev, ...results])
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse file')
    } finally {
      setParsing(false)
    }
  }

  const removeWorkout = (index: number) => {
    setParsedWorkouts((prev) => prev.filter((_, i) => i !== index))
  }

  const resetUpload = () => {
    setParsedWorkouts([])
    setParseError(null)
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Log Data</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Record workouts, manual metrics, or upload activity files
        </p>
      </div>

      {/* Tab pills */}
      <div className="flex items-center gap-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-2xl p-1.5 mb-8 w-fit">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === key
                ? 'bg-[var(--card-bg)] shadow-sm text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'workout' && <WorkoutForm />}
      {activeTab === 'manual' && <ManualLogForm />}
      {activeTab === 'upload' && (
        <div className="flex flex-col gap-6">
          {parsedWorkouts.length === 0 && (
            <Card>
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-6">
                Upload Activity Files
              </p>
              <DropZone onFilesSelected={handleFilesSelected} />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                Supports .fit, .tcx, .gpx, and .csv files from Garmin, Wahoo, Suunto, COROS, Polar, Strava, and more.
              </p>
            </Card>
          )}

          {/* Parsing spinner */}
          {parsing && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 size={20} className="animate-spin text-blue-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Parsing files...</span>
            </div>
          )}

          {/* Error banner */}
          {parseError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{parseError}</p>
            </div>
          )}

          {/* Parsed workout previews */}
          {parsedWorkouts.map((workout, i) => (
            <ParsedWorkoutPreview
              key={`${workout.source_file}-${i}`}
              workout={workout}
              onSaved={() => removeWorkout(i)}
              onDiscard={() => removeWorkout(i)}
            />
          ))}

          {/* Upload More button */}
          {parsedWorkouts.length > 0 && !parsing && (
            <button
              onClick={resetUpload}
              className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
            >
              Upload More Files
            </button>
          )}
        </div>
      )}
    </div>
  )
}
