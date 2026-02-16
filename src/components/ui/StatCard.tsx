interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  sublabel?: string
  trend?: 'up' | 'down' | 'neutral'
}

export default function StatCard({ label, value, unit, sublabel, trend }: StatCardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'

  return (
    <div className="card-squircle p-6">
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 mb-4">
        {label}
      </p>
      <div className="flex items-end gap-1.5">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-400 mb-1">{unit}</span>}
      </div>
      {sublabel && (
        <p className={`text-xs mt-2 font-medium ${trendColor}`}>
          {sublabel}
        </p>
      )}
    </div>
  )
}
