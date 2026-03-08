'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Waves, Bike, Footprints, ArrowLeft, Check, X, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Live username availability check (debounced 500ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!username) {
      setUsernameStatus('idle')
      return
    }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setUsernameStatus('invalid')
      return
    }

    setUsernameStatus('checking')
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase.rpc('is_username_available', { p_username: username })
      setUsernameStatus(data === true ? 'available' : 'taken')
    }, 500)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [username])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setError('Please accept the Privacy Policy to continue.')
      return
    }
    if (usernameStatus !== 'available') {
      setError('Please choose a valid, available username.')
      return
    }
    setLoading(true)
    setError(null)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, username } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Set username on the profile row (user is signed in after signUp)
    await supabase.from('profiles').update({ username, display_name: displayName }).eq('id', (await supabase.auth.getUser()).data.user!.id)

    fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, displayName }),
    }).catch(() => {})

    router.push('/onboarding')
    router.refresh()
  }

  const handleOAuth = async (provider: 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all'
  const labelClass = 'block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5'

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Hero Panel */}
      <div className="relative lg:w-1/2 min-h-[280px] lg:min-h-screen overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 pointer-events-none">
          <Waves className="absolute top-[15%] left-[12%] text-white/10" size={80} strokeWidth={1} />
          <Bike className="absolute top-[45%] right-[10%] text-white/10" size={90} strokeWidth={1} />
          <Footprints className="absolute bottom-[18%] left-[20%] text-white/10" size={70} strokeWidth={1} />
        </div>
        <div className="relative z-10 text-center px-8">
          <p className="text-xs font-bold uppercase tracking-[5px] text-white/80 mb-4">RACE DAY</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Know Your<br />Finish Time.
          </h1>
          <p className="text-white/60 text-sm max-w-xs mx-auto leading-relaxed">
            Train, project, race, compare. The platform that tells you your finish time before you cross the start line.
          </p>
        </div>
      </div>

      {/* Form Panel */}
      <div className="lg:w-1/2 flex items-center justify-center px-6 py-12 lg:py-0 bg-background">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-8 py-2"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>

          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Create account</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start your race day projection</p>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <form onSubmit={handleSignup} className="card-squircle p-8 flex flex-col gap-4">
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="signup-name" className={labelClass}>
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={inputClass}
                placeholder="Your name"
                maxLength={50}
                required
              />
            </div>

            <div>
              <label htmlFor="signup-username" className={labelClass}>
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500 pointer-events-none">@</span>
                <input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                  const raw = e.target.value.toLowerCase()
                  const cleaned = raw.replace(/[^a-z0-9_]/g, '')
                  setUsername(cleaned)
                  if (raw !== cleaned && cleaned.length > 0) setUsernameStatus('invalid')
                }}
                  className={`${inputClass} pl-8 pr-10`}
                  placeholder="yourhandle"
                  maxLength={20}
                  required
                />
                {/* Status icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking' && <Loader2 size={15} className="animate-spin text-gray-400" />}
                  {usernameStatus === 'available' && <Check size={15} className="text-green-500" />}
                  {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <X size={15} className="text-red-500" />}
                </div>
              </div>
              {usernameStatus === 'invalid' && (
                <p className="text-xs text-red-500 mt-1">3–20 chars, lowercase letters, numbers, and underscores only</p>
              )}
              {usernameStatus === 'taken' && (
                <p className="text-xs text-red-500 mt-1">That username is already taken</p>
              )}
              {usernameStatus === 'available' && (
                <p className="text-xs text-green-500 mt-1">@{username} is available</p>
              )}
            </div>

            <div>
              <label htmlFor="signup-email" className={labelClass}>
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
                maxLength={254}
                required
              />
            </div>

            <div>
              <label htmlFor="signup-password" className={labelClass}>
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Min 6 characters"
                minLength={6}
                maxLength={128}
                required
              />
            </div>

            {/* Privacy policy consent */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => { setAgreed(e.target.checked); if (e.target.checked) setError(null) }}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 shrink-0 cursor-pointer"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                I agree to the{' '}
                <Link href="/privacy" className="text-blue-500 hover:underline">
                  Privacy Policy
                </Link>
                . Tri Race Day collects your training data to generate race projections.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || usernameStatus !== 'available'}
              className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 font-medium hover:underline py-2 inline-block">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(135deg, #0a2463, #1e3a8a, #7c3aed, #c026d3, #ea580c);
          background-size: 300% 300%;
          animation: gradientShift 12s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        :global(.dark) .hero-gradient {
          background: linear-gradient(135deg, #020617, #0f172a, #2e1065, #4a044e, #431407);
          background-size: 300% 300%;
          animation: gradientShift 12s ease infinite;
        }
      `}</style>
    </div>
  )
}
