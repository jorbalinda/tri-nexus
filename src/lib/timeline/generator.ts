interface TimelineEventDef {
  event_name: string
  offset_minutes: number  // negative = before gun time, positive = day before offsets
  event_type: 'logistics' | 'nutrition' | 'action'
  is_day_before?: boolean
}

const SHORT_RACE: TimelineEventDef[] = [
  { event_name: 'Gun start', offset_minutes: 0, event_type: 'action' },
  { event_name: 'Enter water / corral', offset_minutes: -5, event_type: 'action' },
  { event_name: 'Warm-up start', offset_minutes: -30, event_type: 'action' },
  { event_name: 'Set up transition area', offset_minutes: -60, event_type: 'logistics' },
  { event_name: 'Arrive at venue', offset_minutes: -90, event_type: 'logistics' },
  { event_name: 'Leave for venue', offset_minutes: -120, event_type: 'logistics' },
  { event_name: 'Race morning breakfast', offset_minutes: -180, event_type: 'nutrition' },
  { event_name: 'Wake up', offset_minutes: -210, event_type: 'action' },
]

const LONG_RACE: TimelineEventDef[] = [
  { event_name: 'Gun start', offset_minutes: 0, event_type: 'action' },
  { event_name: 'Enter water / corral', offset_minutes: -5, event_type: 'action' },
  { event_name: 'Apply sunscreen & body glide', offset_minutes: -15, event_type: 'action' },
  { event_name: 'Warm-up start', offset_minutes: -30, event_type: 'action' },
  { event_name: 'Final transition check', offset_minutes: -45, event_type: 'logistics' },
  { event_name: 'Set up transition area', offset_minutes: -90, event_type: 'logistics' },
  { event_name: 'Arrive at venue', offset_minutes: -120, event_type: 'logistics' },
  { event_name: 'Leave for venue', offset_minutes: -150, event_type: 'logistics' },
  { event_name: 'Race morning breakfast', offset_minutes: -210, event_type: 'nutrition' },
  { event_name: 'Wake up', offset_minutes: -240, event_type: 'action' },
]

const DAY_BEFORE_SHORT: TimelineEventDef[] = [
  { event_name: 'Athlete check-in', offset_minutes: 720, event_type: 'logistics', is_day_before: true }, // 12:00 PM
  { event_name: 'Bike racking', offset_minutes: 840, event_type: 'logistics', is_day_before: true }, // 2:00 PM
  { event_name: 'Pre-race dinner (high carb)', offset_minutes: 1080, event_type: 'nutrition', is_day_before: true }, // 6:00 PM
  { event_name: 'Lay out race morning gear', offset_minutes: 1200, event_type: 'logistics', is_day_before: true }, // 8:00 PM
  { event_name: 'Lights out', offset_minutes: 1260, event_type: 'action', is_day_before: true }, // 9:00 PM
]

const DAY_BEFORE_LONG: TimelineEventDef[] = [
  { event_name: 'Athlete check-in', offset_minutes: 720, event_type: 'logistics', is_day_before: true },
  { event_name: 'Bike racking', offset_minutes: 840, event_type: 'logistics', is_day_before: true },
  { event_name: 'Gear bag drop-off', offset_minutes: 900, event_type: 'logistics', is_day_before: true }, // 3:00 PM
  { event_name: 'Course familiarization', offset_minutes: 960, event_type: 'action', is_day_before: true },
  { event_name: 'Pre-race dinner (high carb)', offset_minutes: 1080, event_type: 'nutrition', is_day_before: true },
  { event_name: 'Lay out race morning gear', offset_minutes: 1200, event_type: 'logistics', is_day_before: true },
  { event_name: 'Lights out', offset_minutes: 1260, event_type: 'action', is_day_before: true },
]

export interface GeneratedEvent {
  event_name: string
  scheduled_time: Date
  event_type: 'logistics' | 'nutrition' | 'action'
}

export function generateTimeline(
  gunStartTime: Date,
  raceDistance: 'sprint' | 'olympic' | '70.3' | '140.6' | 'custom'
): GeneratedEvent[] {
  const isLong = raceDistance === '70.3' || raceDistance === '140.6'
  const raceDayEvents = isLong ? LONG_RACE : SHORT_RACE
  const dayBeforeEvents = isLong ? DAY_BEFORE_LONG : DAY_BEFORE_SHORT

  const events: GeneratedEvent[] = []

  // Race day events (offset from gun time)
  for (const def of raceDayEvents) {
    const time = new Date(gunStartTime.getTime() + def.offset_minutes * 60 * 1000)
    events.push({
      event_name: def.event_name,
      scheduled_time: time,
      event_type: def.event_type,
    })
  }

  // Day-before events
  const dayBefore = new Date(gunStartTime)
  dayBefore.setDate(dayBefore.getDate() - 1)
  dayBefore.setHours(0, 0, 0, 0)

  for (const def of dayBeforeEvents) {
    const time = new Date(dayBefore.getTime() + (def.offset_minutes || 0) * 60 * 1000)
    events.push({
      event_name: def.event_name,
      scheduled_time: time,
      event_type: def.event_type,
    })
  }

  // Sort chronologically
  events.sort((a, b) => a.scheduled_time.getTime() - b.scheduled_time.getTime())

  return events
}
