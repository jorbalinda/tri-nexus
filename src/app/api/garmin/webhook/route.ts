import { NextRequest, NextResponse } from 'next/server'
import { validateWebhookSignature } from '@/lib/garmin/client'
import { syncGarminActivities, syncGarminSleep } from '@/lib/garmin/sync'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-garmin-signature') || ''

    // Validate webhook signature
    if (process.env.GARMIN_WEBHOOK_SECRET && !validateWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Handle activity notifications
    if (payload.activities) {
      for (const activity of payload.activities) {
        // Look up user by Garmin external user ID
        const { data: connection } = await supabase
          .from('device_connections')
          .select('user_id')
          .eq('provider', 'garmin')
          .eq('external_user_id', activity.userId?.toString())
          .single()

        if (connection) {
          await syncGarminActivities(connection.user_id, [activity])
        }
      }
    }

    // Handle sleep notifications
    if (payload.dailies) {
      for (const daily of payload.dailies) {
        const { data: connection } = await supabase
          .from('device_connections')
          .select('user_id')
          .eq('provider', 'garmin')
          .eq('external_user_id', daily.userId?.toString())
          .single()

        if (connection && daily.sleepDurationInSeconds) {
          await syncGarminSleep(connection.user_id, {
            calendarDate: daily.calendarDate,
            sleepTimeInSeconds: daily.sleepDurationInSeconds,
          })
        }
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Garmin webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Garmin sends a GET to verify the webhook endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
