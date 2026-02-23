'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useWorkouts } from '@/hooks/useWorkouts'
import {
  calculateCTLSeries,
  calculateATLSeries,
  calculateTSBSeries,
  weeklyVolume,
} from '@/lib/analytics/training-stress'
import type { Workout } from '@/lib/types/database'

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
      swim: Number(v.swim.toFixed(1)),
      bike: Number(v.bike.toFixed(1)),
      run: Number(v.run.toFixed(1)),
    }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12)
}

export default function FitnessTrends() {
  const { workouts, loading } = useWorkouts()

  const stressData = useMemo(() => {
    if (workouts.length === 0) return []
    const ctl = calculateCTLSeries(workouts)
    const atl = calculateATLSeries(workouts)
    const tsb = calculateTSBSeries(workouts)

    const atlMap = new Map(atl.map((p) => [p.date, p.value]))
    const tsbMap = new Map(tsb.map((p) => [p.date, p.value]))

    return ctl.slice(-60).map((p) => ({
      date: p.date,
      CTL: p.value,
      ATL: atlMap.get(p.date) || 0,
      TSB: tsbMap.get(p.date) || 0,
    }))
  }, [workouts])

  const volumeData = useMemo(() => weeklyVolumeByDiscipline(workouts), [workouts])

  if (loading) {
    return (
      <div className="card-squircle p-6">
        <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (workouts.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      {/* CTL/ATL/TSB Chart */}
      {stressData.length > 0 && (
        <div className="card-squircle p-6">
          <p className="text-[11px] font-black uppercase tracking-[2px] text-gray-600 dark:text-gray-300 mb-2">
            Fitness / Fatigue / Form
          </p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-full bg-blue-500 inline-block" />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Fitness (CTL)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-full bg-orange-500 inline-block" />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Fatigue (ATL)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-full bg-green-500 inline-block border-dashed" style={{ borderTop: '2px dashed #22c55e', height: 0, background: 'none' }} />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Form (TSB)</span>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stressData}>
                <CartesianGrid stroke="var(--grid-stroke)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={(d: string) => d.slice(5)}
                  interval="preserveStartEnd"
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
                <Line type="monotone" dataKey="CTL" stroke="#3b82f6" strokeWidth={2} dot={false} name="Fitness (CTL)" />
                <Line type="monotone" dataKey="ATL" stroke="#f97316" strokeWidth={2} dot={false} name="Fatigue (ATL)" />
                <Line type="monotone" dataKey="TSB" stroke="#22c55e" strokeWidth={1.5} dot={false} name="Form (TSB)" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Weekly Volume by Discipline */}
      {volumeData.length > 0 && (
        <div className="card-squircle p-6">
          <p className="text-[11px] font-black uppercase tracking-[2px] text-gray-600 dark:text-gray-300 mb-2">
            Weekly Volume (hours) — Last 12 Weeks
          </p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Swim</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Bike</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">Run</span>
            </div>
          </div>
          <div className="h-40">
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
                <Bar dataKey="swim" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} name="Swim" />
                <Bar dataKey="bike" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} name="Bike" />
                <Bar dataKey="run" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} name="Run" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
