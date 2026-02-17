'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LabTest } from '@/lib/types/lab-tests'

interface LabResultLogFormProps {
  test: LabTest
  onSaved: () => void
}

export default function LabResultLogForm({ test, onSaved }: LabResultLogFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Build marker fields based on test type
  const markerFields = getMarkerFields(test)
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    markerFields.forEach((f) => { init[f.key] = '' })
    return init
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()

    // Insert parent lab_results row
    const { data: result, error: resultError } = await supabase
      .from('lab_results')
      .insert({ test_id: test.id, date, notes: notes || null })
      .select('id')
      .single()

    if (resultError || !result) {
      setSaving(false)
      return
    }

    // Batch insert markers
    const markers = markerFields
      .filter((f) => values[f.key] !== '')
      .map((f) => ({
        lab_result_id: result.id,
        marker_name: f.label,
        value: parseFloat(values[f.key]),
        unit: f.unit || null,
      }))

    if (markers.length > 0) {
      await supabase.from('lab_result_markers').insert(markers)
    }

    // Reset form
    setNotes('')
    setValues(() => {
      const init: Record<string, string> = {}
      markerFields.forEach((f) => { init[f.key] = '' })
      return init
    })
    setSaving(false)
    onSaved()
  }

  const hasValues = markerFields.some((f) => values[f.key] !== '')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1.5">
          Test Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      {/* Marker inputs */}
      <div className="space-y-3">
        <label className="block text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500">
          Values
        </label>
        {markerFields.map((field) => (
          <div key={field.key} className="flex items-center gap-3">
            <label className="text-sm text-gray-700 dark:text-gray-300 w-32 shrink-0 truncate" title={field.label}>
              {field.label}
            </label>
            <input
              type="number"
              step="any"
              value={values[field.key]}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              placeholder="—"
              className="flex-1 px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            {field.unit && (
              <span className="text-xs text-gray-400 dark:text-gray-500 w-16 shrink-0">{field.unit}</span>
            )}
          </div>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1.5">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
          placeholder="Any relevant context..."
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving || !hasValues}
        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {saving ? 'Saving...' : 'Save Results'}
      </button>
    </form>
  )
}

interface MarkerField {
  key: string
  label: string
  unit?: string
}

function getMarkerFields(test: LabTest): MarkerField[] {
  if (test.submarkers && test.submarkers.length > 0) {
    return test.submarkers.map((s) => ({
      key: s.name,
      label: s.name,
      unit: s.unit,
    }))
  }

  if (test.optimalRange || test.unit) {
    return [{
      key: test.shortName,
      label: test.shortName,
      unit: test.unit,
    }]
  }

  return [{
    key: 'value',
    label: 'Value',
    unit: undefined,
  }]
}
