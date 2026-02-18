'use client'

import { useEffect, useCallback, useState } from 'react'
import { X, FileText, PenLine, History } from 'lucide-react'
import type { LabTest, LabCategory } from '@/lib/types/lab-tests'
import { useLabResults } from '@/hooks/useLabResults'
import LabResultLogForm from './LabResultLogForm'
import LabResultHistory from './LabResultHistory'

const categoryAccent: Record<LabCategory, string> = {
  blood_work: 'text-red-500',
  performance_lab: 'text-blue-600',
  diy_home: 'text-green-600',
  genetic: 'text-purple-600',
}

const categoryLabel: Record<LabCategory, string> = {
  blood_work: 'Blood Work',
  performance_lab: 'Performance Lab',
  diy_home: 'DIY / At-Home',
  genetic: 'Genetic / DNA',
}

const priorityStyles: Record<string, { label: string; style: string }> = {
  essential: { label: 'Essential', style: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  recommended: { label: 'Recommended', style: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  optional: { label: 'Optional', style: 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400' },
}

type Tab = 'details' | 'log' | 'history'

const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
  { key: 'details', label: 'Details', icon: FileText },
  { key: 'log', label: 'Log Results', icon: PenLine },
  { key: 'history', label: 'History', icon: History },
]

interface LabTestDetailModalProps {
  test: LabTest | null
  onClose: () => void
}

export default function LabTestDetailModal({ test, onClose }: LabTestDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details')
  const { results, loading: resultsLoading, refetch } = useLabResults(test?.id)

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (test) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [test, handleEscape])

  // Reset tab when test changes
  useEffect(() => {
    setActiveTab('details')
  }, [test?.id])

  if (!test) return null

  const p = priorityStyles[test.priority]

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg h-full overflow-y-auto card-squircle rounded-l-[2.5rem] rounded-r-none"
        style={{ borderRight: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 pr-4">
              <p className={`text-[10px] font-bold uppercase tracking-[2px] ${categoryAccent[test.category]} mb-2`}>
                {categoryLabel[test.category]}
              </p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {test.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === key
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <DetailsTab test={test} priorityStyle={p} />
          )}

          {activeTab === 'log' && (
            <div>
              <LabResultLogForm test={test} onSaved={() => { refetch(); setActiveTab('history') }} />
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {resultsLoading ? (
                <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
              ) : results.length > 0 ? (
                <LabResultHistory results={results} test={test} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">No results logged yet.</p>
                  <button
                    onClick={() => setActiveTab('log')}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Log your first result
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailsTab({ test, priorityStyle }: { test: LabTest; priorityStyle: { label: string; style: string } }) {
  return (
    <>
      {/* Priority & Frequency */}
      <div className="flex items-center gap-2 mb-6">
        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${priorityStyle.style}`}>
          {priorityStyle.label}
        </span>
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          {test.frequency}
        </span>
      </div>

      {/* Description */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
          What It Measures
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {test.description}
        </p>
      </div>

      {/* Why It Matters */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
          Why It Matters for Triathletes
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {test.whyItMatters}
        </p>
      </div>

      {/* Optimal Range (if no submarkers) */}
      {test.optimalRange && !test.submarkers && (
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
            Optimal Range
          </p>
          <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {test.optimalRange}
            </span>
            {test.unit && (
              <span className="text-sm text-gray-400 dark:text-gray-500 ml-2">{test.unit}</span>
            )}
          </div>
        </div>
      )}

      {/* Submarkers */}
      {test.submarkers && test.submarkers.length > 0 && (
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
            Markers & Reference Ranges
          </p>
          <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/50">
            {test.submarkers.map((s) => (
              <div key={s.name} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {s.name}
                  </span>
                  {s.optimalRange && (
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                      {s.optimalRange} {s.unit}
                    </span>
                  )}
                </div>
                {s.notes && (
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">
                    {s.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {test.tags.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
            Related Areas
          </p>
          <div className="flex flex-wrap gap-2">
            {test.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
