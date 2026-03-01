'use client'

import { useRef, useEffect, useCallback } from 'react'

// ── Constants ──────────────────────────────────────────────────────────────
const ITEM_H = 40   // px per row
const VISIBLE = 5   // rows visible at once (must be odd)
const PAD = Math.floor(VISIBLE / 2) // rows of invisible padding top/bottom

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i))
const MINS  = Array.from({ length: 60 }, (_, i) => pad2(i))
const SECS  = Array.from({ length: 60 }, (_, i) => pad2(i))

// ── Single scrollable column ───────────────────────────────────────────────
function Column({
  items,
  initialIndex,
  onChange,
}: {
  items: string[]
  initialIndex: number
  onChange: (index: number) => void
}) {
  const ref     = useRef<HTMLDivElement>(null)
  const timer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const settling = useRef(false)

  // Set initial scroll position on mount without firing onChange
  useEffect(() => {
    const el = ref.current
    if (!el) return
    settling.current = true
    el.scrollTop = initialIndex * ITEM_H
    const t = setTimeout(() => { settling.current = false }, 120)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const snap = useCallback(() => {
    const el = ref.current
    if (!el) return
    const idx     = Math.round(el.scrollTop / ITEM_H)
    const clamped = Math.max(0, Math.min(items.length - 1, idx))
    settling.current = true
    el.scrollTo({ top: clamped * ITEM_H, behavior: 'smooth' })
    onChange(clamped)
    setTimeout(() => { settling.current = false }, 380)
  }, [items.length, onChange])

  const handleScroll = useCallback(() => {
    if (settling.current) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(snap, 150)
  }, [snap])

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{ width: 64, height: ITEM_H * VISIBLE }}
    >
      {/* Selection highlight band */}
      <div
        className="absolute inset-x-0 rounded-xl bg-gray-100 dark:bg-gray-700/70 pointer-events-none z-10"
        style={{ top: ITEM_H * PAD, height: ITEM_H }}
      />

      {/* Scrollable list */}
      <div
        ref={ref}
        onScroll={handleScroll}
        className="scrollbar-none absolute inset-0 overflow-y-scroll"
        style={{
          scrollSnapType: 'y mandatory',
          // Fade items away from the selection band
          maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
        }}
      >
        <div style={{ height: ITEM_H * PAD }} />
        {items.map((v, i) => (
          <div
            key={i}
            style={{ height: ITEM_H, scrollSnapAlign: 'center' }}
            className="flex items-center justify-center text-lg font-mono font-semibold text-gray-900 dark:text-gray-100"
          >
            {v}
          </div>
        ))}
        <div style={{ height: ITEM_H * PAD }} />
      </div>
    </div>
  )
}

// ── Parser ─────────────────────────────────────────────────────────────────
function parseHMS(v: string): [number, number, number] {
  if (!v) return [0, 0, 0]
  const parts = v.split(':').map(Number)
  if (parts.length === 3 && !parts.some(isNaN)) return [parts[0], parts[1], parts[2]]
  if (parts.length === 2 && !parts.some(isNaN)) return [0, parts[0], parts[1]]
  return [0, 0, 0]
}

// ── Public component ───────────────────────────────────────────────────────
interface Props {
  value: string          // "H:MM:SS" or ""
  onChange: (value: string) => void
}

export default function TimeScrollPicker({ value, onChange }: Props) {
  const [initH, initM, initS] = parseHMS(value)

  // Track current values in refs so the callbacks never go stale
  const hRef = useRef(initH)
  const mRef = useRef(initM)
  const sRef = useRef(initS)

  const emit = useCallback(() => {
    onChange(`${hRef.current}:${pad2(mRef.current)}:${pad2(sRef.current)}`)
  }, [onChange])

  const setH = useCallback((i: number) => { hRef.current = i; emit() }, [emit])
  const setM = useCallback((i: number) => { mRef.current = i; emit() }, [emit])
  const setS = useCallback((i: number) => { sRef.current = i; emit() }, [emit])

  // mt-[86px] centers the colon within the 200px scroll area
  // (PAD * ITEM_H + ITEM_H/2 - line-height/2 = 80 + 20 - 14 ≈ 86)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-center gap-1 py-1">
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">hr</span>
          <Column items={HOURS} initialIndex={initH} onChange={setH} />
        </div>

        <span className="text-xl font-bold text-gray-300 dark:text-gray-600 mt-[50px]">:</span>

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">min</span>
          <Column items={MINS} initialIndex={initM} onChange={setM} />
        </div>

        <span className="text-xl font-bold text-gray-300 dark:text-gray-600 mt-[50px]">:</span>

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">sec</span>
          <Column items={SECS} initialIndex={initS} onChange={setS} />
        </div>
      </div>
    </div>
  )
}
