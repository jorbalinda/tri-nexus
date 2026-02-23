'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Bike, Save } from 'lucide-react'
import { useEquipmentProfile } from '@/hooks/useEquipmentProfile'

const INPUT_CLASS = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'
const LABEL_CLASS = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

const KG_TO_LBS = 2.20462

function kgToLbs(kg: number): number {
  return Math.round(kg * KG_TO_LBS * 100) / 100
}

function lbsToKg(lbs: number): number {
  return Math.round(lbs / KG_TO_LBS * 1000) / 1000
}

function SegmentedToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            value === opt.value
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function EquipmentPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { profile, loading, save } = useEquipmentProfile(id)

  const [bikeWeight, setBikeWeight] = useState('')
  const [bottleWeight, setBottleWeight] = useState('')
  const [nutritionWeight, setNutritionWeight] = useState('')
  const [tireFront, setTireFront] = useState('')
  const [tireRear, setTireRear] = useState('')
  const [cda, setCda] = useState('')
  const [cdaSource, setCdaSource] = useState<'wind_tunnel' | 'estimated'>('estimated')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Populate form when profile loads
  if (profile && !initialized) {
    const unit = profile.weight_unit || 'kg'
    setWeightUnit(unit)

    // DB stores kg — convert to display unit
    if (unit === 'lbs') {
      setBikeWeight(profile.bike_weight_kg != null ? kgToLbs(profile.bike_weight_kg).toString() : '')
      setBottleWeight(profile.bottle_weight_kg != null ? kgToLbs(profile.bottle_weight_kg).toString() : '')
      setNutritionWeight(profile.race_nutrition_weight_kg != null ? kgToLbs(profile.race_nutrition_weight_kg).toString() : '')
    } else {
      setBikeWeight(profile.bike_weight_kg?.toString() || '')
      setBottleWeight(profile.bottle_weight_kg?.toString() || '')
      setNutritionWeight(profile.race_nutrition_weight_kg?.toString() || '')
    }

    setTireFront(profile.tire_pressure_front?.toString() || '')
    setTireRear(profile.tire_pressure_rear?.toString() || '')
    setCda(profile.cda?.toString() || '')
    setCdaSource(profile.cda_source || 'estimated')
    setInitialized(true)
  }

  if (!loading && !profile && !initialized) {
    setInitialized(true)
  }

  // When toggling unit, convert current values in place
  const handleUnitChange = (newUnit: 'kg' | 'lbs') => {
    if (newUnit === weightUnit) return

    const convert = newUnit === 'lbs' ? kgToLbs : lbsToKg

    if (bikeWeight) setBikeWeight(convert(parseFloat(bikeWeight)).toString())
    if (bottleWeight) setBottleWeight(convert(parseFloat(bottleWeight)).toString())
    if (nutritionWeight) setNutritionWeight(convert(parseFloat(nutritionWeight)).toString())

    setWeightUnit(newUnit)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      // Always convert to kg for storage
      const toKg = (val: string) => {
        if (!val) return null
        const n = parseFloat(val)
        return weightUnit === 'lbs' ? lbsToKg(n) : n
      }

      await save({
        bike_weight_kg: toKg(bikeWeight),
        bottle_weight_kg: toKg(bottleWeight),
        race_nutrition_weight_kg: toKg(nutritionWeight),
        tire_pressure_front: tireFront ? parseFloat(tireFront) : null,
        tire_pressure_rear: tireRear ? parseFloat(tireRear) : null,
        cda: cda ? parseFloat(cda) : null,
        cda_source: cda ? cdaSource : null,
        weight_unit: weightUnit,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const unitLabel = weightUnit === 'kg' ? 'kg' : 'lbs'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/dashboard/races/${id}`)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
            Equipment
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Equipment Profile
          </h1>
        </div>
      </div>

      <div className="card-squircle p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
              <Bike size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bike Setup</h2>
              <p className="text-xs text-gray-400">Used by the projection engine for bike split prediction</p>
            </div>
          </div>
          <SegmentedToggle
            value={weightUnit}
            onChange={handleUnitChange}
            options={[
              { value: 'kg', label: 'kg' },
              { value: 'lbs', label: 'lbs' },
            ]}
          />
        </div>

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Bike Weight ({unitLabel})</label>
              <input
                type="number"
                step="0.1"
                value={bikeWeight}
                onChange={(e) => setBikeWeight(e.target.value)}
                className={INPUT_CLASS}
                placeholder={weightUnit === 'kg' ? '8.5' : '18.7'}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Bottle Weight ({unitLabel})</label>
              <input
                type="number"
                step="0.1"
                value={bottleWeight}
                onChange={(e) => setBottleWeight(e.target.value)}
                className={INPUT_CLASS}
                placeholder={weightUnit === 'kg' ? '1.2' : '2.6'}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Race Nutrition Weight ({unitLabel})</label>
            <input
              type="number"
              step="0.1"
              value={nutritionWeight}
              onChange={(e) => setNutritionWeight(e.target.value)}
              className={INPUT_CLASS}
              placeholder={weightUnit === 'kg' ? '0.5' : '1.1'}
            />
            <p className="text-[10px] text-gray-400 mt-1">Total weight of gels, bars, and nutrition on bike</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Tire Pressure Front (psi)</label>
              <input
                type="number"
                value={tireFront}
                onChange={(e) => setTireFront(e.target.value)}
                className={INPUT_CLASS}
                placeholder="80"
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Tire Pressure Rear (psi)</label>
              <input
                type="number"
                value={tireRear}
                onChange={(e) => setTireRear(e.target.value)}
                className={INPUT_CLASS}
                placeholder="85"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>CdA (Drag Coefficient)</label>
              <input
                type="number"
                step="0.001"
                value={cda}
                onChange={(e) => setCda(e.target.value)}
                className={INPUT_CLASS}
                placeholder="0.250"
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>CdA Source</label>
              <SegmentedToggle
                value={cdaSource}
                onChange={setCdaSource}
                options={[
                  { value: 'estimated', label: 'Estimated' },
                  { value: 'wind_tunnel', label: 'Wind Tunnel' },
                ]}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer mt-2"
          >
            <Save size={16} />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Equipment Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
