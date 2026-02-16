'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const placeholderData = Array.from({ length: 60 }, (_, i) => ({
  time: `${Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
  hr: Math.round(130 + Math.sin(i / 5) * 15 + Math.random() * 8),
  power: Math.round(200 + Math.cos(i / 7) * 30 + Math.random() * 15),
}))

interface TelemetryChartProps {
  sport: 'swim' | 'bike' | 'run' | 'synergy'
}

const sportLabels = {
  swim: { secondary: 'Pace', color: '#3B82F6' },
  bike: { secondary: 'Power', color: '#F97316' },
  run: { secondary: 'Pace', color: '#22C55E' },
  synergy: { secondary: 'Combined', color: '#8B5CF6' },
}

export default function TelemetryChart({ sport }: TelemetryChartProps) {
  const { secondary, color } = sportLabels[sport]

  return (
    <div className="card-squircle p-8 chart-gradient">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
            Session Telemetry
          </p>
          <p className="text-lg font-semibold text-gray-800 mt-1">
            HR vs {secondary} · Aerobic Decoupling
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            Heart Rate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {secondary}
          </span>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={placeholderData}>
            <defs>
              <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="hr"
              orientation="left"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              domain={[100, 180]}
            />
            <YAxis
              yAxisId="power"
              orientation="right"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              domain={[150, 280]}
            />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            />
            <Legend wrapperStyle={{ display: 'none' }} />
            <Area
              yAxisId="hr"
              type="monotone"
              dataKey="hr"
              stroke="#f87171"
              fill="url(#hrGradient)"
              strokeWidth={2}
              dot={false}
            />
            <Area
              yAxisId="power"
              type="monotone"
              dataKey="power"
              stroke={color}
              fill="url(#powerGradient)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
