'use client'

import TelemetryChart from '@/components/dashboard/TelemetryChart'
import ManualContextCard from '@/components/dashboard/ManualContextCard'
import EFCard from '@/components/dashboard/EFCard'
import MetabolicCard from '@/components/dashboard/MetabolicCard'

export default function BikePage() {
  return (
    <div className="flex flex-col gap-6">
      <TelemetryChart sport="bike" />

      <div className="grid grid-cols-3 gap-6">
        <ManualContextCard />
        <EFCard sport="bike" />
        <MetabolicCard sport="bike" />
      </div>
    </div>
  )
}
