import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Triathlon Pace Calculator — TRI-NEXUS',
  description:
    'Calculate swim, bike, and run split targets for any triathlon distance. Free pace calculator for Sprint, Olympic, 70.3, and Ironman races.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
