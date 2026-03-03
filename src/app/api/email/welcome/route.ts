import { NextRequest, NextResponse } from 'next/server'
import { resend, FROM } from '@/lib/email/client'
import { welcomeEmail } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  const { email, displayName } = await request.json()

  if (!email || !displayName) {
    return NextResponse.json({ error: 'Missing email or displayName' }, { status: 400 })
  }

  const { subject, html } = welcomeEmail(displayName)

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject,
    html,
  })

  if (error) {
    console.error('Welcome email failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
