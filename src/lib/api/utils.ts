import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { ZodSchema } from 'zod'

export async function authenticateRequest() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, supabase, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { user, supabase, error: null }
}

export function validateBody<T>(body: unknown, schema: ZodSchema<T>): { data: T; error: null } | { data: null; error: NextResponse } {
  const result = schema.safeParse(body)
  if (!result.success) {
    return {
      data: null,
      error: NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      ),
    }
  }
  return { data: result.data, error: null }
}

export function validateQuery<T>(params: Record<string, string | undefined>, schema: ZodSchema<T>): { data: T; error: null } | { data: null; error: NextResponse } {
  const result = schema.safeParse(params)
  if (!result.success) {
    return {
      data: null,
      error: NextResponse.json(
        { error: 'Invalid query parameters', details: result.error.flatten().fieldErrors },
        { status: 400 }
      ),
    }
  }
  return { data: result.data, error: null }
}

export function handleApiError(err: unknown): NextResponse {
  console.error('API error:', err)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
