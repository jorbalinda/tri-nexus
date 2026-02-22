'use client'

import { useEffect, useState } from 'react'
import { Watch, Check, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DeviceConnection {
  id: string
  provider: string
  sync_status: string
  last_sync_at: string | null
}

export default function DeviceConnectionCard() {
  const [connections, setConnections] = useState<DeviceConnection[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('device_connections')
        .select('id, provider, sync_status, last_sync_at')

      setConnections((data as DeviceConnection[]) || [])
      setLoading(false)
    }
    fetch()
  }, [supabase])

  const garmin = connections.find((c) => c.provider === 'garmin')

  const handleDisconnect = async (id: string) => {
    await supabase.from('device_connections').update({ sync_status: 'disconnected' }).eq('id', id)
    setConnections((prev) => prev.map((c) => c.id === id ? { ...c, sync_status: 'disconnected' } : c))
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
              <Watch size={20} className={garmin?.sync_status === 'active' ? 'text-green-500' : 'text-gray-400'} />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Garmin Connect</p>
                {garmin ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {garmin.sync_status === 'active' ? (
                      <>
                        <Check size={10} className="inline text-green-500 mr-1" />
                        Connected
                        {garmin.last_sync_at && ` · Last sync ${new Date(garmin.last_sync_at).toLocaleDateString()}`}
                      </>
                    ) : garmin.sync_status === 'error' ? (
                      <>
                        <AlertCircle size={10} className="inline text-red-500 mr-1" />
                        Sync error
                      </>
                    ) : (
                      'Disconnected'
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500">Not connected</p>
                )}
              </div>
            </div>

            {garmin && garmin.sync_status === 'active' ? (
              <button
                onClick={() => handleDisconnect(garmin.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <a
                href="/api/garmin/auth"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all"
              >
                Connect
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
