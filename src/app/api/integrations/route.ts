import { NextResponse } from 'next/server'
import { authenticateRequest, handleApiError } from '@/lib/api/utils'

export async function GET() {
  try {
    const { user, supabase, error: authError } = await authenticateRequest()
    if (authError) return authError

    const { data, error } = await supabase
      .from('device_connections')
      .select('id, provider, sync_status, last_sync_at, external_user_id, created_at')
      .eq('user_id', user!.id)

    if (error) return handleApiError(error)

    return NextResponse.json(data || [])
  } catch (err) {
    return handleApiError(err)
  }
}
