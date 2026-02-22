'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import DeviceConnectionCard from '@/components/profile/DeviceConnectionCard'

interface ProfileData {
  display_name: string
  email: string
  weight_kg: number | null
  date_of_birth: string | null
  gender: string | null
  unit_system: string
  timezone: string
}

const INPUT_CLASS = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'
const LABEL_CLASS = 'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [unitSystem, setUnitSystem] = useState('metric')
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('display_name, email, weight_kg, date_of_birth, gender, unit_system, timezone')
        .eq('id', user.id)
        .single()

      if (data) {
        const p = data as ProfileData
        setProfile(p)
        setDisplayName(p.display_name || '')
        setWeightKg(p.weight_kg?.toString() || '')
        setDob(p.date_of_birth || '')
        setGender(p.gender || '')
        setUnitSystem(p.unit_system || 'metric')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      display_name: displayName || null,
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      date_of_birth: dob || null,
      gender: gender || null,
      unit_system: unitSystem,
    }).eq('id', user.id)

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
          Profile
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Athlete Profile
        </h1>
      </div>

      {/* Personal Info */}
      <div className="card-squircle p-6 sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-4">
          Personal Information
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={LABEL_CLASS}>Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Email</label>
            <input type="email" value={profile?.email || ''} disabled className={`${INPUT_CLASS} opacity-50`} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Weight (kg)</label>
            <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className={INPUT_CLASS} placeholder="75" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Date of Birth</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className={INPUT_CLASS}>
              <option value="">Not set</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-binary</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Units</label>
            <select value={unitSystem} onChange={(e) => setUnitSystem(e.target.value)} className={INPUT_CLASS}>
              <option value="metric">Metric (km, kg)</option>
              <option value="imperial">Imperial (mi, lbs)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Devices */}
      <DeviceConnectionCard />
    </div>
  )
}
