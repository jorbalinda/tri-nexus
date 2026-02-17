'use client'

import type { LabResultWithMarkers } from '@/lib/types/database'
import type { LabTest } from '@/lib/types/lab-tests'

interface LabResultHistoryProps {
  results: LabResultWithMarkers[]
  test: LabTest
}

export default function LabResultHistory({ results, test }: LabResultHistoryProps) {
  if (results.length === 0) return null

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
        History — {test.shortName}
      </p>
      <div className="space-y-3">
        {results.map((result, idx) => {
          const prev = results[idx + 1] // previous entry (older)
          return (
            <div
              key={result.id}
              className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
            >
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {formatDate(result.date)}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                {result.lab_result_markers.map((marker) => {
                  const prevMarker = prev?.lab_result_markers.find(
                    (m) => m.marker_name === marker.marker_name
                  )
                  const trend = prevMarker ? getTrend(marker.value, prevMarker.value) : null
                  return (
                    <div key={marker.id} className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {marker.value}
                      </span>
                      {marker.unit && (
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                          {marker.unit}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {marker.marker_name}
                      </span>
                      {trend && (
                        <span className={`text-xs ${trend.color}`}>{trend.arrow}</span>
                      )}
                    </div>
                  )
                })}
              </div>
              {result.notes && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">
                  {result.notes}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getTrend(current: number, previous: number): { arrow: string; color: string } | null {
  if (current === previous) return null
  if (current > previous) return { arrow: '\u2191', color: 'text-green-500' }
  return { arrow: '\u2193', color: 'text-red-500' }
}
