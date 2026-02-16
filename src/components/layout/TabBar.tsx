'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Upload } from 'lucide-react'

const tabs = [
  { label: 'Swim', href: '/dashboard/swim', color: 'text-blue-600' },
  { label: 'Bike', href: '/dashboard/bike', color: 'text-orange-600' },
  { label: 'Run', href: '/dashboard/run', color: 'text-green-600' },
  { label: 'Synergy', href: '/dashboard/synergy', color: 'text-purple-600' },
]

export default function TabBar() {
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-between mb-8">
      {/* Tab pills */}
      <div className="flex items-center gap-1 bg-gray-200/50 rounded-2xl p-1.5">
        {tabs.map(({ label, href, color }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? `bg-white shadow-sm ${color}`
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Upload button */}
      <Link
        href="/dashboard/log"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all"
      >
        <Upload size={16} />
        Upload .FIT
      </Link>
    </div>
  )
}
