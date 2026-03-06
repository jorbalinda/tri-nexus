import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSocialFeed, getMyFitnessPercentiles, getPendingFollowRequests } from '@/app/actions/social'
import FitnessFingerprint from '@/components/social/FitnessFingerprint'
import ActivityFeed from '@/components/social/ActivityFeed'
import UserSearch from '@/components/social/UserSearch'
import FollowRequests from '@/components/social/FollowRequests'
import PrivacyToggle from '@/components/social/PrivacyToggle'
import Link from 'next/link'
import { Trophy, Settings } from 'lucide-react'

export const metadata = { title: 'Friends | Race Day' }

export default async function SocialPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('date_of_birth, profile_public')
    .eq('id', user.id)
    .single()

  const [feedItems, percentiles, pendingRequests] = await Promise.all([
    getSocialFeed(30),
    getMyFitnessPercentiles(),
    getPendingFollowRequests(),
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
        {percentiles ? (
          <div className="space-y-2">
            <FitnessFingerprint percentiles={percentiles} />
            {missingDob && (
              <p className="text-xs text-gray-400 dark:text-gray-500 px-1">
                * Benchmarked against 35–39 age group.{' '}
                <Link href="/dashboard/profile" className="text-blue-500 hover:underline inline-flex items-center gap-1">
                  Set your birthday <Settings size={11} />
                </Link>{' '}
                for accurate age-group ranking.
              </p>
            )}
          </div>
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

        {/* Race Projections CTA */}
        <Link
          href="/dashboard/social/races"
          className="card-squircle p-4 sm:p-6 flex flex-col gap-3 hover:ring-1 hover:ring-blue-300 dark:hover:ring-blue-700 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Trophy size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Race Projections
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Compare projected finish times with friends
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your upcoming races with projected finish times. Follow friends racing the same events to compare.
          </p>
        </Link>
      </div>

      {/* Find Athletes */}
      <UserSearch />

      {/* Activity Feed */}
      <ActivityFeed items={feedItems} />
    </main>
  )
}
