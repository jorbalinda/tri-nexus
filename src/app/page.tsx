'use client'

import Link from 'next/link'
import { Flag, Waves, Bike, Footprints, ArrowRight, Timer, TrendingUp, Target } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[3px] text-blue-500">RACE DAY</p>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-10" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-blue-500">
                <Waves size={16} />
                <span className="text-[11px] font-bold uppercase tracking-[2px]">Swim</span>
              </div>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-1.5 text-orange-500">
                <Bike size={16} />
                <span className="text-[11px] font-bold uppercase tracking-[2px]">Bike</span>
              </div>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-1.5 text-green-500">
                <Footprints size={16} />
                <span className="text-[11px] font-bold uppercase tracking-[2px]">Run</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
              Know Your Finish Time<br />
              <span className="text-blue-600">Before the Race Starts.</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Connect your devices, train, and watch your projected finish time sharpen. Race week: your full race day plan is revealed.
            </p>

            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              Start Your Projection
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* How It Works */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="card-squircle p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp size={24} className="text-blue-500" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">Step 1</p>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Train & Upload</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upload data and train. Every workout sharpens your projection.</p>
              </div>
              <div className="card-squircle p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mx-auto mb-4">
                  <Timer size={24} className="text-orange-500" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">Step 2</p>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Race Week Reveal</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">One week out, your projected finish time is revealed with a full race plan.</p>
              </div>
              <div className="card-squircle p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-4">
                  <Target size={24} className="text-green-500" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">Step 3</p>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Race & Compare</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">See how your finish stacks up against friends&apos; projected times — before and after race day.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[3px] text-blue-500 mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Everything You Need for Race Day
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Flag,
                title: 'Finish Time Projection',
                desc: 'Our engine analyzes your swim, bike, and run data to project your finish time across three scenarios: optimistic, realistic, and conservative.',
                color: 'text-blue-500',
                bg: 'bg-blue-50 dark:bg-blue-950/30',
              },
              {
                icon: TrendingUp,
                title: 'Fitness Tracking',
                desc: 'TSS, CTL, ATL, TSB, weekly volume, and per-discipline trends. All calculated from your synced workouts. Watch your fitness build.',
                color: 'text-green-500',
                bg: 'bg-green-50 dark:bg-green-950/30',
              },
              {
                icon: Timer,
                title: 'Race Day Plan',
                desc: 'Pacing splits, equipment checklist, and mindset plan. Auto-generated and weather-adjusted for your race.',
                color: 'text-orange-500',
                bg: 'bg-orange-50 dark:bg-orange-950/30',
              },
              {
                icon: Waves,
                title: 'Device Sync*',
                desc: 'Garmin, Wahoo, Apple Watch, COROS, Suunto, Polar, Hammerhead, Zwift, TrainerRoad, Peloton. Connect your devices for automatic workout sync. *Coming Soon.',
                color: 'text-purple-500',
                bg: 'bg-purple-50 dark:bg-purple-950/30',
              },
              {
                icon: Target,
                title: 'Course Database',
                desc: '100+ real triathlon courses with elevation, weather, and course profiles. Select your race or upload custom GPX.',
                color: 'text-red-500',
                bg: 'bg-red-50 dark:bg-red-950/30',
              },
              {
                icon: Bike,
                title: 'Predicted vs. Actual',
                desc: 'After the race, enter your actual splits and see how close the projection was. Close the loop and improve.',
                color: 'text-amber-500',
                bg: 'bg-amber-50 dark:bg-amber-950/30',
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="card-squircle p-6">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[3px] text-blue-500 mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Simple, Transparent Pricing
            </h2>
          </div>

          <div className="max-w-md mx-auto">
            <div className="card-squircle p-8 ring-2 ring-blue-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider">
                Free for the first 500 users
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[2px] text-blue-500 mb-2">Early Access</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">$0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Everything you need for race day</p>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-8">
                <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Unlimited races</li>
                <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Garmin sync (Coming Soon)</li>
                <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Dashboard & fitness trends</li>
                <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Projection progress indicator</li>
                <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Race week finish time reveal</li>
                <li className="flex items-center gap-2"><span className="text-green-500">&#10003;</span> Full race day plan + PDF export</li>
              </ul>
              <Link
                href="/auth/signup"
                className="block text-center py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Ready to Know Your Finish Time?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Add your target race, connect your device, and start watching your projection sharpen with every workout.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            Get Started Free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-[3px] text-gray-400 dark:text-gray-500">RACE DAY</p>
          <div className="flex items-center gap-6 text-sm text-gray-400 dark:text-gray-500">
            <Link href="/auth/login" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>

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
      `}</style>
    </div>
  )
}
