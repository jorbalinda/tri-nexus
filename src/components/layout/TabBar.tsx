'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Upload } from 'lucide-react'
import { useUnits } from '@/hooks/useUnits'

const tabs = [
  { label: 'Swim', href: '/dashboard/swim', color: 'text-blue-600' },
  { label: 'Bike', href: '/dashboard/bike', color: 'text-orange-600' },
  { label: 'Run', href: '/dashboard/run', color: 'text-green-600' },
  { label: 'Synergy', href: '/dashboard/synergy', color: 'text-purple-600' },
]

export default function TabBar() {
  const pathname = usePathname()
  const { distanceUnit, speedUnit, toggleDistance, toggleSpeed } = useUnits()

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/plan') || pathname.startsWith('/dashboard/log') || pathname.startsWith('/dashboard/labs') || pathname.startsWith('/dashboard/race-day')) {
    return null
  }

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        {/* Unit toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDistance}
            className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden text-xs font-semibold cursor-pointer"
          >
            <span
              className={`px-3 py-2 transition-all ${
                distanceUnit === 'meters'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Meters
            </span>
            <span
              className={`px-3 py-2 transition-all ${
                distanceUnit === 'yards'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Yards
            </span>
          </button>

          <button
            onClick={toggleSpeed}
            className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden text-xs font-semibold cursor-pointer"
          >
            <span
              className={`px-3 py-2 transition-all ${
                speedUnit === 'km'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              KM
            </span>
            <span
              className={`px-3 py-2 transition-all ${
                speedUnit === 'miles'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Miles
            </span>
          </button>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-2xl p-1.5">
          {tabs.map(({ label, href, color }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? `bg-[var(--card-bg)] shadow-sm ${color}`
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Upload button */}
      <Link
        href="/dashboard/log"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all"
      >
        <Upload size={16} />
        Upload
      </Link>
    </div>
  )
}
