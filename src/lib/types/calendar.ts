export interface CalendarRaceEvent {
  id: string
  raceName: string
  racePlanId: string
  type: 'race_day' | 'prep'
  label: string
  tasks: string[]
  daysOut: number
}
