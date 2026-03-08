'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Waves, Bike, Footprints } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError(null)
      setInfo('Enter your email address above, then click Forgot Password.')
      return
    }
    setResetLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })
    setResetLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
  }

  const handleOAuth = async (provider: 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Mobile brand strip — hidden on desktop */}
      <div className="lg:hidden relative h-28 overflow-hidden flex items-center justify-center flex-shrink-0">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 pointer-events-none">
          <Waves className="absolute top-[20%] left-[8%] text-[#219ebc]/30" size={44} strokeWidth={1} />
          <Bike className="absolute bottom-[15%] right-[8%] text-[#fb8500]/30" size={50} strokeWidth={1} />
          <Footprints className="absolute top-[25%] right-[22%] text-[#4cc9a0]/30" size={38} strokeWidth={1} />
        </div>
        <div className="relative z-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[5px] text-white/70">RACE DAY</p>
          <p className="text-white text-xl font-bold mt-1 leading-tight">Know Your Finish Time.</p>
        </div>
      </div>

      {/* Desktop hero panel — hidden on mobile */}
      <div className="hidden lg:flex relative lg:w-1/2 min-h-screen overflow-hidden items-center justify-center">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 pointer-events-none">
          <Waves className="absolute top-[15%] left-[12%] text-[#219ebc]/30" size={80} strokeWidth={1} />
          <Bike className="absolute top-[45%] right-[10%] text-[#fb8500]/30" size={90} strokeWidth={1} />
          <Footprints className="absolute bottom-[18%] left-[20%] text-[#4cc9a0]/30" size={70} strokeWidth={1} />
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

      {/* Form panel */}
      <div className="flex-1 lg:w-1/2 flex items-start lg:items-center justify-center px-6 py-8 lg:py-0 bg-background">
        <div className="w-full max-w-sm">

          <div className="mb-6 lg:mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Welcome back</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}
          {info && (
            <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-xl px-4 py-3 mb-4">
              {info}
            </div>
          )}
          {resetSent && (
            <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded-xl px-4 py-3 mb-4">
              Password reset email sent — check your inbox.
            </div>
          )}

          <button
            type="button"
            onClick={() => handleOAuth('google')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mb-4">or</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-xs text-[#57a2ea] hover:text-[#7ab8f0] transition-colors disabled:opacity-50 py-1"
                >
                  {resetLoading ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm bg-gray-50/50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                placeholder="Your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-[#57a2ea] font-medium hover:underline py-2 inline-block">
                Sign up
              </Link>
            </p>
          </form>

          {/* Back to home — subtle, at the bottom */}
          <p className="text-center mt-6">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(135deg, #05123e, #0a5c8a, #1170a3, #219ebc, #2a9d8f, #4cc9a0);
          background-size: 300% 300%;
          animation: gradientShift 12s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        :global(.dark) .hero-gradient {
          background: linear-gradient(135deg, #010f1e, #023047, #0a5c8a, #1170a3, #219ebc, #2a9d8f);
          background-size: 300% 300%;
          animation: gradientShift 12s ease infinite;
        }
      `}</style>
    </div>
  )
}
