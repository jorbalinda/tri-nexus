/**
 * Calendar date utilities — Monday-start week grid
 */

/** Get all days for a month grid, padded to complete Mon-Sun weeks (35 or 42 days) */
export function getCalendarDays(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)

  // Monday = 0, Sunday = 6 (convert from JS Sunday=0 convention)
  const startDow = (firstOfMonth.getDay() + 6) % 7
  const endDow = (lastOfMonth.getDay() + 6) % 7

  const start = new Date(firstOfMonth)
  start.setDate(start.getDate() - startDow)

  const end = new Date(lastOfMonth)
  end.setDate(end.getDate() + (6 - endDow))

  const days: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return days
}

/** Format Date to YYYY-MM-DD */
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Check if two dates are the same calendar day */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Check if a date belongs to the given month */
export function isInMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month
}
