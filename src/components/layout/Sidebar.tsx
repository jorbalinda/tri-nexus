'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ClipboardList, FlaskConical, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Training Plan', href: '/dashboard/plan', icon: ClipboardList },
  { label: 'Lab Results', href: '/dashboard/labs', icon: FlaskConical },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col justify-between py-10 px-6"
      style={{
        width: 'var(--sidebar-width)',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Top section */}
      <div>
        {/* Branding */}
        <div className="mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[3px] text-blue-500">
            TRI-NEXUS
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Intelligence Platform</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href === '/dashboard' && pathname.startsWith('/dashboard/') && !navItems.slice(1).some(n => pathname.startsWith(n.href)))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-blue-600 bg-blue-50/80'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom section — Readiness + CNS */}
      <div className="flex flex-col gap-4">
        {/* Daily Readiness */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 mb-3">
            Daily Readiness
          </p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold text-gray-900">82</span>
            <span className="text-sm text-gray-400 mb-1">/ 100</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '82%' }} />
          </div>
        </div>

        {/* CNS Balance */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 mb-2">
            CNS Balance
          </p>
          <p className="text-sm font-semibold text-green-600">Optimal</p>
          <p className="text-xs text-gray-400 mt-0.5">Recovery on track</p>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
