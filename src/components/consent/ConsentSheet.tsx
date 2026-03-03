'use client'

import { useRef, useState } from 'react'
import { Shield, X, ChevronDown } from 'lucide-react'
import { POLICY_VERSION } from '@/lib/consent/policy'

interface ConsentSheetProps {
  onAccept: () => void
  onClose: () => void
}

export default function ConsentSheet({ onAccept, onClose }: ConsentSheetProps) {
  const [hasScrolled, setHasScrolled] = useState(false)
  const [agreeing, setAgreeing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el || hasScrolled) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
      setHasScrolled(true)
    }
  }

  const handleAgree = async () => {
    setAgreeing(true)
    const res = await fetch('/api/consent', { method: 'POST' })
    if (res.ok) {
      onAccept()
    } else {
      setAgreeing(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg flex flex-col shadow-2xl"
          style={{ maxHeight: '88dvh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
            {/* Drag handle (mobile) */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full sm:hidden" />
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-blue-500 shrink-0" />
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Privacy Policy & Terms</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          <p className="text-[10px] text-gray-400 dark:text-gray-500 px-5 pb-2 shrink-0">
            Version {POLICY_VERSION} · Scroll to bottom to enable "I Agree"
          </p>

          <div className="mx-5 h-px bg-gray-100 dark:bg-gray-800 shrink-0" />

          {/* Scrollable policy body */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-5 py-4 text-sm text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed"
          >
            <p className="text-xs italic text-gray-500 dark:text-gray-400">
              By tapping "I Agree," you confirm that you have read and agree to the triraceday.com Privacy Policy.
              This policy explains how we collect, use, and protect your personal and health data —
              including data synced from your Garmin device.
            </p>

            <Section title="Who We Are">
              <p>triraceday.com is a triathlon racing platform based in Utah, United States. Questions? Email us at <span className="text-blue-600 dark:text-blue-400">privacy@triraceday.com</span>.</p>
            </Section>

            <Section title="Data We Collect">
              <p>When you create an account, we collect your name, email address, and encrypted password.</p>
              <p className="mt-2">If you connect your Garmin account, we receive — with your explicit permission — the following data from Garmin Connect:</p>
              <ul className="mt-2 space-y-1 list-none">
                {[
                  'Activity data (swim, bike, run — distance, pace, duration, GPS routes)',
                  'Heart rate, resting heart rate, and heart rate variability (HRV)',
                  'Sleep data (duration, stages, quality scores)',
                  'Stress levels and Body Battery readings',
                  'Blood oxygen (SpO2) readings',
                  'Calorie estimates',
                  'VO2 max and training load',
                  'Recovery time estimates',
                  'Women\'s health data (only if enabled in your Garmin account)',
                  'Courses, routes, and training plans',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2">We also collect basic technical data: your IP address, browser type, device type, and usage logs.</p>
              <p className="mt-2 font-medium">We do NOT collect your Garmin password. We use Garmin's OAuth 2.0 system — your credentials never touch our servers.</p>
            </Section>

            <Section title="How We Use Your Data">
              <ul className="space-y-1">
                {[
                  'Power your triraceday.com dashboard and race-day tools',
                  'Personalize your training insights and performance tracking',
                  'Send you account and service notifications',
                  'Detect and prevent fraud and unauthorized access',
                  'Comply with Utah and US federal law',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-medium">We do not use your health data for advertising. We do not build advertising profiles. We do not sell your data.</p>
            </Section>

            <Section title="Garmin Connect — Important Notice">
              <p>Any data you share through triraceday.com is shared with triraceday.com — not with Garmin. Garmin is not responsible for our data practices.</p>
              <p className="mt-2">We encourage you to review Garmin's Privacy Policy at garmin.com/privacy/connect.</p>
              <p className="mt-2">You can disconnect your Garmin account at any time in your account settings and request deletion of all previously synced data.</p>
            </Section>

            <Section title="Who We Share Your Data With">
              <ul className="space-y-1">
                {[
                  'Service providers (cloud hosting, storage, support) who are contractually required to keep it confidential',
                  'Law enforcement or courts, when legally required',
                  'A successor company if triraceday.com is acquired — you will be notified in advance',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-medium">We never sell your personal data.</p>
            </Section>

            <Section title="How Long We Keep Your Data">
              <ul className="space-y-1">
                {[
                  'Account and profile data: while your account is active, plus 90 days after deletion',
                  'Garmin health and activity data: up to 24 months from sync date, unless you request earlier deletion',
                  'Legal records: as required by applicable law',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Your Rights (UCPA)">
              <ul className="space-y-1">
                {[
                  'Access a copy of your data in a portable format',
                  'Request deletion of your account and health data',
                  'Opt out of sensitive health data processing at any time',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2">Email <span className="text-blue-600 dark:text-blue-400">privacy@triraceday.com</span> or visit triraceday.com/account/privacy. We respond within 45 days.</p>
              <p className="mt-2">Unresolved complaints: Utah Division of Consumer Protection at dcp.utah.gov or (801) 530-6601.</p>
            </Section>

            <Section title="Children's Privacy">
              <p>triraceday.com is not intended for children under 13. Users aged 13–17 require parent or guardian consent before health data is processed.</p>
            </Section>

            <Section title="Data Security">
              <ul className="space-y-1">
                {[
                  'TLS 1.2+ encryption for all data in transit',
                  'AES-256 encryption for health data stored at rest',
                  'Role-based access controls limiting data access to authorized staff',
                  'Regular security audits and vulnerability testing',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Policy Updates">
              <p>When we make significant changes to this policy, we will email you at least 30 days before they take effect and post a notice on triraceday.com.</p>
            </Section>

            <Section title="Governing Law">
              <p>This policy is governed by the laws of the State of Utah, United States, and is written to comply with the Utah Consumer Privacy Act (UCPA), COPPA, the FTC Act, and the Garmin Connect Developer Program Agreement.</p>
            </Section>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                By tapping "I Agree" below, you confirm you are 18 years of age or older (or have parental consent if 13–17),
                you have read this Privacy Policy, and you agree to its terms.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
            {!hasScrolled && (
              <div className="flex items-center justify-center gap-1.5 mb-3 text-[11px] text-gray-400 dark:text-gray-500">
                <ChevronDown size={12} className="animate-bounce" />
                Scroll to bottom to continue
              </div>
            )}
            <button
              onClick={handleAgree}
              disabled={!hasScrolled || agreeing}
              className="w-full py-3.5 rounded-xl bg-blue-600 text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-[0.98]"
            >
              {agreeing ? 'Saving...' : 'I Agree'}
            </button>
            <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2">
              Your agreement is recorded with a timestamp and your IP address.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[2px] text-gray-400 dark:text-gray-500 mb-1.5">{title}</p>
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">{children}</div>
    </div>
  )
}
