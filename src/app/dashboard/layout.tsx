import Sidebar from '@/components/layout/Sidebar'
import TabBar from '@/components/layout/TabBar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen" style={{ background: '#FBFBFD' }}>
      <Sidebar />
      <main style={{ marginLeft: 'var(--sidebar-width)' }} className="p-8">
        <TabBar />
        {children}
      </main>
    </div>
  )
}
