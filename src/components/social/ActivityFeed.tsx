'use client'

import { formatDistanceToNow } from 'date-fns'
import type { FeedItem } from '@/lib/types/social'

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

  return (
    <div className="card-squircle p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Activity Feed
      </h3>

      <div className="space-y-3">
        {items.map((item) => {
          const name = item.profile?.display_name ?? 'Athlete'
          const emoji = SPORT_EMOJI[item.activity_type] ?? '🏅'
          const label = SPORT_LABEL[item.activity_type] ?? item.activity_type
          const time = formatDistanceToNow(new Date(item.created_at), { addSuffix: true })

          // Extract metadata fields if present
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
              {/* Avatar */}
              {item.profile?.avatar_url ? (
                <img
                  src={item.profile.avatar_url}
                  alt={name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Content */}
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
    </div>
  )
}
