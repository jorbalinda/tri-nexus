import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSocialFeed, getMyFitnessPercentiles, getPendingFollowRequests, getFriendsRaceProjections, getFollowingList } from '@/app/actions/social'
import FitnessFingerprint from '@/components/social/FitnessFingerprint'
import FriendsRaceProjections from '@/components/social/FriendsRaceProjections'
import ActivityFeed from '@/components/social/ActivityFeed'
import UserSearch from '@/components/social/UserSearch'
import FollowRequests from '@/components/social/FollowRequests'
import PrivacyToggle from '@/components/social/PrivacyToggle'
import Link from 'next/link'
import Image from 'next/image'
import { Settings, CalendarDays } from 'lucide-react'

export const metadata = { title: 'Friends | Race Day' }

export default async function SocialPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('date_of_birth, profile_public, display_name, avatar_url')
    .eq('id', user.id)
    .single()

  const [feedItems, percentiles, pendingRequests, raceProjections, following] = await Promise.all([
    getSocialFeed(25),
    getMyFitnessPercentiles(),
    getPendingFollowRequests(),
    getFriendsRaceProjections(),
    getFollowingList(),
  ])

  const missingDob = !profile?.date_of_birth

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Friends</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Your fitness profile and training community
          </p>
        </div>
        <PrivacyToggle isPublic={profile?.profile_public ?? true} />
      </div>

      {/* Pending follow requests */}
      {pendingRequests.length > 0 && (
        <FollowRequests requests={pendingRequests} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fitness Fingerprint */}
        {missingDob ? (
          <div className="card-squircle p-4 sm:p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-accent shrink-0" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Fitness Fingerprint
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add your date of birth to see your age-group percentile ranking across swim, bike, and run.
            </p>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              Set your birthday <Settings size={13} />
            </Link>
          </div>
        ) : percentiles ? (
          <FitnessFingerprint percentiles={percentiles} />
        ) : (
          <div className="card-squircle p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Fitness Fingerprint
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Log workouts across swim, bike, and run to generate your age-group percentile radar chart.
            </p>
          </div>
        )}

        {/* Race Projections */}
        <FriendsRaceProjections
          races={raceProjections}
          myDisplayName={profile?.display_name ?? 'You'}
          myAvatarUrl={profile?.avatar_url ?? null}
        />
      </div>

      {/* Find Athletes */}
      <UserSearch />

      {/* Following list */}
      {following.length > 0 && (
        <div className="card-squircle p-4 sm:p-6 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Following <span className="ml-1 text-xs font-normal text-gray-400 dark:text-gray-500">{following.length}</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {following.map((friend) => (
              <Link
                key={friend.user_id}
                href={`/dashboard/social/${friend.user_id}`}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/60 dark:hover:bg-gray-700/40 transition-colors min-w-0"
              >
                {friend.avatar_url ? (
                  <Image
                    src={friend.avatar_url}
                    alt={friend.display_name}
                    width={32}
                    height={32}
                    className="rounded-full object-cover flex-shrink-0"
                    unoptimized
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {friend.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{friend.display_name}</p>
                  {friend.username && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">@{friend.username}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <ActivityFeed items={feedItems} />
    </main>
  )
}
