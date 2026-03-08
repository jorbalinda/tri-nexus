'use client'

import { useMemo, useState } from 'react'
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
} from 'recharts'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useProfile } from '@/hooks/useProfile'
import {
  calculateCTLSeries,
  calculateATLSeries,
  calculateTSBSeries,
  calculateDisciplineSeries,
  estimateTSS,
} from '@/lib/analytics/training-stress'
import type { Workout } from '@/lib/types/database'

type SportFilter = 'all' | 'swim' | 'bike' | 'run'

const FILTER_OPTIONS: { value: SportFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'swim', label: 'Swim' },
  { value: 'bike', label: 'Bike' },
  { value: 'run', label: 'Run' },
]

function weeklyVolumeByDiscipline(workouts: Workout[]): { week: string; swim: number; bike: number; run: number }[] {
  const weekMap = new Map<string, { swim: number; bike: number; run: number }>()

  workouts.forEach((w) => {
    const d = new Date(w.date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    const weekKey = monday.toISOString().split('T')[0]
    const hours = (w.duration_seconds || 0) / 3600

    const existing = weekMap.get(weekKey) || { swim: 0, bike: 0, run: 0 }
    if (w.sport === 'swim') existing.swim += hours
    else if (w.sport === 'bike') existing.bike += hours
    else if (w.sport === 'run') existing.run += hours
    weekMap.set(weekKey, existing)
  })

  return Array.from(weekMap.entries())
    .map(([week, v]) => ({
      week,
      swim: Number(v.swim.toFixed(2)),
      bike: Number(v.bike.toFixed(2)),
      run: Number(v.run.toFixed(2)),
    }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12)
}

export default function FitnessTrends() {
  const { workouts, loading } = useWorkouts()
  const { profile } = useProfile()
  const [sportFilter, setSportFilter] = useState<SportFilter>('all')

  const stressData = useMemo(() => {
    if (workouts.length === 0) return []

    let ctl, atl, tsb

    if (sportFilter === 'all') {
      ctl = calculateCTLSeries(workouts, profile)
      atl = calculateATLSeries(workouts, profile)
      tsb = calculateTSBSeries(workouts, profile)
    } else {
      const series = calculateDisciplineSeries(workouts, profile)
      const discipline = series[sportFilter]
      ctl = discipline.ctl
      atl = discipline.atl
      tsb = discipline.tsb
    }

    // Build daily TSS map for bars
    const filteredWorkouts = sportFilter === 'all'
      ? workouts
      : workouts.filter((w) => w.sport === sportFilter)

    const dailyTSSMap = new Map<string, number>()
    filteredWorkouts.forEach((w) => {
      const existing = dailyTSSMap.get(w.date) || 0
      dailyTSSMap.set(w.date, existing + estimateTSS(w, profile))
    })

    const atlMap = new Map(atl.map((p) => [p.date, p.value]))
    const tsbMap = new Map(tsb.map((p) => [p.date, p.value]))

    return ctl.slice(-90).map((p) => ({
      date: p.date,
      CTL: p.value,
      ATL: atlMap.get(p.date) || 0,
      TSB: tsbMap.get(p.date) || 0,
      TSS: dailyTSSMap.get(p.date) || 0,
    }))
  }, [workouts, profile, sportFilter])

  const volumeData = useMemo(() => weeklyVolumeByDiscipline(workouts), [workouts])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-squircle p-5">
          <div className="h-56 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
        <div className="card-squircle p-5">
          <div className="h-56 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (workouts.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CTL/ATL/TSB Chart with daily TSS bars */}
      {stressData.length > 0 && (
        <div className="card-squircle p-5">
          <p className="text-[11px] font-black uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
            Fitness / Fatigue / Form
          </p>

          {/* Sport filter pills */}
          <div className="flex items-center gap-1.5 mb-3">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSportFilter(opt.value)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                  sportFilter === opt.value
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: 'rgba(251,133,0,0.4)' }} />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">TSS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 rounded-full inline-block" style={{ height: 2, background: '#219ebc' }} />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">CTL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 rounded-full inline-block" style={{ height: 2, background: '#e63946' }} />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">ATL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 inline-block" style={{ borderTop: '2px dashed #4cc9a0', height: 0 }} />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">TSB</span>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stressData}>
                <CartesianGrid stroke="var(--grid-stroke)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={(d: string) => d.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  width={30}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--tooltip-bg)',
                    border: `1px solid var(--tooltip-border)`,
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar yAxisId="right" dataKey="TSS" fill="#94a3b8" opacity={0.45} name="Daily TSS" />
                <Line yAxisId="left" type="monotone" dataKey="CTL" stroke="#219ebc" strokeWidth={2} dot={false} name="Fitness (CTL)" />
                <Line yAxisId="left" type="monotone" dataKey="ATL" stroke="#e63946" strokeWidth={2} dot={false} name="Fatigue (ATL)" />
                <Line yAxisId="left" type="monotone" dataKey="TSB" stroke="#4cc9a0" strokeWidth={1.5} dot={false} name="Form (TSB)" strokeDasharray="4 2" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Weekly Volume by Discipline */}
      {volumeData.length > 0 && (
        <div className="card-squircle p-5">
          <p className="text-[11px] font-black uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
            Weekly Volume (hours)
          </p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: 'rgba(33,158,188,0.55)', border: '1.5px solid #219ebc' }} />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Swim</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: 'rgba(251,133,0,0.55)', border: '1.5px solid #fb8500' }} />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Bike</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: 'rgba(76,201,160,0.55)', border: '1.5px solid #4cc9a0' }} />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Run</span>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <CartesianGrid stroke="var(--grid-stroke)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={(d: string) => d.slice(5)}
                />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} width={30} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--tooltip-bg)',
                    border: `1px solid var(--tooltip-border)`,
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="swim" stackId="a" fill="#219ebc" fillOpacity={0.55} stroke="#219ebc" strokeWidth={1.5} strokeOpacity={1} radius={[0, 0, 0, 0]} name="Swim" />
                <Bar dataKey="bike" stackId="a" fill="#fb8500" fillOpacity={0.55} stroke="#fb8500" strokeWidth={1.5} strokeOpacity={1} radius={[0, 0, 0, 0]} name="Bike" />
                <Bar dataKey="run" stackId="a" fill="#4cc9a0" fillOpacity={0.55} stroke="#4cc9a0" strokeWidth={1.5} strokeOpacity={1} radius={[4, 4, 0, 0]} name="Run" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly totals — most recent week */}
          {(() => {
            const latest = volumeData[volumeData.length - 1]
            if (!latest) return null
            const total = Number((latest.swim + latest.bike + latest.run).toFixed(2))
            return (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-xs font-bold" style={{ color: '#219ebc' }}>{latest.swim.toFixed(2)}h</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Swim</p>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: '#fb8500' }}>{latest.bike.toFixed(2)}h</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Bike</p>
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: '#4cc9a0' }}>{latest.run.toFixed(2)}h</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Run</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{total.toFixed(2)}h</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Total</p>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
