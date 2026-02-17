import type {
  RaceDistance,
  RaceConditions,
  EquipmentItem,
  RaceWeekTimeline,
  EquipmentPlan,
} from '@/lib/types/race-plan'

// ---------------------------------------------------------------------------
// Equipment & logistics plan generator
// ---------------------------------------------------------------------------

function bucket(rd: RaceDistance): string {
  switch (rd) {
    case 'super_sprint': case 'sprint': case 'wt_sprint': return 'sprint'
    case 'olympic': case 'wt_standard': return 'olympic'
    case '70.3': return '70.3'
    case '140.6': return '140.6'
    default: return 'olympic'
  }
}

export function generateEquipmentPlan(raceDistance: RaceDistance, conditions?: RaceConditions | null): EquipmentPlan {
  return {
    checklist: generateChecklist(raceDistance, conditions),
    raceWeekTimeline: generateTimeline(raceDistance),
  }
}

function generateChecklist(raceDistance: RaceDistance, conditions?: RaceConditions | null): EquipmentItem[] {
  const b = bucket(raceDistance)
  const isLong = b === '140.6' || b === '70.3'
  const wetsuitLegal = conditions?.wetsuit_legal !== false

  const items: EquipmentItem[] = [
    // Swim
    ...(wetsuitLegal ? [{ name: 'Wetsuit (check water temp rules)', category: 'swim' as const }] : []),
    { name: 'Goggles (primary pair)', category: 'swim' },
    { name: 'Goggles (backup pair)', category: 'swim' },
    { name: 'Swim cap (provided at registration)', category: 'swim' },
    { name: 'Anti-chafe / body glide', category: 'swim' },
    { name: 'Timing chip (attached to ankle)', category: 'swim' },
    { name: 'Tri suit / race kit', category: 'swim' },
    ...(conditions?.water_type === 'ocean' ? [{ name: 'Earplugs (ocean swim)', category: 'swim' as const }] : []),

    // Bike
    { name: 'Bike (cleaned and tuned)', category: 'bike' },
    { name: 'Helmet', category: 'bike' },
    { name: 'Bike shoes', category: 'bike' },
    { name: 'Sunglasses', category: 'bike' },
    { name: 'Water bottles (filled)', category: 'bike' },
    { name: 'Nutrition taped/mounted to frame', category: 'bike' },
    { name: 'Flat repair kit (tube, levers, CO2)', category: 'bike' },
    { name: 'Mini pump', category: 'bike' },
    { name: 'Bike computer (charged)', category: 'bike' },

    // Run
    { name: 'Run shoes', category: 'run' },
    { name: 'Hat or visor', category: 'run' },
    { name: 'Race belt with bib number', category: 'run' },
    { name: 'Sunscreen', category: 'run' },

    // Transition
    { name: 'Towel (for T1)', category: 'transition' },
    { name: 'Body glide / anti-chafe', category: 'transition' },
    { name: 'Elastic laces (for quick shoe change)', category: 'transition' },

    // Nutrition
    { name: 'Gels / chews (race quantity)', category: 'nutrition' },
    { name: 'Drink mix (pre-mixed in bottles)', category: 'nutrition' },
    { name: 'Pre-race breakfast food', category: 'nutrition' },
    { name: 'Caffeine (pills or coffee)', category: 'nutrition' },
    { name: 'Electrolyte tabs/salt', category: 'nutrition' },
    { name: 'Recovery drink (post-race)', category: 'nutrition' },
  ]

  if (isLong) {
    items.push(
      { name: 'Special needs bag — bike (extra nutrition)', category: 'special_needs' },
      { name: 'Special needs bag — run (extra nutrition)', category: 'special_needs' },
      { name: 'Arm warmers / extra layer (for early morning)', category: 'bike' },
      { name: 'Headlamp or light (if pre-dawn start)', category: 'transition' },
      { name: 'Change of clothes (drop bag)', category: 'transition' },
    )
  }

  if (conditions?.wind === 'strong') {
    items.push({ name: 'Deep section wheel cover / disc cover', category: 'bike' })
  }

  return items
}

function generateTimeline(raceDistance: RaceDistance): RaceWeekTimeline[] {
  const b = bucket(raceDistance)
  const isLong = b === '140.6' || b === '70.3'

  return [
    {
      daysOut: 7, label: '1 Week Out',
      tasks: [
        'Begin taper — reduce volume by 40-60%, maintain intensity',
        'Finalize race nutrition plan', 'Test all gear in a short brick workout', 'Confirm travel and accommodation',
      ],
    },
    {
      daysOut: 3, label: '3 Days Out',
      tasks: [
        'Short easy workouts only (20-30 min)',
        'Begin carb loading' + (isLong ? ' (8-12g/kg/day)' : ''),
        'Lay out all race gear — use the checklist', 'Review the race course map and plan',
      ],
    },
    {
      daysOut: 1, label: 'Day Before',
      tasks: [
        'Bike check-in and transition area setup', 'Packet pickup and athlete briefing',
        'Course familiarization (drive or walk)', 'Simple dinner — nothing new or heavy',
        'Set 2 alarms for race morning', 'Lay out race morning clothes and breakfast',
      ],
    },
    {
      daysOut: 0, label: 'Race Morning',
      tasks: [
        `Wake up ${isLong ? '3-3.5' : '2.5-3'} hours before start`,
        'Eat pre-race meal (practiced in training)', 'Caffeine 60-90 min before start',
        `Arrive at venue ${isLong ? '90' : '60'} min before start`,
        'Set up transition area', 'Quick body marking if needed',
        '10-min warm-up (light jog + arm swings)', 'Final bathroom stop', 'Wetsuit on 15 min before start',
      ],
    },
  ]
}
