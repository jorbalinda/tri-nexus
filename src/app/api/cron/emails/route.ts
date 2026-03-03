import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend, FROM } from '@/lib/email/client'
import { raceWeekEmail, raceDayEmail } from '@/lib/email/templates'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const sevenDaysOut = new Date(today)
  sevenDaysOut.setDate(today.getDate() + 7)
  const sevenDaysStr = sevenDaysOut.toISOString().split('T')[0]

  const oneDayOut = new Date(today)
  oneDayOut.setDate(today.getDate() + 1)
  const oneDayStr = oneDayOut.toISOString().split('T')[0]

  // Fetch races 7 days out and 1 day out, joining with profile for email
  const { data: races, error } = await supabase
    .from('target_races')
    .select('id, race_name, race_date, user_id, profiles(email, display_name)')
    .in('race_date', [sevenDaysStr, oneDayStr])
    .eq('status', 'upcoming')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!races || races.length === 0) {
    return NextResponse.json({ message: 'No race reminders to send', sent: 0 })
  }

  let sent = 0

  for (const race of races) {
    const profile = race.profiles as unknown as { email: string; display_name: string } | null
    if (!profile?.email) continue

    const isRaceWeek = race.race_date === sevenDaysStr
    const isRaceDay = race.race_date === oneDayStr

    let subject: string
    let html: string

    if (isRaceWeek) {
      ;({ subject, html } = raceWeekEmail(
        profile.display_name,
        race.race_name,
        race.race_date,
        race.id
      ))
    } else if (isRaceDay) {
      ;({ subject, html } = raceDayEmail(
        profile.display_name,
        race.race_name,
        race.race_date,
        race.id
      ))
    } else {
      continue
    }

    const { error: sendError } = await resend.emails.send({
      from: FROM,
      to: profile.email,
      subject,
      html,
    })

    if (!sendError) sent++
    else console.error(`Email failed for race ${race.id}:`, sendError)
  }

  return NextResponse.json({ message: `Sent ${sent} race reminder emails`, sent })
}
