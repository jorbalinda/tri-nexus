'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Clock } from 'lucide-react'

interface TimeComboboxProps {
  value: string // HH:MM (24h)
  onChange: (time: string) => void
  disabled?: boolean
}

function generateTimeSlots(): { value: string; label: string }[] {
  const slots: { value: string; label: string }[] = []
  for (let h = 2; h <= 11; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = h.toString().padStart(2, '0')
      const mm = m.toString().padStart(2, '0')
      const value = `${hh}:${mm}`
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h
      const ampm = h >= 12 ? 'PM' : 'AM'
      const label = `${hour12}:${mm} ${ampm}`
      slots.push({ value, label })
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

function formatTimeLabel(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':')
  const h = parseInt(hStr, 10)
  const mm = mStr || '00'
  const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${hour12}:${mm} ${ampm}`
}

export default function TimeCombobox({ value, onChange, disabled }: TimeComboboxProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Scroll to selected value when opening
  useEffect(() => {
    if (open && listRef.current && value) {
      const el = listRef.current.querySelector(`[data-value="${value}"]`)
      if (el) {
        el.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [open, value])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return TIME_SLOTS
    return TIME_SLOTS.filter((slot) => {
      return slot.label.toLowerCase().includes(q) || slot.value.includes(q)
    })
  }, [query])

  const displayValue = value ? formatTimeLabel(value) : ''

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={open ? query : displayValue}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => {
            if (!disabled) {
              setOpen(true)
              setQuery('')
            }
          }}
          disabled={disabled}
          placeholder="Select time..."
          className="w-[150px] pl-8 pr-2 py-1.5 text-xs font-semibold rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all disabled:opacity-40 disabled:hover:bg-blue-50/50 cursor-pointer"
        />
      </div>

      {open && !disabled && (
        <div
          ref={listRef}
          className="absolute top-full left-0 mt-1 w-[150px] bg-[var(--card-bg,#fff)] dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">No times match</p>
            </div>
          ) : (
            filtered.map((slot) => (
              <button
                key={slot.value}
                type="button"
                data-value={slot.value}
                onClick={() => {
                  onChange(slot.value)
                  setOpen(false)
                  setQuery('')
                }}
                className={`w-full px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                  slot.value === value
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {slot.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
