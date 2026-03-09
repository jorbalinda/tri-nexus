'use client'

import { useState, useTransition } from 'react'
import { UserPlus, UserMinus, Clock, Loader2, Check } from 'lucide-react'
import { followUser, unfollowUser } from '@/app/actions/social'

type FollowStatus = 'accepted' | 'pending' | false

type Props = {
  targetUserId: string
  initialStatus: FollowStatus
  onFollowed?: () => void
}

export default function FollowButton({ targetUserId, initialStatus, onFollowed }: Props) {
  const [status, setStatus] = useState<FollowStatus>(initialStatus)
  const [justFollowed, setJustFollowed] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      if (status === 'accepted' || status === 'pending') {
        const { error } = await unfollowUser(targetUserId)
        if (!error) setStatus(false)
      } else {
        const { error, status: newStatus } = await followUser(targetUserId)
        if (!error && newStatus) {
          setStatus(newStatus)
          setJustFollowed(true)
          if (onFollowed) setTimeout(onFollowed, 700)
        }
      }
    })
  }

  const label = status === 'accepted' ? 'Following'
    : status === 'pending' ? 'Requested'
    : 'Follow'

  const hoverLabel = status === 'accepted' ? 'Unfollow'
    : status === 'pending' ? 'Cancel'
    : 'Follow'

  if (justFollowed) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#2a9d8f]/15 text-[#2a9d8f] min-h-[44px]">
        <Check size={15} />
        Following!
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${
        status === 'accepted'
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400'
          : status === 'pending'
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400'
          : 'bg-primary text-white hover:bg-primary-hover'
      }`}
    >
      {isPending ? (
        <Loader2 size={15} className="animate-spin" />
      ) : status === 'accepted' ? (
        <>
          <UserMinus size={15} className="hidden group-hover:block" />
          <UserPlus size={15} className="block group-hover:hidden" />
        </>
      ) : status === 'pending' ? (
        <Clock size={15} />
      ) : (
        <UserPlus size={15} />
      )}
      <span className={status ? 'group-hover:hidden' : ''}>{label}</span>
      {status && <span className="hidden group-hover:inline">{hoverLabel}</span>}
    </button>
  )
}
