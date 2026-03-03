import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'
import { POLICY_TEXT, POLICY_VERSION } from '@/lib/consent/policy'

async function getSupabaseAndUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

// GET — check if the current user has already consented
export async function GET() {
  const { supabase, user } = await getSupabaseAndUser()
  if (!user) return NextResponse.json({ consented: false })

  const { data } = await supabase
    .from('consent_records')
    .select('id, agreed_at, policy_version')
    .eq('user_id', user.id)
    .eq('consent_type', 'privacy_policy')
    .order('agreed_at', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({
    consented: !!data,
    agreed_at: data?.agreed_at ?? null,
    policy_version: data?.policy_version ?? null,
  })
}

// POST — record consent with IP, user agent, and policy hash
export async function POST(request: NextRequest) {
  const { supabase, user } = await getSupabaseAndUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  const userAgent = request.headers.get('user-agent') ?? 'unknown'
  const policyHash = createHash('sha256').update(POLICY_TEXT).digest('hex')

  // Insert using the user's own authenticated session — RLS allows auth.uid() = user_id
  const { error } = await supabase.from('consent_records').insert({
    user_id: user.id,
    policy_version: POLICY_VERSION,
    policy_hash: policyHash,
    consent_type: 'privacy_policy',
    ip_address: ip,
    user_agent: userAgent,
  })

  if (error) {
    console.error('Consent record failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, policy_hash: policyHash, agreed_at: new Date().toISOString() })
}
