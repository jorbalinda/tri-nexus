import Image from 'next/image'
import Link from 'next/link'
import { Trophy, ArrowRight } from 'lucide-react'
import { formatFinishTime } from '@/lib/social/race-projection'
import type { FriendRaceProjection } from '@/app/actions/social'

const DISTANCE_LABEL: Record<string, string> = {
  sprint:  'Sprint',
  olympic: 'Olympic',
  '70.3':  '70.3',
  '140.6': 'Ironman',
  custom:  'Custom',
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  return url ? (
    <Image src={url} alt={name} width={24} height={24} className="rounded-full object-cover flex-shrink-0" unoptimized />
  ) : (
    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

type Props = {
  races: FriendRaceProjection[]
  myDisplayName: string
  myAvatarUrl: string | null
}

export default function FriendsRaceProjections({ races, myDisplayName, myAvatarUrl }: Props) {
  if (races.length === 0) {
    return (
      <div className="card-squircle p-4 sm:p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Trophy size={15} className="text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Race Projections</h3>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Add upcoming races on the{' '}
          <Link href="/dashboard/races" className="text-blue-500 hover:underline">Races page</Link>
          {' '}and your projected finish times will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="card-squircle p-4 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={15} className="text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Race Projections</h3>
        </div>
        <Link
          href="/dashboard/social/races"
          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          View all <ArrowRight size={11} />
        </Link>
      </div>

      <div className="space-y-4">
        {races.map((race) => {
          // Build sorted leaderboard: me + friends, nulls last
          const entries = [
            { user_id: undefined as string | undefined, display_name: myDisplayName, avatar_url: myAvatarUrl, projected: race.myProjected, isMe: true },
            ...race.friends.map((f) => ({ ...f, isMe: false })),
          ].sort((a, b) => {
            if (a.projected == null) return 1
            if (b.projected == null) return -1
            return a.projected - b.projected
          })

          return (
            <div key={race.raceId} className="space-y-2">
              {/* Race label */}
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                  {race.raceName}
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                  {DISTANCE_LABEL[race.raceDistance] ?? race.raceDistance}
                </span>
              </div>

              {/* Leaderboard rows */}
              <div className="space-y-1">
                {entries.map((entry, idx) => {
                  const bgClass = entry.isMe
                    ? 'bg-blue-50/80 dark:bg-blue-950/40'
                    : 'bg-gray-50/50 dark:bg-gray-800/30'
                  const inner = (
                    <>
                      <span className="w-4 text-[10px] font-bold text-center text-gray-400 dark:text-gray-500">
                        {idx + 1}
                      </span>
                      <Avatar name={entry.display_name} url={entry.avatar_url} />
                      <p className={`flex-1 text-xs font-medium truncate ${
                        entry.isMe ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        {entry.display_name}
                        {entry.isMe && <span className="ml-1 text-blue-400 font-normal">(you)</span>}
                      </p>
                      <p className="text-xs font-semibold tabular-nums shrink-0 text-gray-700 dark:text-gray-300">
                        {entry.projected ? formatFinishTime(entry.projected) : '—'}
                      </p>
                    </>
                  )

                  if (!entry.isMe && entry.user_id) {
                    return (
                      <Link
                        key={`${race.raceId}-${idx}`}
                        href={`/dashboard/social/${entry.user_id}`}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl ${bgClass} hover:opacity-80 transition-opacity`}
                      >
                        {inner}
                      </Link>
                    )
                  }

                  return (
                    <div
                      key={`${race.raceId}-${idx}`}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-xl ${bgClass}`}
                    >
                      {inner}
                    </div>
                  )
                })}
              </div>

              {race.friends.length === 0 && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 px-1">
                  Follow friends racing this event to compare times.
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
