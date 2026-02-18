import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started | TRI-NEXUS',
  description: 'Set up your triathlon training profile to get personalized insights.',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
