import StatCard from '@/components/ui/StatCard'

interface EFCardProps {
  sport: 'swim' | 'bike' | 'run'
}

const sportDefaults = {
  swim: { value: '1.38', trend: '+3.2% vs last month' as const },
  bike: { value: '1.42', trend: '+2.8% vs last month' as const },
  run: { value: '1.35', trend: '+1.9% vs last month' as const },
}

export default function EFCard({ sport }: EFCardProps) {
  const { value, trend } = sportDefaults[sport]

  return (
    <StatCard
      label="Efficiency Factor"
      value={value}
      sublabel={trend}
      trend="up"
    />
  )
}
