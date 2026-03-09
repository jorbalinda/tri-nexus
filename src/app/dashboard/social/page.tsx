import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSocialFeed, getMyFitnessPercentiles, getPendingFollowRequests, getFriendsRaceProjections } from '@/app/actions/social'
import FitnessFingerprint from '@/components/social/FitnessFingerprint'
import FriendsRaceProjections from '@/components/social/FriendsRaceProjections'
import ActivityFeed from '@/components/social/ActivityFeed'
import UserSearch from '@/components/social/UserSearch'
import FollowRequests from '@/components/social/FollowRequests'
import PrivacyToggle from '@/components/social/PrivacyToggle'
import Link from 'next/link'
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

  const [feedItems, percentiles, pendingRequests, raceProjections] = await Promise.all([
    getSocialFeed(25),
    getMyFitnessPercentiles(),
    getPendingFollowRequests(),
    getFriendsRaceProjections(),
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

      {/* Activity Feed */}
      <ActivityFeed items={feedItems} />
    </main>
  )
}
