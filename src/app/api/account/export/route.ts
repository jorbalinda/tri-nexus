import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { data: profile },
    { data: races },
    { data: workouts },
    { data: plans },
    { data: projections },
    { data: connections },
    { data: consent },
  ] = await Promise.all([
    admin.from('profiles').select('*').eq('id', user.id).single(),
    admin.from('target_races').select('*').eq('user_id', user.id),
    admin.from('workouts').select('*').eq('user_id', user.id),
    admin.from('race_plans').select('*').eq('user_id', user.id),
    admin.from('projections').select('*').eq('user_id', user.id),
    admin.from('device_connections')
      .select('id, provider, sync_status, last_sync_at, created_at')
      .eq('user_id', user.id),
    admin.from('consent_records')
      .select('policy_version, consent_type, agreed_at, ip_address')
      .eq('user_id', user.id),
  ])

  const exportData = {
    exported_at: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    profile: profile ?? null,
    races: races ?? [],
    workouts: workouts ?? [],
    race_plans: plans ?? [],
    projections: projections ?? [],
    device_connections: connections ?? [],
    consent_records: consent ?? [],
  }

  const filename = `triraceday-export-${new Date().toISOString().split('T')[0]}.json`

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
