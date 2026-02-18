'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, LayoutDashboard, ClipboardList, FlaskConical, Flag, LogOut, Sun, Moon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useReadiness } from '@/hooks/useReadiness'

const navItems = [
  { label: 'Race Day', href: '/dashboard/race-day', icon: Flag },
  { label: 'Home', href: '/dashboard', icon: Home, exact: true },
  { label: 'Dashboard', href: '/dashboard/swim', icon: LayoutDashboard },
  { label: 'Training Plan', href: '/dashboard/plan', icon: ClipboardList },
  { label: 'Lab Results', href: '/dashboard/labs', icon: FlaskConical },
]

function readinessBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

function cnsTextColor(status: string): string {
  if (status === 'optimal') return 'text-green-600'
  if (status === 'warning') return 'text-yellow-600'
  return 'text-red-600'
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { loading, score, cns } = useReadiness()

  useEffect(() => setMounted(true), [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col justify-between py-10 px-6 glass"
      style={{
        width: 'var(--sidebar-width)',
        borderRight: '1px solid var(--glass-border)',
      }}
    >
      {/* Top section */}
      <div>
        {/* Branding */}
        <div className="mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[3px] text-blue-500">
            TRI-NEXUS
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Intelligence Platform</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map(({ label, href, icon: Icon, exact }) => {
            const isActive = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-blue-600 bg-blue-50/80 dark:bg-blue-950/40 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-4">
        {/* Daily Readiness */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-3">
            Daily Readiness
          </p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '--' : score ?? '--'}
            </span>
            <span className="text-sm text-gray-400 dark:text-gray-500 mb-1">/ 100</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${score !== null ? readinessBarColor(score) : 'bg-gray-300'}`}
              style={{ width: score !== null ? `${score}%` : '0%' }}
            />
          </div>
        </div>

        {/* CNS Balance */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">
            CNS Balance
          </p>
          <p className={`text-sm font-semibold ${cns ? cnsTextColor(cns.status) : 'text-gray-400'}`}>
            {loading ? '--' : cns?.label ?? '--'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {loading ? '' : cns?.description ?? ''}
          </p>
        </div>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
          >
            {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
