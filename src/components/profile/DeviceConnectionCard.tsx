'use client'

import { useEffect, useState } from 'react'
import { Watch, Check, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { apiGet, apiDelete } from '@/lib/api/client'

interface Integration {
  id: string
  provider: string
  sync_status: string
  last_sync_at: string | null
}

export default function DeviceConnectionCard() {
  const [connections, setConnections] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    apiGet<Integration[]>('/api/integrations')
      .then(setConnections)
      .catch(() => setConnections([]))
      .finally(() => setLoading(false))
  }, [])

  const garmin = connections.find((c) => c.provider === 'garmin')

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Garmin? Your existing workout data will be preserved.')) return
    setDisconnecting(true)
    try {
      await apiDelete('/api/integrations/garmin')
      setConnections((prev) =>
        prev.map((c) => c.provider === 'garmin' ? { ...c, sync_status: 'disconnected' } : c)
      )
    } catch { /* ignore */ }
    setDisconnecting(false)
  }

  const handleSyncNow = async () => {
    setSyncing(true)
    // Trigger a manual sync by hitting the auth flow — for now, show feedback
    setTimeout(() => setSyncing(false), 2000)
  }

  const formatSyncTime = (dateStr: string | null): string => {
    if (!dateStr) return 'Never'
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="card-squircle p-6">
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-4">
        Connected Devices
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Garmin */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Watch size={20} className="text-gray-300 dark:text-gray-600" />
              <div>
                <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">Garmin Connect</p>
                <p className="text-xs text-gray-300 dark:text-gray-600">Not available yet</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-xs font-semibold cursor-not-allowed select-none">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
