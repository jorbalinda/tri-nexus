'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'

type Category = 'metabolic' | 'physiological' | 'environmental'

const logTypes: Record<Category, { key: string; label: string; unit: string; placeholder: string }[]> = {
  metabolic: [
    { key: 'carbs_g_per_hr', label: 'Carbs Intake', unit: 'g/hr', placeholder: '80' },
    { key: 'sodium_mg_per_hr', label: 'Sodium Intake', unit: 'mg/hr', placeholder: '800' },
    { key: 'fluid_ml_per_hr', label: 'Fluid Intake', unit: 'ml/hr', placeholder: '600' },
    { key: 'caffeine_mg', label: 'Caffeine', unit: 'mg', placeholder: '200' },
  ],
  physiological: [
    { key: 'blood_lactate', label: 'Blood Lactate', unit: 'mmol/L', placeholder: '2.4' },
    { key: 'morning_hrv', label: 'Morning HRV', unit: 'ms', placeholder: '52' },
    { key: 'resting_hr', label: 'Resting HR', unit: 'bpm', placeholder: '48' },
    { key: 'body_weight_kg', label: 'Body Weight', unit: 'kg', placeholder: '72' },
    { key: 'sleep_quality', label: 'Sleep Quality', unit: '1-10', placeholder: '7' },
  ],
  environmental: [
    { key: 'temperature_c', label: 'Temperature', unit: '°C', placeholder: '28' },
    { key: 'humidity_pct', label: 'Humidity', unit: '%', placeholder: '65' },
    { key: 'altitude_m', label: 'Altitude', unit: 'm', placeholder: '1200' },
    { key: 'life_stress', label: 'Life Stress', unit: '1-10', placeholder: '4' },
  ],
}

export default function ManualLogForm() {
  const [category, setCategory] = useState<Category>('metabolic')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    const entries = Object.entries(values)
      .filter(([, v]) => v !== '')
      .map(([key, value]) => {
        const logType = logTypes[category].find((t) => t.key === key)
        return {
          date,
          category,
          log_type: key,
          value: Number(value),
          unit: logType?.unit || null,
        }
      })

    if (entries.length > 0) {
      await supabase.from('manual_logs').insert(entries)
    }

    setSaving(false)
    setSaved(true)
    setValues({})
    setTimeout(() => setSaved(false), 3000)
  }

  const categories: { key: Category; label: string }[] = [
    { key: 'metabolic', label: 'Metabolic' },
    { key: 'physiological', label: 'Physiological' },
    { key: 'environmental', label: 'Environmental' },
  ]

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'
  const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
          Manual Data Entry
        </p>

        {/* Category selector */}
        <div className="flex gap-2">
          {categories.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setCategory(key)
                setValues({})
              }}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                category === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Date */}
        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${inputClass} max-w-xs`}
          />
        </div>

        {/* Dynamic fields */}
        <div className="grid grid-cols-2 gap-4">
          {logTypes[category].map(({ key, label, unit, placeholder }) => (
            <div key={key}>
              <label className={labelClass}>
                {label} ({unit})
              </label>
              <input
                type="number"
                step="any"
                value={values[key] || ''}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className={inputClass}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Log Data'}
        </button>
      </form>
    </Card>
  )
}
