'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { FitnessPercentiles } from '@/lib/types/social'

type Props = {
  percentiles: FitnessPercentiles
  displayName?: string
}

type RadarEntry = {
  subject: string
  value: number
  fullMark: 100
}

const EMPTY_VALUE = 0

export default function FitnessFingerprint({ percentiles, displayName }: Props) {
  const data: RadarEntry[] = [
    {
      subject: 'Swim',
      value: percentiles.swim ?? EMPTY_VALUE,
      fullMark: 100,
    },
    {
      subject: 'Bike',
      value: percentiles.bike ?? EMPTY_VALUE,
      fullMark: 100,
    },
    {
      subject: 'Run',
      value: percentiles.run ?? EMPTY_VALUE,
      fullMark: 100,
    },
  ]

  const hasData = data.some((d) => d.value > 0)

  return (
    <div className="card-squircle p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Fitness Fingerprint
        </h3>
        {displayName && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{displayName}</p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Age-group percentile ranking
        </p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-500">
          Log workouts to generate your fingerprint
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700"
              />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Radar
                name="Percentile"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value: number) => [`${value}th percentile`, '']}
                contentStyle={{
                  backgroundColor: 'var(--card-bg, #ffffff)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* Legend row */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {data.map((d) => (
              <div key={d.subject} className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">{d.subject}</p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {d.value > 0 ? `${d.value}th` : '—'}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
