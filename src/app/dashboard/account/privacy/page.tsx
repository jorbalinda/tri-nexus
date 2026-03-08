'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Trash2, AlertTriangle, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  const router = useRouter()

  // Export state
  const [exporting, setExporting] = useState(false)
  const [exportDone, setExportDone] = useState(false)

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/account/export')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `triraceday-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExportDone(true)
      setTimeout(() => setExportDone(false), 4000)
    } catch {
      // silently fail — browser download errors are rare
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      if (res.ok) {
        router.push('/?deleted=1')
      } else {
        const body = await res.json().catch(() => ({}))
        setDeleteError(body.error ?? `Server error — please try again.`)
        setDeleting(false)
      }
    } catch {
      setDeleteError('Network error — please check your connection and try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Back link */}
      <Link
        href="/dashboard/profile"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-2"
      >
        <ChevronLeft size={14} />
        Back to Profile
      </Link>

      <div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Privacy & Data</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Manage your personal data in accordance with our Privacy Policy.
        </p>
      </div>

      {/* Export card */}
      <div className="card-squircle p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#4361ee]/10 dark:bg-[#4361ee]/15 flex items-center justify-center shrink-0">
            <Download size={15} className="text-[#4361ee]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Export Your Data</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
              Download a complete copy of everything we have on file — your profile, workouts,
              races, training plans, and consent records. Delivered as a JSON file.
            </p>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 size={13} className="animate-spin" />
          ) : exportDone ? (
            <CheckCircle2 size={13} />
          ) : (
            <Download size={13} />
          )}
          {exporting ? 'Preparing...' : exportDone ? 'Downloaded' : 'Download My Data'}
        </button>

        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">
          We respond to data requests within 45 days per the Utah Consumer Privacy Act.
          Questions? Email <span className="text-[#57a2ea]">privacy@triraceday.com</span>
        </p>
      </div>

      {/* Delete card */}
      <div className="card-squircle p-5 border border-[#d62828]/20 dark:border-[#d62828]/25">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#d62828]/10 dark:bg-[#d62828]/15 flex items-center justify-center shrink-0">
            <Trash2 size={15} className="text-[#d62828]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Delete Account</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
              Permanently deletes your account, profile, all workouts, races, and training data.
              This action cannot be undone.
            </p>
          </div>
        </div>

        {!deleteOpen ? (
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#d62828]/30 dark:border-[#d62828]/40 text-[#d62828] text-xs font-semibold hover:bg-[#d62828]/5 dark:hover:bg-[#d62828]/10 active:scale-[0.98] transition-all"
          >
            <Trash2 size={13} />
            Delete My Account
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#d62828]/5 dark:bg-[#d62828]/10 border border-[#d62828]/15 dark:border-[#d62828]/20">
              <AlertTriangle size={14} className="text-[#d62828] shrink-0 mt-0.5" />
              <p className="text-xs text-[#d62828] dark:text-[#e2622c] leading-relaxed">
                All your data will be permanently deleted — workouts, races, plans, and your profile.
                Consent audit records are retained as required by law.
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-1.5">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#d62828]/20 focus:border-[#d62828]/50"
              />
            </div>

            {deleteError && (
              <p className="text-xs text-[#d62828]">{deleteError}</p>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setDeleteOpen(false); setConfirmText(''); setDeleteError(null) }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#d62828] text-white text-xs font-semibold hover:bg-[#b52222] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting && <Loader2 size={12} className="animate-spin" />}
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
