'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Flag, User, HelpCircle, LogOut, Sun, Moon, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home, exact: true },
  { label: 'Races', href: '/dashboard/races', icon: Flag },
  { label: 'Friends', href: '/dashboard/social', icon: Users },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'How It Works', href: '/dashboard/how-it-works', icon: HelpCircle },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen hidden lg:flex flex-col justify-between py-10 px-6 glass"
      style={{
        width: 'var(--sidebar-width)',
        borderRight: '1px solid var(--glass-border)',
        paddingTop: 'calc(2.5rem + env(safe-area-inset-top))',
      }}
    >
      {/* Top section */}
      <div>
        {/* Branding */}
        <div className="mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-blue-500">
            RACE DAY
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Know Your Finish Line</p>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
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
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
          >
            {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
