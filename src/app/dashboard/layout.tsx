import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import { UnitProvider } from '@/hooks/useUnits'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UnitProvider>
      <div className="min-h-[100dvh] bg-background overflow-x-hidden">
        <Sidebar />
        <main className="px-4 py-6 lg:ml-[var(--sidebar-width)] lg:px-8 lg:py-8 pb-safe-nav">
          {children}
        </main>
        <BottomNav />
      </div>
    </UnitProvider>
  )
}
