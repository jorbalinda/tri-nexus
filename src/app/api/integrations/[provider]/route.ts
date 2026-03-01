import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, handleApiError } from '@/lib/api/utils'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params
    const { user, supabase, error: authError } = await authenticateRequest()
    if (authError) return authError

    const validProviders = ['garmin', 'strava', 'wahoo', 'coros']
    if (!validProviders.includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    const { error } = await supabase
      .from('device_connections')
      .update({ sync_status: 'disconnected' })
      .eq('user_id', user!.id)
      .eq('provider', provider)

    if (error) return handleApiError(error)

    return NextResponse.json({ message: `${provider} disconnected` })
  } catch (err) {
    return handleApiError(err)
  }
}
