import { POLICY_TEXT, POLICY_VERSION } from '@/lib/consent/policy'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | Race Day',
  description: 'Privacy Policy and Terms of Service for triraceday.com',
}

export default function PrivacyPage() {
  // Split into sections on all-caps headings
  const lines = POLICY_TEXT.split('\n')

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[3px] text-blue-500">RACE DAY</span>
          <span className="text-xs text-gray-400">Know Your Finish Line</span>
        </Link>
        <Link
          href="/auth/login"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Sign in →
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Privacy Policy</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Version {POLICY_VERSION} · triraceday.com
          </p>
        </div>

        <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {lines.map((line, i) => {
            // Section headings — all-caps lines
            if (line === line.toUpperCase() && line.trim().length > 3 && !line.startsWith('•') && !line.startsWith('triraceday')) {
              return (
                <h2 key={i} className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-gray-800">
                  {line}
                </h2>
              )
            }
            // Bullet points
            if (line.startsWith('•')) {
              return (
                <div key={i} className="flex gap-3 pl-2">
                  <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                  <span>{line.slice(1).trim()}</span>
                </div>
              )
            }
            // Empty lines
            if (!line.trim()) return null
            // Normal paragraph
            return <p key={i}>{line}</p>
          })}
        </div>

        {/* Contact footer */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Questions about this policy?{' '}
            <a href="mailto:privacy@triraceday.com" className="text-blue-600 hover:underline">
              privacy@triraceday.com
            </a>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            © {new Date().getFullYear()} triraceday.com · All rights reserved
          </p>
        </div>
      </main>
    </div>
  )
}
