'use client'

import Image from 'next/image'
import { useTransition } from 'react'
import { Check, X } from 'lucide-react'
import { acceptFollowRequest, rejectFollowRequest } from '@/app/actions/social'

type Request = {
  follower_id: string
  display_name: string
  username: string | null
  avatar_url: string | null
  created_at: string
}

type Props = { requests: Request[] }

export default function FollowRequests({ requests }: Props) {
  if (requests.length === 0) return null

  return (
    <div className="card-squircle p-4 sm:p-6 space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Follow Requests</h3>
        <span className="text-xs font-bold bg-blue-600 text-white rounded-full px-2 py-0.5">
          {requests.length}
        </span>
      </div>
      <div className="space-y-2">
        {requests.map((r) => (
          <RequestRow key={r.follower_id} request={r} />
        ))}
      </div>
    </div>
  )
}

function RequestRow({ request }: { request: Request }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-blue-600 dark:text-blue-400 overflow-hidden">
        {request.avatar_url
          ? <Image src={request.avatar_url} alt={request.display_name} width={36} height={36} className="w-full h-full object-cover" unoptimized />
          : request.display_name.charAt(0).toUpperCase()
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{request.display_name}</p>
        {request.username && <p className="text-xs text-gray-400 dark:text-gray-500">@{request.username}</p>}
      </div>
      <div className="flex gap-2">
        <button
          disabled={isPending}
          onClick={() => startTransition(async () => { await acceptFollowRequest(request.follower_id) })}
          className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors disabled:opacity-50"
          aria-label="Accept"
        >
          <Check size={15} />
        </button>
        <button
          disabled={isPending}
          onClick={() => startTransition(async () => { await rejectFollowRequest(request.follower_id) })}
          className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors disabled:opacity-50"
          aria-label="Reject"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
