'use client'

import Link from 'next/link'
import { Flag, Calculator, Trophy, Waves, Bike, Footprints, ArrowRight, Zap, Brain, FlaskConical, ChevronRight } from 'lucide-react'

const DEMO_PLAN = {
  race: 'IRONMAN 70.3 Oceanside',
  distance: '70.3',
  date: 'April 5, 2026',
  pacing: {
    swim: { pace: '1:48/100m', split: '34:12', strategy: 'Sight every 6 strokes, draft where possible' },
    bike: { power: '195-210W', split: '2:32:00', speed: '35.5 km/h', strategy: 'Negative split, save for the run' },
    run: { pace: '5:15/km', split: '1:50:45', strategy: 'Start conservative, build after km 10' },
  },
  finishTimes: { optimistic: '4:48', realistic: '5:02', conservative: '5:18' },
  nutrition: {
    bikeCarbs: '70-80g/hr',
    bikeHydration: '750ml/hr',
    runCarbs: '50-60g/hr',
    totalCalories: '2,400 kcal',
  },
  qualification: {
    target: 'IRONMAN 70.3 World Championship',
    cutoff: '4:50:00',
    gap: '+12 min',
    status: 'Close — focus on bike power',
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[3px] text-blue-500">TRI-NEXUS</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/qualify"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors hidden sm:block"
            >
              Qualification Checker
            </Link>
            <Link
              href="/pace-calculator"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors hidden sm:block"
            >
              Pace Calculator
            </Link>
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
                <span className="text-[10px] font-bold uppercase tracking-[2px]">Swim</span>
              </div>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-1.5 text-orange-500">
                <Bike size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[2px]">Bike</span>
              </div>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-1.5 text-green-500">
                <Footprints size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[2px]">Run</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
              Your Race Day.<br />
              <span className="text-blue-600">Planned to Perfection.</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Tri-Nexus generates complete race plans — pacing, nutrition, equipment, and mindset — from your actual training data. Built for triathletes who want to execute, not just finish.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="px-8 py-3.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                Generate Your Race Plan — Free
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/qualify"
                className="px-8 py-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Check If You Can Qualify
              </Link>
            </div>
          </div>

          {/* Demo Race Plan Card */}
          <div className="max-w-4xl mx-auto">
            <div className="card-squircle p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl">
                Sample Plan
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1">Race Day Plan</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{DEMO_PLAN.race}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{DEMO_PLAN.date}</p>
              </div>

              {/* Finish Time Scenarios */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Optimistic', time: DEMO_PLAN.finishTimes.optimistic, color: 'text-green-600' },
                  { label: 'Realistic', time: DEMO_PLAN.finishTimes.realistic, color: 'text-blue-600' },
                  { label: 'Conservative', time: DEMO_PLAN.finishTimes.conservative, color: 'text-orange-600' },
                ].map(({ label, time, color }) => (
                  <div key={label} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">{label}</p>
                    <p className={`text-xl font-bold ${color}`}>{time}</p>
                  </div>
                ))}
              </div>

              {/* Pacing Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Waves size={14} className="text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Swim</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{DEMO_PLAN.pacing.swim.pace}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Split: {DEMO_PLAN.pacing.swim.split}</p>
                </div>
                <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Bike size={14} className="text-orange-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">Bike</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{DEMO_PLAN.pacing.bike.power}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Split: {DEMO_PLAN.pacing.bike.split}</p>
                </div>
                <div className="p-4 rounded-2xl bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Footprints size={14} className="text-green-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-500">Run</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{DEMO_PLAN.pacing.run.pace}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Split: {DEMO_PLAN.pacing.run.split}</p>
                </div>
              </div>

              {/* Nutrition + Qualification Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-2">Nutrition Plan</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Bike carbs</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{DEMO_PLAN.nutrition.bikeCarbs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Hydration</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{DEMO_PLAN.nutrition.bikeHydration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Total race fuel</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{DEMO_PLAN.nutrition.totalCalories}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                  <p className="text-[10px] font-bold uppercase tracking-[2px] text-amber-600 dark:text-amber-400 mb-2">Qualification Check</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{DEMO_PLAN.qualification.target}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{DEMO_PLAN.qualification.gap}</span>
                    <span className="text-gray-500 dark:text-gray-400">{DEMO_PLAN.qualification.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-bold uppercase tracking-[3px] text-blue-500 mb-3">What Sets Us Apart</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Features No Other Platform Has
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Flag,
                title: 'Race Day Intelligence',
                desc: 'Complete race plans with pacing, nutrition, equipment checklists, and mindset strategies — auto-generated from your training data.',
                color: 'text-blue-500',
                bg: 'bg-blue-50 dark:bg-blue-950/30',
              },
              {
                icon: Trophy,
                title: 'Qualification Gap Analysis',
                desc: 'Know exactly where you stand for Kona, 70.3 Worlds, and WT AG Worlds qualification with reverse-engineered split targets.',
                color: 'text-amber-500',
                bg: 'bg-amber-50 dark:bg-amber-950/30',
              },
              {
                icon: FlaskConical,
                title: 'Lab Result Tracking',
                desc: 'Track blood work, VO2max, lactate testing, and genetic data with triathlon-specific context no other training app provides.',
                color: 'text-purple-500',
                bg: 'bg-purple-50 dark:bg-purple-950/30',
              },
              {
                icon: Zap,
                title: 'Advanced Analytics',
                desc: 'TSS, CTL, ATL, efficiency factor, aerobic decoupling, CNS fatigue detection, and metabolic floor analysis across all three sports.',
                color: 'text-green-500',
                bg: 'bg-green-50 dark:bg-green-950/30',
              },
              {
                icon: Brain,
                title: 'Race Readiness Score',
                desc: 'A single 0-100 score combining training load, HRV, sleep, life stress, and CNS status — so you know if you\'re ready to race.',
                color: 'text-red-500',
                bg: 'bg-red-50 dark:bg-red-950/30',
              },
              {
                icon: Calculator,
                title: 'Workout Library',
                desc: 'Hundreds of structured swim, bike, and run workouts across 12 training categories. Log directly from the library with one click.',
                color: 'text-orange-500',
                bg: 'bg-orange-50 dark:bg-orange-950/30',
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

      {/* Free Tools Section */}
      <section className="py-20 px-6 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-[3px] text-blue-500 mb-3">Free Tools</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Try Before You Sign Up
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto">
            No account required. Use these tools right now to see what Tri-Nexus can do for your racing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link href="/qualify" className="card-squircle p-8 text-left group hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <Trophy size={24} className="text-amber-500" />
                <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 transition-colors">
                Qualification Checker
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Can you qualify for Kona, 70.3 Worlds, or WT AG Worlds? Enter your time and find out instantly.
              </p>
            </Link>

            <Link href="/pace-calculator" className="card-squircle p-8 text-left group hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <Calculator size={24} className="text-blue-500" />
                <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 transition-colors">
                Pace Calculator
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Calculate swim, bike, and run split targets for any triathlon distance from Sprint to full Ironman.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Ready to Race Smarter?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Upload your workouts, generate your race plan, and know exactly how to execute on race day. Free to start.
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
          <p className="text-xs font-bold uppercase tracking-[3px] text-gray-400 dark:text-gray-500">TRI-NEXUS</p>
          <div className="flex items-center gap-6 text-sm text-gray-400 dark:text-gray-500">
            <Link href="/qualify" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Qualify</Link>
            <Link href="/pace-calculator" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Pace Calculator</Link>
            <Link href="/auth/login" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Sign In</Link>
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
