'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { FeedItem } from '@/lib/types/social'

const INITIAL_VISIBLE = 10

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (seconds < 60) return rtf.format(-seconds, 'second')
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return rtf.format(-minutes, 'minute')
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return rtf.format(-hours, 'hour')
  const days = Math.floor(hours / 24)
  if (days < 30) return rtf.format(-days, 'day')
  const months = Math.floor(days / 30)
  if (months < 12) return rtf.format(-months, 'month')
  return rtf.format(-Math.floor(months / 12), 'year')
}

const SPORT_EMOJI: Record<string, string> = {
  swim: '🏊',
  bike: '🚴',
  run:  '🏃',
  brick: '⚡',
  race_registered: '🏁',
  pr: '🏆',
}

const SPORT_LABEL: Record<string, string> = {
  swim: 'Swim',
  bike: 'Bike',
  run:  'Run',
  brick: 'Brick',
  race_registered: 'Registered for a race',
  pr: 'Personal Record',
}

type Props = {
  items: FeedItem[]
}

export default function ActivityFeed({ items }: Props) {
  const [visible, setVisible] = useState(INITIAL_VISIBLE)

  if (items.length === 0) {
    return (
      <div className="card-squircle p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Activity Feed
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Follow athletes to see their activity here.
        </p>
      </div>
    )
  }

  const shown = items.slice(0, visible)
  const hasMore = visible < items.length

  return (
    <div className="card-squircle p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Activity Feed
        </h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {shown.length} of {items.length}
        </span>
      </div>

      <div className="space-y-3">
        {shown.map((item) => {
          const name = item.profile?.display_name ?? (item.profile?.username ? `@${item.profile.username}` : 'Athlete')
          const emoji = SPORT_EMOJI[item.activity_type] ?? '🏅'
          const label = SPORT_LABEL[item.activity_type] ?? item.activity_type
          const time = relativeTime(item.created_at)

          const meta = item.metadata as {
            distance_km?: number
            duration_min?: number
            title?: string
          }

          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30"
            >
              {item.profile?.avatar_url ? (
                <Image
                  src={item.profile.avatar_url}
                  alt={name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover flex-shrink-0 mt-0.5"
                  unoptimized
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {name}
                  </span>
                  {item.profile?.username && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">@{item.profile.username}</span>
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    logged a {emoji} {label}
                  </span>
                </div>

                {meta.title && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {meta.title}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-1">
                  {meta.distance_km != null && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {meta.distance_km.toFixed(1)} km
                    </span>
                  )}
                  {meta.duration_min != null && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {meta.duration_min} min
                    </span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-500">{time}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setVisible(items.length)}
          className="mt-4 w-full py-2 text-xs font-medium text-accent hover:underline transition-colors"
        >
          Show {items.length - visible} more
        </button>
      )}
    </div>
  )
}
