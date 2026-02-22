'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Package, Plus, RefreshCw, Trash2, AlertTriangle, CheckCircle2, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useGearItems } from '@/hooks/useGearItems'
import type { TargetRace } from '@/lib/types/target-race'
import type { GearItem } from '@/lib/types/database'

const CATEGORIES: { key: GearItem['category']; label: string; color: string }[] = [
  { key: 'swim', label: 'Swim', color: 'text-blue-500' },
  { key: 'bike', label: 'Bike', color: 'text-orange-500' },
  { key: 'run', label: 'Run', color: 'text-green-500' },
  { key: 'transition', label: 'Transition', color: 'text-purple-500' },
  { key: 'post_race', label: 'Post-Race', color: 'text-gray-500' },
]

export default function GearPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const [race, setRace] = useState<TargetRace | null>(null)
  const { items, loading, packedCount, totalCount, requiredUnpacked, togglePacked, addCustomItem, removeItem, generateDefaults } = useGearItems(id, race)

  const [addingTo, setAddingTo] = useState<GearItem['category'] | null>(null)
  const [newItemName, setNewItemName] = useState('')

  useEffect(() => {
    async function loadRace() {
      const { data } = await supabaseRef.current
        .from('target_races')
        .select('*')
        .eq('id', id)
        .single()
      setRace(data as TargetRace | null)
    }
    loadRace()
  }, [id])

  // Auto-generate if no items exist and race is loaded
  useEffect(() => {
    if (race && !loading && items.length === 0) {
      generateDefaults()
    }
  }, [race, loading, items.length, generateDefaults])

  const handleAddItem = async () => {
    if (!addingTo || !newItemName.trim()) return
    await addCustomItem(newItemName.trim(), addingTo)
    setNewItemName('')
    setAddingTo(null)
  }

  const progressPercent = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/dashboard/races/${id}`)}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">
            Gear
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Packing List
          </h1>
        </div>
        <button
          onClick={generateDefaults}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} />
          Reset
        </button>
      </div>

      {/* Progress bar */}
      <div className="card-squircle p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {packedCount} / {totalCount} packed
            </span>
          </div>
          {requiredUnpacked > 0 && (
            <div className="flex items-center gap-1.5 text-amber-500">
              <AlertTriangle size={14} />
              <span className="text-xs font-medium">{requiredUnpacked} required items unpacked</span>
            </div>
          )}
          {requiredUnpacked === 0 && totalCount > 0 && (
            <div className="flex items-center gap-1.5 text-green-500">
              <CheckCircle2 size={14} />
              <span className="text-xs font-medium">All set!</span>
            </div>
          )}
        </div>
        <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 text-right mt-1">{progressPercent}%</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-squircle p-6 h-24 animate-pulse bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        <>
          {/* Categories */}
          {CATEGORIES.map(({ key, label, color }) => {
            const categoryItems = items.filter((i) => i.category === key)
            if (categoryItems.length === 0) return null

            const categoryPacked = categoryItems.filter((i) => i.is_packed).length

            return (
              <div key={key} className="card-squircle p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-bold uppercase tracking-[2px] ${color}`}>
                    {label}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {categoryPacked}/{categoryItems.length}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                    >
                      <button
                        onClick={() => togglePacked(item.id)}
                        className="cursor-pointer flex-shrink-0"
                      >
                        {item.is_packed ? (
                          <CheckCircle2 size={20} className="text-green-500" />
                        ) : (
                          <Circle size={20} className="text-gray-300 dark:text-gray-600" />
                        )}
                      </button>
                      <span className={`text-sm flex-1 ${
                        item.is_packed
                          ? 'text-gray-400 dark:text-gray-500 line-through'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {item.item_name}
                        {item.is_required && !item.is_packed && (
                          <span className="text-[10px] text-amber-500 ml-2">required</span>
                        )}
                      </span>
                      {item.is_custom && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} className="text-gray-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add custom item */}
                {addingTo === key ? (
                  <div className="flex items-center gap-2 mt-3 px-3">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                      placeholder="Item name..."
                      autoFocus
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-transparent dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <button
                      onClick={handleAddItem}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setAddingTo(null); setNewItemName('') }}
                      className="px-3 py-2 rounded-lg text-xs text-gray-400 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingTo(key)}
                    className="flex items-center gap-1.5 mt-3 px-3 py-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Add item
                  </button>
                )}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
