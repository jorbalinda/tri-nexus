'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, User, HelpCircle, LogOut, Users, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home, exact: true },
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
      className="fixed left-0 top-0 h-screen hidden lg:flex flex-col justify-between py-10 px-6"
      style={{
        width: 'var(--sidebar-width)',
        paddingTop: 'calc(2.5rem + env(safe-area-inset-top))',
        background: 'linear-gradient(160deg, #0f3d8c 0%, #010a1a 100%)',
        borderRight: '1px solid rgba(87, 162, 234, 0.18)',
        boxShadow: '2px 0 24px rgba(16, 72, 160, 0.25)',
      }}
    >
      {/* Top section */}
      <div>
        {/* Branding */}
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-[5px] text-[#4361ee]">
            RACE DAY
          </p>
          <p className="text-xs text-white/40 mt-0.5">Know Your Finish Line</p>
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
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/8'
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
            className="flex items-center gap-2 px-4 py-3 text-sm text-white/40 hover:text-white/80 transition-colors cursor-pointer"
          >
            {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-3 text-sm text-white/40 hover:text-white/80 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
