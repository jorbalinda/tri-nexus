import StatCard from '@/components/ui/StatCard'

interface MetabolicCardProps {
  sport: 'swim' | 'bike' | 'run'
}

const sportDefaults = {
  swim: { value: 60, unit: 'g/hr' },
  bike: { value: 92, unit: 'g/hr' },
  run: { value: 75, unit: 'g/hr' },
}

export default function MetabolicCard({ sport }: MetabolicCardProps) {
  const { value, unit } = sportDefaults[sport]

  return (
    <StatCard
      label="Metabolic Ceiling"
      value={value}
      unit={unit}
      sublabel="Carb absorption rate"
      trend="neutral"
    />
  )
}
