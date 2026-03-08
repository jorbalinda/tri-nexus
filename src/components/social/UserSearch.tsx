'use client'

import Image from 'next/image'
import { useState, useTransition } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { searchUsers } from '@/app/actions/social'
import FollowButton from './FollowButton'

type UserResult = {
  user_id: string
  display_name: string
  username: string | null
  avatar_url: string | null
  follow_status: 'accepted' | 'pending' | false
}

export default function UserSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserResult[]>([])
  const [searched, setSearched] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSearch = () => {
    if (query.trim().length < 2) return
    startTransition(async () => {
      const res = await searchUsers(query)
      setResults(res)
      setSearched(true)
    })
  }

  return (
    <div className="card-squircle p-4 sm:p-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Find Athletes</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Search by @username to follow other athletes</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="@username"
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isPending || query.trim().length < 2}
          className="px-4 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-40 flex items-center gap-2 min-h-[48px]"
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : 'Search'}
        </button>
      </div>

      {searched && results.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500">No athletes found for &ldquo;{query}&rdquo;.</p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.user_id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-blue-600 dark:text-blue-400 overflow-hidden">
                {r.avatar_url
                  ? <Image src={r.avatar_url} alt={r.display_name} width={36} height={36} className="w-full h-full object-cover" unoptimized />
                  : r.display_name.charAt(0).toUpperCase()
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{r.display_name}</p>
                {r.username && <p className="text-xs text-gray-400 dark:text-gray-500">@{r.username}</p>}
              </div>
              <FollowButton targetUserId={r.user_id} initialStatus={r.follow_status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
