'use client'

import { useEffect, useState } from 'react'
import { Watch, Loader2, Shield, CheckCircle2, ChevronRight } from 'lucide-react'
import { apiGet, apiDelete } from '@/lib/api/client'
import ConsentSheet from '@/components/consent/ConsentSheet'

interface Integration {
  id: string
  provider: string
  sync_status: string
  last_sync_at: string | null
}

interface ConsentStatus {
  consented: boolean
  agreed_at: string | null
  policy_version: string | null
}

export default function DeviceConnectionCard() {
  const [connections, setConnections] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [consent, setConsent] = useState<ConsentStatus | null>(null)
  const [showConsentSheet, setShowConsentSheet] = useState(false)

  useEffect(() => {
    Promise.all([
      apiGet<Integration[]>('/api/integrations').catch(() => []),
      fetch('/api/consent').then(r => r.json()).catch(() => ({ consented: false })),
    ]).then(([integrations, consentData]) => {
      setConnections(integrations)
      setConsent(consentData)
      setLoading(false)
    })
  }, [])

  const handleConsentAccepted = () => {
    setShowConsentSheet(false)
    setConsent({ consented: true, agreed_at: new Date().toISOString(), policy_version: null })
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
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
            {/* Privacy Policy consent row */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                consent?.consented
                  ? 'bg-[#ffb703]/5 dark:bg-[#ffb703]/5 border-[#ffb703]/20 dark:border-[#ffb703]/20'
                  : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30 hover:bg-amber-50 dark:hover:bg-amber-950/20'
              }`}
              onClick={() => !consent?.consented && setShowConsentSheet(true)}
            >
              <div className="flex items-center gap-3">
                <Shield
                  size={18}
                  className={consent?.consented ? 'text-[#ffb703]' : 'text-amber-500'}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Privacy Policy</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {consent?.consented
                      ? `Accepted ${formatDate(consent.agreed_at)}`
                      : 'Required before connecting devices'}
                  </p>
                </div>
              </div>
              {consent?.consented ? (
                <CheckCircle2 size={18} className="text-[#ffb703] shrink-0" />
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Review & Accept</span>
                  <ChevronRight size={14} className="text-amber-500" />
                </div>
              )}
            </div>

            {/* Garmin */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Watch size={20} className="text-gray-300 dark:text-gray-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">Garmin Connect</p>
                  <p className="text-xs text-gray-300 dark:text-gray-600">
                    {consent?.consented ? 'Not available yet' : 'Accept privacy policy first'}
                  </p>
                </div>
              </div>
              <span className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-xs font-semibold cursor-not-allowed select-none">
                Coming Soon
              </span>
            </div>
          </div>
        )}
      </div>

      {showConsentSheet && (
        <ConsentSheet
          onAccept={handleConsentAccepted}
          onClose={() => setShowConsentSheet(false)}
        />
      )}
    </>
  )
}
