import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { getFriendProfile } from '@/app/actions/friend-profile'
import { formatFinishTime } from '@/lib/social/race-projection'
import FitnessFingerprint from '@/components/social/FitnessFingerprint'

export const metadata = { title: 'Athlete Profile | Race Day' }

const DISTANCE_LABEL: Record<string, string> = {
  sprint:  'Sprint',
  olympic: 'Olympic',
  '70.3':  '70.3',
  '140.6': 'Ironman',
  custom:  'Custom',
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

const SPORT_COLOR: Record<string, string> = {
  swim: 'text-swim',
  bike: 'text-bike',
  run:  'text-run',
  brick: 'text-[#e63946]',
}

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

type Props = { params: Promise<{ userId: string }> }

export default async function FriendProfilePage({ params }: Props) {
  const { userId } = await params
  const profile = await getFriendProfile(userId)

  if (!profile) {
    return (
      <main className="space-y-6">
        <Link
          href="/dashboard/social"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Friends
        </Link>
        <div className="card-squircle p-6 text-center space-y-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">This profile is private.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Follow this athlete to see their races and activity.
          </p>
        </div>
      </main>
    )
  }

  const initials = profile.display_name.charAt(0).toUpperCase()

  return (
    <main className="space-y-6">
      <Link
        href="/dashboard/social"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Friends
      </Link>

      {/* Header */}
      <div className="card-squircle p-4 sm:p-6 flex items-center gap-4">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.display_name}
            width={56}
            height={56}
            className="rounded-full object-cover flex-shrink-0"
            unoptimized
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">{initials}</span>
          </div>
        )}
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{profile.display_name}</h1>
          {profile.username && (
            <p className="text-sm text-gray-400 dark:text-gray-500">@{profile.username}</p>
          )}
        </div>
      </div>

      {/* Upcoming Races */}
      <div className="card-squircle p-4 sm:p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Upcoming Races</h2>
        {profile.races.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No upcoming races.</p>
        ) : (
          <div className="space-y-2">
            {profile.races.map((race, idx) => (
              <div
                key={idx}
                className="px-3 py-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/30"
              >
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {race.race_name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(race.race_date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                    {DISTANCE_LABEL[race.race_distance] ?? race.race_distance}
                  </span>
                </div>
                {race.projected_sec ? (
                  <div className="mt-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                    <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-gray-400 dark:text-gray-500 mb-0.5">
                      Projected Finish
                    </p>
                    <p className="text-2xl font-bold tabular-nums leading-none" style={{ color: '#ffb703' }}>
                      {formatFinishTime(race.projected_sec)}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">No projection yet</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fitness Fingerprint */}
      {profile.percentiles && (
        <FitnessFingerprint percentiles={profile.percentiles} displayName={profile.display_name} />
      )}

      {/* Recent Activity */}
      <div className="card-squircle p-4 sm:p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
        {profile.recentActivity.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No recent activity.</p>
        ) : (
          <div className="space-y-2">
            {profile.recentActivity.map((item) => {
              const emoji = SPORT_EMOJI[item.activity_type] ?? '🏅'
              const label = SPORT_LABEL[item.activity_type] ?? item.activity_type
              const color = SPORT_COLOR[item.activity_type] ?? 'text-gray-500 dark:text-gray-400'
              const time = relativeTime(item.created_at)
              const meta = item.metadata as { distance_km?: number; duration_min?: number; title?: string }

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30"
                >
                  <span className={`text-base mt-0.5 flex-shrink-0 ${color}`}>{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${color}`}>{label}</p>
                    {meta.title && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{meta.title}</p>
                    )}
                    <div className="flex items-center gap-3 mt-0.5">
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
        )}
      </div>
    </main>
  )
}
