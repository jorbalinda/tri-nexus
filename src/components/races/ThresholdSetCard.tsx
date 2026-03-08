'use client'

import { useEffect, useState } from 'react'
import { Zap, Waves, Footprints, CheckCircle2, Pencil } from 'lucide-react'
import { apiGet, apiPatch } from '@/lib/api/client'
import ParticleBurst from '@/components/ui/ParticleBurst'
import { useUnits } from '@/hooks/useUnits'
import { secPerKmToSecPerMile, secPerMileToSecPerKm, secPer100mToSecPer100yd, secPer100ydToSecPer100m } from '@/lib/units'

const INPUT_CLASS = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4361ee]/30 transition-all'
const LABEL_CLASS = 'block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1'

function formatPace(sec: number | null): string {
  if (!sec) return ''
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function autoFormatPace(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, digits.length - 2)}:${digits.slice(-2)}`
}

function parsePace(val: string): number | null {
  const parts = val.split(':').map(Number)
  if (parts.some(isNaN) || parts.length < 1) return null
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parts[0] * 60
}

interface Thresholds { ftp_watts: number | null; threshold_pace_swim: number | null; threshold_pace_run: number | null }

export default function ThresholdSetCard({ onSaved }: { onSaved?: () => void }) {
  const { isImperial } = useUnits()
  const [thresholds, setThresholds] = useState<Thresholds | null>(null)
  const [editing, setEditing] = useState(false)
  const [ftp, setFtp] = useState('')
  const [css, setCss] = useState('')
  const [runPace, setRunPace] = useState('')
  const [saving, setSaving] = useState(false)
  const [showBurst, setShowBurst] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiGet('/api/profile').then((raw: unknown) => {
      const p = raw as Thresholds
      setThresholds(p)
      const allSet = p.ftp_watts && p.threshold_pace_swim && p.threshold_pace_run
      setEditing(!allSet)
      if (p.ftp_watts) setFtp(String(p.ftp_watts))
      if (p.threshold_pace_swim) {
        const display = isImperial ? secPer100mToSecPer100yd(p.threshold_pace_swim) : p.threshold_pace_swim
        setCss(formatPace(display))
      }
      if (p.threshold_pace_run) {
        const display = isImperial ? secPerKmToSecPerMile(p.threshold_pace_run) : p.threshold_pace_run
        setRunPace(formatPace(display))
      }
    }).catch(() => {})
  }, [isImperial])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const ftpVal = ftp ? parseInt(ftp) : null
    const rawCss = parsePace(css)
    const cssVal = rawCss ? (isImperial ? secPer100ydToSecPer100m(rawCss) : rawCss) : null
    const rawRun = parsePace(runPace)
    const runVal = rawRun ? (isImperial ? secPerMileToSecPerKm(rawRun) : rawRun) : null

    try {
      await apiPatch('/api/profile', {
        ...(ftpVal !== null && { ftp_watts: ftpVal }),
        ...(cssVal !== null && { threshold_pace_swim: cssVal }),
        ...(runVal !== null && { threshold_pace_run: runVal }),
      })
      setThresholds({ ftp_watts: ftpVal, threshold_pace_swim: cssVal, threshold_pace_run: runVal })
      setShowBurst(true)
      setEditing(false)
      onSaved?.()
    } catch {
      setError('Failed to save. Please try again.')
    }
    setSaving(false)
  }

  if (!thresholds) return null

  const allSet = thresholds.ftp_watts && thresholds.threshold_pace_swim && thresholds.threshold_pace_run

  // Compact display once all thresholds are set
  if (allSet && !editing) {
    const cssDisplay = isImperial
      ? secPer100mToSecPer100yd(thresholds.threshold_pace_swim!)
      : thresholds.threshold_pace_swim
    const runDisplay = isImperial
      ? secPerKmToSecPerMile(thresholds.threshold_pace_run!)
      : thresholds.threshold_pace_run

    return (
      <div className="card-squircle p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-[#4cc9a0]" />
            <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
              Thresholds Set
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-[#57a2ea] hover:text-[#7ab8f0] transition-colors"
          >
            <Pencil size={11} /> Update
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-[#fb8500]/8 text-center">
            <Zap size={13} className="text-[#fb8500] mx-auto mb-1" />
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{thresholds.ftp_watts}W</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">FTP</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#219ebc]/8 text-center">
            <Waves size={13} className="text-[#219ebc] mx-auto mb-1" />
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{formatPace(cssDisplay)}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">CSS / 100{isImperial ? 'yd' : 'm'}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#4cc9a0]/8 text-center">
            <Footprints size={13} className="text-[#4cc9a0] mx-auto mb-1" />
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{formatPace(runDisplay)}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">Run / {isImperial ? 'mi' : 'km'}</p>
          </div>
        </div>
      </div>
    )
  }

  // Entry form
  return (
    <div className="card-squircle p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <Zap size={15} className="text-[#4361ee]" />
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
          Set Your Thresholds
        </p>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        These three numbers are the key to unlocking your most realistic race day prediction.
      </p>

      <div className="space-y-3 mb-4">
        {/* FTP */}
        <div>
          <label className={LABEL_CLASS}>
            <span className="text-orange-500">⚡</span> FTP — Functional Threshold Power (watts)
          </label>
          <input
            type="number"
            value={ftp}
            onChange={(e) => setFtp(e.target.value)}
            className={INPUT_CLASS}
            placeholder="e.g. 220"
          />
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            Your best sustainable 60-min power. Use 95% of your best 20-min test.
          </p>
        </div>

        {/* CSS */}
        <div>
          <label className={LABEL_CLASS}>
            <span className="text-blue-500">🏊</span> CSS — Critical Swim Speed (min:sec / 100{isImperial ? 'yd' : 'm'})
          </label>
          <input
            type="text"
            value={css}
            onChange={(e) => setCss(autoFormatPace(e.target.value))}
            className={INPUT_CLASS}
            placeholder="e.g. 1:45"
          />
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            Swim a 400{isImperial ? 'yd' : 'm'} and a 200{isImperial ? 'yd' : 'm'} all-out. CSS = (T400 − T200) ÷ 2.
          </p>
        </div>

        {/* Run pace */}
        <div>
          <label className={LABEL_CLASS}>
            <span className="text-green-500">🏃</span> Run Threshold Pace (min:sec / {isImperial ? 'mile' : 'km'})
          </label>
          <input
            type="text"
            value={runPace}
            onChange={(e) => setRunPace(autoFormatPace(e.target.value))}
            className={INPUT_CLASS}
            placeholder={isImperial ? 'e.g. 8:30' : 'e.g. 5:15'}
          />
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            Your best sustainable 30–60 min race pace, or result of a lactate threshold test.
          </p>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      <div className="flex gap-2">
        {allSet && editing && (
          <button
            onClick={() => setEditing(false)}
            className="px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        )}
        <ParticleBurst active={showBurst} onComplete={() => setShowBurst(false)} className="flex-1">
          <button
            onClick={handleSave}
            disabled={saving || (!ftp && !css && !runPace)}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Thresholds'}
          </button>
        </ParticleBurst>
      </div>
    </div>
  )
}
