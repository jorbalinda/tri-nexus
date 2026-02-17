'use client'

import type { LabTest } from '@/lib/types/lab-tests'
import LabTestCard from './LabTestCard'

interface LabTestGridProps {
  tests: LabTest[]
  onSelectTest: (test: LabTest) => void
  latestByTest?: Map<string, string>
}

export default function LabTestGrid({ tests, onSelectTest, latestByTest }: LabTestGridProps) {
  if (tests.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-gray-400 dark:text-gray-500">No tests found for this category.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
        {tests.length} test{tests.length !== 1 ? 's' : ''}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tests.map((test) => (
          <LabTestCard
            key={test.id}
            test={test}
            onClick={() => onSelectTest(test)}
            lastDate={latestByTest?.get(test.id)}
          />
        ))}
      </div>
    </div>
  )
}
