'use client'

import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface RaceReadinessCardProps {
  trainingLoad: { ctl: number; atl: number; tsb: number } | null
  daysUntilRace: number
}

export default function RaceReadinessCard({ trainingLoad, daysUntilRace }: RaceReadinessCardProps) {
  if (!trainingLoad) return null

  const { ctl, atl, tsb } = trainingLoad

  // Race week lowers the Race Ready floor — any positive form within 7 days is good
  const isRaceWeek = daysUntilRace >= 0 && daysUntilRace <= 7
  const raceReadyFloor = isRaceWeek ? 0 : 10

  let readinessLabel: string
  let readinessColor: string
  let readinessBg: string
  let coachingText: string

  if (tsb > 25) {
    // Distinguish good taper (high CTL) from detraining (low CTL)
    if (ctl >= 25 && isRaceWeek) {
      readinessLabel = 'Peak Form'
      readinessColor = 'text-[#4cc9a0]'
      readinessBg = 'bg-[#4cc9a0]/10 border-[#4cc9a0]/25'
      coachingText = 'Outstanding form going into race day. Fitness is banked, fatigue is gone. Stay loose and trust the work.'
    } else if (ctl >= 25) {
      readinessLabel = 'Well Tapered'
      readinessColor = 'text-[#57a2ea]'
      readinessBg = 'bg-[#57a2ea]/10 border-[#57a2ea]/25'
      coachingText = 'Fully recovered with a solid fitness base. A short quality session could sharpen you without adding meaningful fatigue.'
    } else {
      readinessLabel = 'Extended Rest'
      readinessColor = 'text-[#ffb703]'
      readinessBg = 'bg-[#ffb703]/10 border-[#ffb703]/25'
      coachingText = 'Extended time off is eroding your fitness base. Light consistent training will reverse the trend.'
    }
  } else if (tsb >= raceReadyFloor && tsb <= 25) {
    readinessLabel = 'Race Ready'
    readinessColor = 'text-[#4cc9a0]'
    readinessBg = 'bg-[#4cc9a0]/10 border-[#4cc9a0]/25'
    coachingText = isRaceWeek
      ? 'Form is positive heading into race day. Fitness is there, stay loose and let the last fatigue clear.'
      : 'You are in the optimal race-ready window. Fitness is strong, fatigue has cleared. Trust the taper.'
  } else if (tsb > 0 && tsb < raceReadyFloor) {
    // Only reachable outside race week (raceReadyFloor = 10 then)
    readinessLabel = 'Fresh'
    readinessColor = 'text-[#57a2ea]'
    readinessBg = 'bg-[#57a2ea]/10 border-[#57a2ea]/25'
    coachingText = 'Well recovered and ready for quality sessions. A few more easy days could push you into the race-ready zone.'
  } else if (tsb >= -10 && tsb <= 0) {
    readinessLabel = isRaceWeek ? 'Behind on Taper' : 'Normal Training'
    readinessColor = isRaceWeek ? 'text-[#e2622c]' : 'text-[#fb8500]'
    readinessBg = isRaceWeek
      ? 'bg-[#e2622c]/10 border-[#e2622c]/25'
      : 'bg-[#fb8500]/10 border-[#fb8500]/25'
    coachingText = isRaceWeek
      ? 'Still carrying some fatigue with the race approaching. Keep sessions very easy and prioritize sleep.'
      : 'Absorbing recent training load. This is a healthy place to be during a build block.'
  } else if (tsb < -10 && tsb >= -20) {
    readinessLabel = isRaceWeek ? 'High Fatigue' : 'Fatigued'
    readinessColor = 'text-[#e2622c]'
    readinessBg = 'bg-[#e2622c]/10 border-[#e2622c]/25'
    coachingText = isRaceWeek
      ? 'Significant fatigue this close to race day. Avoid any intensity, full rest only.'
      : daysUntilRace <= 21
      ? 'Time to start tapering. Reduce volume to arrive fresh on race day.'
      : 'Moderate fatigue from training load. A recovery week would help absorb this fitness.'
  } else {
    // tsb < -20
    readinessLabel = isRaceWeek ? 'Critical Fatigue' : 'Deep Fatigue'
    readinessColor = 'text-[#d62828]'
    readinessBg = 'bg-[#d62828]/10 border-[#d62828]/25'
    coachingText = isRaceWeek
      ? 'Very high fatigue this close to race day. Full rest, hydration, and sleep are your only tools now.'
      : 'Heavy fatigue accumulated. Prioritize recovery to avoid overtraining.'
  }

  // Trend icon for TSB
  const TsbIcon = tsb > 5 ? TrendingUp : tsb < -5 ? TrendingDown : Minus

  return (
    <div className="card-squircle p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-[#4361ee]" />
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
            Training Status
          </p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${readinessBg.replace('border-', 'border border-')} ${readinessColor}`}>
          {readinessLabel}
        </span>
      </div>

      {/* 3-column: CTL / ATL / TSB */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="p-2 sm:p-3 rounded-xl text-center" style={{ background: 'rgba(33, 158, 188, 0.10)', border: '1px solid rgba(33, 158, 188, 0.20)' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#2a9d8f' }}>CTL</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{ctl}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">Fitness</p>
        </div>
        <div className="p-2 sm:p-3 rounded-xl text-center" style={{ background: 'rgba(230, 57, 70, 0.10)', border: '1px solid rgba(230, 57, 70, 0.20)' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#e63946' }}>ATL</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{atl}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">Fatigue</p>
        </div>
        <div className="p-2 sm:p-3 rounded-xl text-center" style={{ background: 'rgba(76, 201, 160, 0.10)', border: '1px solid rgba(76, 201, 160, 0.20)' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#4cc9a0' }}>TSB</p>
          <div className="flex items-center justify-center gap-1">
            <p className="text-xl font-bold" style={{ color: tsb >= 0 ? '#4cc9a0' : '#d62828' }}>
              {tsb > 0 ? '+' : ''}{tsb}
            </p>
            <TsbIcon size={14} style={{ color: tsb >= 0 ? '#4cc9a0' : '#d62828' }} />
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">Form</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        {coachingText}
      </p>
    </div>
  )
}
