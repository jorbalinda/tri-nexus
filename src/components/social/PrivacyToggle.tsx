'use client'

import { useState, useTransition } from 'react'
import { Lock, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Props = { isPublic: boolean }

export default function PrivacyToggle({ isPublic }: Props) {
  const [pub, setPub] = useState(isPublic)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  const toggle = () => {
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const next = !pub
      await supabase.from('profiles').update({ profile_public: next }).eq('id', user.id)
      setPub(next)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={pub ? 'Account is public, tap to make private' : 'Account is private, tap to make public'}
      className="flex items-center gap-2 min-h-[44px] min-w-[44px] group"
    >
      {/* Icon */}
      <span className={`transition-colors ${pub ? 'text-[#2a9d8f]' : 'text-gray-400 dark:text-gray-500'}`}>
        {pub ? <Globe size={14} /> : <Lock size={14} />}
      </span>

      {/* Label */}
      <span className={`text-xs font-medium transition-colors ${pub ? 'text-[#2a9d8f]' : 'text-gray-500 dark:text-gray-400'}`}>
        {pub ? 'Public' : 'Private'}
      </span>

      {/* Toggle pill */}
      <span className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        isPending ? 'opacity-50' : ''
      } ${pub ? 'bg-[#2a9d8f]' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
          pub ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </span>
    </button>
  )
}
