import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-5xl font-bold text-blue-600 mb-4">404</p>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          This page doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-5 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
