'use client'

import TelemetryChart from '@/components/dashboard/TelemetryChart'
import ManualContextCard from '@/components/dashboard/ManualContextCard'
import StatCard from '@/components/ui/StatCard'

export default function SynergyPage() {
  return (
    <div className="flex flex-col gap-6">
      <TelemetryChart sport="synergy" />

      <div className="grid grid-cols-3 gap-6">
        <ManualContextCard />
        <StatCard
          label="Training Stress Balance"
          value={12}
          unit="TSB"
          sublabel="Fresh — ready to train"
          trend="up"
        />
        <StatCard
          label="Aerobic Decoupling"
          value="3.8"
          unit="%"
          sublabel="Well coupled (<5%)"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <StatCard
          label="Swim EF"
          value="1.38"
          sublabel="+3.2% trend"
          trend="up"
        />
        <StatCard
          label="Bike EF"
          value="1.42"
          sublabel="+2.8% trend"
          trend="up"
        />
        <StatCard
          label="Run EF"
          value="1.35"
          sublabel="+1.9% trend"
          trend="up"
        />
      </div>
    </div>
  )
}
