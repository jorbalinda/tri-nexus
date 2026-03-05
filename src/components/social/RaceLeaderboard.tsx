'use client'

import { formatFinishTime } from '@/lib/social/race-projection'
import type { LeaderboardEntry } from '@/lib/types/social'

type Props = {
  entries: LeaderboardEntry[]
  currentUserId: string
  raceName: string
}

export default function RaceLeaderboard({ entries, currentUserId, raceName }: Props) {
  if (entries.length === 0) {
    return (
      <div className="card-squircle p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {raceName} — Leaderboard
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No friends registered yet. Follow athletes racing this event to see projections.
        </p>
      </div>
    )
  }

  return (
    <div className="card-squircle p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {raceName} — Projected Finishes
      </h3>

      <div className="space-y-2">
        {entries.map((entry, idx) => {
          const isMe = entry.user_id === currentUserId
          return (
            <div
              key={entry.user_id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                isMe
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/50'
                  : 'bg-gray-50/50 dark:bg-gray-800/30'
              }`}
            >
              {/* Rank */}
              <span
                className={`w-6 text-center text-xs font-bold ${
                  idx === 0
                    ? 'text-yellow-500'
                    : idx === 1
                    ? 'text-gray-400'
                    : idx === 2
                    ? 'text-amber-600'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {idx + 1}
              </span>

              {/* Avatar */}
              {entry.avatar_url ? (
                <img
                  src={entry.avatar_url}
                  alt={entry.display_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {entry.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isMe ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                  {entry.display_name}
                  {isMe && <span className="ml-1 text-xs text-blue-500">(you)</span>}
                </p>
                {entry.goal_finish_sec && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Goal: {formatFinishTime(entry.goal_finish_sec)}
                  </p>
                )}
              </div>

              {/* Projected time */}
              <div className="text-right">
                {entry.projected_finish_sec ? (
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                    {formatFinishTime(entry.projected_finish_sec)}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500">No data</p>
                )}
                <p className="text-[10px] text-gray-400 dark:text-gray-500">projected</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
