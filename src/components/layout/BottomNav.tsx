'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Flag, User, HelpCircle, Sun, Moon, Users } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home, exact: true },
  { label: 'Races', href: '/dashboard/races', icon: Flag },
  { label: 'Friends', href: '/dashboard/social', icon: Users },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 glass lg:hidden"
      style={{
        borderTop: '1px solid var(--glass-border)',
        paddingBottom: 'var(--safe-area-bottom)',
      }}
    >
      <div className="flex items-stretch">
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[48px] py-2 transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          )
        })}
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[48px] py-2 text-gray-400 dark:text-gray-500 transition-colors cursor-pointer"
          >
            {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span className="text-[11px] font-medium">Theme</span>
          </button>
        )}
      </div>
    </nav>
  )
}
