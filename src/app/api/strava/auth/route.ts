import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/api/utils'

export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await authenticateRequest()
    if (authError) return authError

    const clientId = process.env.STRAVA_CLIENT_ID
    if (!clientId) {
      console.error('STRAVA_CLIENT_ID is not configured')
      return NextResponse.redirect(new URL('/dashboard?error=strava_not_configured', request.url))
    }

    const baseUrl = process.env.APP_URL || request.nextUrl.origin
    const redirectUri = `${baseUrl}/api/strava/callback`

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'activity:read_all',
    })

    return NextResponse.redirect(`https://www.strava.com/oauth/authorize?${params}`)
  } catch (error) {
    console.error('Strava auth error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=strava_auth_failed', request.url))
  }
}
