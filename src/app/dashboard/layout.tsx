'use client'

import Sidebar from '@/components/layout/Sidebar'
import TabBar from '@/components/layout/TabBar'
import { UnitProvider } from '@/hooks/useUnits'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UnitProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main style={{ marginLeft: 'var(--sidebar-width)' }} className="p-8">
          <TabBar />
          {children}
        </main>
      </div>
    </UnitProvider>
  )
}
