'use client'

import { useState, useMemo } from 'react'
import LabCategoryTabs from '@/components/labs/LabCategoryTabs'
import LabTestGrid from '@/components/labs/LabTestGrid'
import LabTestDetailModal from '@/components/labs/LabTestDetailModal'
import { LAB_CATEGORY_META, getTestsByCategory } from '@/lib/data/lab-tests'
import type { LabCategory, LabTest } from '@/lib/types/lab-tests'

export default function LabsPage() {
  const [category, setCategory] = useState<LabCategory>('blood_work')
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null)

  const tests = useMemo(() => getTestsByCategory(category), [category])
  const meta = LAB_CATEGORY_META[category]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Lab Results
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Biomarkers and tests every triathlete should track
          </p>
        </div>
        <LabCategoryTabs activeCategory={category} onCategoryChange={setCategory} />
      </div>

      {/* Category description */}
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
        {meta.description}
      </p>

      <LabTestGrid
        tests={tests}
        onSelectTest={setSelectedTest}
      />

      <LabTestDetailModal
        test={selectedTest}
        onClose={() => setSelectedTest(null)}
      />
    </div>
  )
}
