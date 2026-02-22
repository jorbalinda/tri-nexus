'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function RaceDayLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] text-white overflow-auto" style={{ marginLeft: 0 }}>
      <div className="absolute top-4 left-4 z-50">
        <Link
          href={`/dashboard/races/${params.id}`}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          &larr; Exit Race Day Mode
        </Link>
      </div>
      {children}
    </div>
  )
}
