import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, validateBody, handleApiError } from '@/lib/api/utils'
import { ProfileUpdateSchema } from '@/lib/validation/schemas'

export async function GET() {
  try {
    const { user, supabase, error: authError } = await authenticateRequest()
    if (authError) return authError

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await authenticateRequest()
    if (authError) return authError

    const body = await request.json()
    const { data: validated, error: valError } = validateBody(body, ProfileUpdateSchema)
    if (valError) return valError

    const { data, error } = await supabase
      .from('profiles')
      .update(validated!)
      .eq('id', user!.id)
      .select()
      .single()

    if (error) return handleApiError(error)

    return NextResponse.json(data)
  } catch (err) {
    return handleApiError(err)
  }
}
