'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Bike, Save } from 'lucide-react'
import { useEquipmentProfile } from '@/hooks/useEquipmentProfile'

const INPUT_CLASS = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'
const LABEL_CLASS = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

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
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Populate form when profile loads
  if (profile && !initialized) {
    setBikeWeight(profile.bike_weight_kg?.toString() || '')
    setBottleWeight(profile.bottle_weight_kg?.toString() || '')
    setNutritionWeight(profile.race_nutrition_weight_kg?.toString() || '')
    setTireFront(profile.tire_pressure_front?.toString() || '')
    setTireRear(profile.tire_pressure_rear?.toString() || '')
    setCda(profile.cda?.toString() || '')
    setCdaSource(profile.cda_source || 'estimated')
    setInitialized(true)
  }

  if (!loading && !profile && !initialized) {
    setInitialized(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await save({
        bike_weight_kg: bikeWeight ? parseFloat(bikeWeight) : null,
        bottle_weight_kg: bottleWeight ? parseFloat(bottleWeight) : null,
        race_nutrition_weight_kg: nutritionWeight ? parseFloat(nutritionWeight) : null,
        tire_pressure_front: tireFront ? parseFloat(tireFront) : null,
        tire_pressure_rear: tireRear ? parseFloat(tireRear) : null,
        cda: cda ? parseFloat(cda) : null,
        cda_source: cda ? cdaSource : null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
            <Bike size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bike Setup</h2>
            <p className="text-xs text-gray-400">Used by the projection engine for bike split prediction</p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Bike Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={bikeWeight}
                onChange={(e) => setBikeWeight(e.target.value)}
                className={INPUT_CLASS}
                placeholder="8.5"
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Bottle Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={bottleWeight}
                onChange={(e) => setBottleWeight(e.target.value)}
                className={INPUT_CLASS}
                placeholder="1.2"
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Race Nutrition Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={nutritionWeight}
              onChange={(e) => setNutritionWeight(e.target.value)}
              className={INPUT_CLASS}
              placeholder="0.5"
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
              <select
                value={cdaSource}
                onChange={(e) => setCdaSource(e.target.value as 'wind_tunnel' | 'estimated')}
                className={INPUT_CLASS}
              >
                <option value="estimated">Estimated</option>
                <option value="wind_tunnel">Wind Tunnel</option>
              </select>
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
