'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import DropZone from '@/components/ui/DropZone'
import WorkoutForm from '@/components/forms/WorkoutForm'
import ManualLogForm from '@/components/forms/ManualLogForm'

type Tab = 'workout' | 'manual' | 'upload'

export default function LogPage() {
  const [activeTab, setActiveTab] = useState<Tab>('workout')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'workout', label: 'Log Workout' },
    { key: 'manual', label: 'Manual Data' },
    { key: 'upload', label: 'Upload Files' },
  ]

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Log Data</h1>
        <p className="text-sm text-gray-500 mt-1">
          Record workouts, manual metrics, or upload activity files
        </p>
      </div>

      {/* Tab pills */}
      <div className="flex items-center gap-1 bg-gray-200/50 rounded-2xl p-1.5 mb-8 w-fit">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === key
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'workout' && <WorkoutForm />}
      {activeTab === 'manual' && <ManualLogForm />}
      {activeTab === 'upload' && (
        <Card>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 mb-6">
            Upload Activity Files
          </p>
          <DropZone onFilesSelected={(files) => console.log('Files:', files)} />
          <p className="text-xs text-gray-400 mt-4">
            File parsing will be available in a future update. Files are stored for when parsing is enabled.
          </p>
        </Card>
      )}
    </div>
  )
}
