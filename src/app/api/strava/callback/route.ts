import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken } from '@/lib/strava/client'
import { backfillStravaActivities } from '@/lib/strava/backfill'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')
    const error = request.nextUrl.searchParams.get('error')

    if (error || !code) {
      return NextResponse.redirect(new URL('/dashboard?error=strava_denied', request.url))
    }

    const tokenData = await exchangeCodeForToken(code)

    // Get current user via Supabase SSR
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Store connection using service role client
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await adminSupabase.from('device_connections').upsert({
      user_id: user.id,
      provider: 'strava',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
      external_user_id: tokenData.athlete.id.toString(),
      sync_status: 'active',
      last_sync_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider' })

    // Trigger backfill in background (don't await)
    backfillStravaActivities(user.id, tokenData.access_token).catch((err) =>
      console.error('Strava backfill error:', err)
    )

    return NextResponse.redirect(new URL('/dashboard?strava=connected', request.url))
  } catch (error) {
    console.error('Strava callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=strava_callback_failed', request.url))
  }
}
