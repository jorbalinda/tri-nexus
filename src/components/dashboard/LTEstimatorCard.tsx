'use client'

import { useState } from 'react'
import { estimateLT, validateInputs } from '@/lib/analytics/lactate-threshold'
import type { LTEstimate } from '@/lib/analytics/lactate-threshold'

interface LTEstimatorCardProps {
  derivedMaxHR?: number | null
  derivedRestingHR?: number | null
}

export default function LTEstimatorCard({
  derivedMaxHR,
  derivedRestingHR,
}: LTEstimatorCardProps) {
  const [maxHR, setMaxHR] = useState(derivedMaxHR?.toString() || '')
  const [restingHR, setRestingHR] = useState(derivedRestingHR?.toString() || '')
  const [result, setResult] = useState<LTEstimate | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleEstimate = () => {
    const max = Number(maxHR)
    const rest = Number(restingHR)

    const validationError = validateInputs(max, rest)
    if (validationError) {
      setError(validationError)
      setResult(null)
      return
    }

    setError(null)
    setResult(estimateLT(max, rest))
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'
  const labelClass =
    'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

  return (
    <div className="card-squircle p-8 relative">
      {/* Beta badge */}
      <span className="absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
        Beta
      </span>

      <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
        Lactate Threshold Estimator
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Estimate your aerobic (LT1) and anaerobic (LT2) thresholds from heart rate data.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelClass}>Max HR (bpm)</label>
          <input
            type="number"
            value={maxHR}
            onChange={(e) => setMaxHR(e.target.value)}
            className={inputClass}
            placeholder="190"
          />
          {derivedMaxHR && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              Observed: {derivedMaxHR} bpm
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>Resting HR (bpm)</label>
          <input
            type="number"
            value={restingHR}
            onChange={(e) => setRestingHR(e.target.value)}
            className={inputClass}
            placeholder="50"
          />
          {derivedRestingHR && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              Latest: {derivedRestingHR} bpm
            </p>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 mb-4">{error}</p>
      )}

      {/* Estimate button */}
      <button
        onClick={handleEstimate}
        className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer"
      >
        Estimate Zones
      </button>

      {/* Results */}
      {result && (
        <div className="mt-8">
          {/* LT1 / LT2 stat boxes */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl p-5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-blue-400 dark:text-blue-500 mb-2">
                LT1 — Aerobic
              </p>
              <div className="flex items-end gap-1.5">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {result.lt1}
                </span>
                <span className="text-sm text-blue-400 dark:text-blue-500 mb-1">bpm</span>
              </div>
              <p className="text-xs text-blue-500/70 dark:text-blue-400/50 mt-1">
                ~2 mmol/L lactate
              </p>
            </div>
            <div className="rounded-2xl p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-amber-400 dark:text-amber-500 mb-2">
                LT2 — Anaerobic
              </p>
              <div className="flex items-end gap-1.5">
                <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {result.lt2}
                </span>
                <span className="text-sm text-amber-400 dark:text-amber-500 mb-1">bpm</span>
              </div>
              <p className="text-xs text-amber-500/70 dark:text-amber-400/50 mt-1">
                ~4 mmol/L lactate
              </p>
            </div>
          </div>

          {/* Zone bar */}
          <div className="mb-6">
            <p className={labelClass}>Training Zones</p>
            <div className="flex rounded-xl overflow-hidden h-8">
              {result.zones.map((z) => {
                const totalRange = result.zones[result.zones.length - 1].maxHR - result.zones[0].minHR
                const width = ((z.maxHR - z.minHR) / totalRange) * 100
                return (
                  <div
                    key={z.zone}
                    style={{ width: `${width}%`, backgroundColor: z.color }}
                    className="flex items-center justify-center text-[10px] font-bold text-white"
                    title={`Z${z.zone} ${z.name}: ${z.minHR}–${z.maxHR} bpm`}
                  >
                    {width > 10 && `Z${z.zone}`}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Zone legend table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Zone
                  </th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Name
                  </th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    HR Range
                  </th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.zones.map((z) => (
                  <tr
                    key={z.zone}
                    className="border-t border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-block w-6 h-6 rounded-lg text-[10px] font-bold text-white flex items-center justify-center"
                        style={{ backgroundColor: z.color }}
                      >
                        {z.zone}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-gray-700 dark:text-gray-300">
                      {z.name}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                      {z.minHR}–{z.maxHR} bpm
                    </td>
                    <td className="px-4 py-2.5 text-gray-400 dark:text-gray-500">
                      {z.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
