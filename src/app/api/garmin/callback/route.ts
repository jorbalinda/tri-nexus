import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/garmin/client'
import { backfillGarminActivities } from '@/lib/garmin/backfill'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    const oauthToken = request.nextUrl.searchParams.get('oauth_token')
    const oauthVerifier = request.nextUrl.searchParams.get('oauth_verifier')

    if (!oauthToken || !oauthVerifier) {
      return NextResponse.redirect(new URL('/dashboard/profile?error=missing_params', request.url))
    }

    // Get the stored token secret
    const cookieStore = await cookies()
    const tokenSecret = cookieStore.get('garmin_token_secret')?.value

    if (!tokenSecret) {
      return NextResponse.redirect(new URL('/dashboard/profile?error=expired_session', request.url))
    }

    // Exchange for access token
    const { oauth_token: accessToken, oauth_token_secret: accessSecret } = await getAccessToken(
      oauthToken,
      tokenSecret,
      oauthVerifier
    )

    // Get current user via Supabase SSR
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
      provider: 'garmin',
      access_token: accessToken,
      token_secret: accessSecret,
      sync_status: 'active',
      last_sync_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider' })

    // Trigger backfill in background (don't await)
    backfillGarminActivities(user.id, accessToken, accessSecret).catch((err) =>
      console.error('Garmin backfill error:', err)
    )

    // Clean up cookie
    cookieStore.delete('garmin_token_secret')

    return NextResponse.redirect(new URL('/dashboard/profile?garmin=connected', request.url))
  } catch (error) {
    console.error('Garmin callback error:', error)
    return NextResponse.redirect(new URL('/dashboard/profile?error=garmin_callback_failed', request.url))
  }
}
