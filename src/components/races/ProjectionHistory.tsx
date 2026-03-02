'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const LineChart = dynamic(() => import('recharts').then((m) => ({ default: m.LineChart })), { ssr: false })
const Line = dynamic(() => import('recharts').then((m) => ({ default: m.Line })), { ssr: false })
const XAxis = dynamic(() => import('recharts').then((m) => ({ default: m.XAxis })), { ssr: false })
const YAxis = dynamic(() => import('recharts').then((m) => ({ default: m.YAxis })), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then((m) => ({ default: m.CartesianGrid })), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then((m) => ({ default: m.Tooltip })), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => ({ default: m.ResponsiveContainer })), { ssr: false })
const Area = dynamic(() => import('recharts').then((m) => ({ default: m.Area })), { ssr: false })
import { createClient } from '@/lib/supabase/client'
import type { RaceProjection } from '@/lib/types/projection'

interface ProjectionHistoryProps {
  raceId: string
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}:${m.toString().padStart(2, '0')}`
}

export default function ProjectionHistory({ raceId }: ProjectionHistoryProps) {
  const [projections, setProjections] = useState<RaceProjection[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('projections')
        .select('*')
        .eq('target_race_id', raceId)
        .order('projected_at', { ascending: true })

      setProjections((data as RaceProjection[]) || [])
      setLoading(false)
    }
    fetch()
  }, [raceId, supabase])

  if (loading || projections.length < 2) return null

  const chartData = projections.map((p) => ({
    date: new Date(p.projected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    realistic: p.realistic_seconds,
    optimistic: p.optimistic_seconds,
    conservative: p.conservative_seconds,
    confidence: p.confidence_score,
  }))

  return (
    <div className="card-squircle p-6">
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-4">
        Projection History
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="var(--grid-stroke)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(v: number) => formatTime(v)}
              width={50}
              reversed
            />
            <Tooltip
              contentStyle={{
                background: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              formatter={(value, name) => [formatTime(typeof value === 'number' ? value : 0), String(name ?? '').charAt(0).toUpperCase() + String(name ?? '').slice(1)]}
            />
            <Line type="monotone" dataKey="conservative" stroke="#f97316" strokeWidth={1} dot={false} strokeDasharray="4 2" name="Conservative" />
            <Line type="monotone" dataKey="realistic" stroke="#3b82f6" strokeWidth={2} dot={false} name="Realistic" />
            <Line type="monotone" dataKey="optimistic" stroke="#22c55e" strokeWidth={1} dot={false} strokeDasharray="4 2" name="Optimistic" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
