import { NextRequest, NextResponse } from 'next/server'
import { getRequestToken, getAuthorizeUrl } from '@/lib/garmin/client'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin
    const callbackUrl = `${origin}/api/garmin/callback`

    const { oauth_token, oauth_token_secret } = await getRequestToken(callbackUrl)

    // Store request token secret in a cookie for the callback
    const cookieStore = await cookies()
    cookieStore.set('garmin_token_secret', oauth_token_secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    const authorizeUrl = getAuthorizeUrl(oauth_token)
    return NextResponse.redirect(authorizeUrl)
  } catch (error) {
    console.error('Garmin auth error:', error)
    return NextResponse.redirect(new URL('/dashboard/profile?error=garmin_auth_failed', request.url))
  }
}
