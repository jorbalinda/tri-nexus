import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Qualification Checker | TRI-NEXUS',
  description:
    'Check if your triathlon finish time qualifies for IRONMAN Kona, IRONMAN 70.3 Worlds, or World Triathlon Age-Group Championships. Free instant results with split targets.',
  keywords: [
    'triathlon qualification',
    'IRONMAN Kona qualifying time',
    'IRONMAN 70.3 World Championship qualification',
    'World Triathlon age group qualifier',
    'triathlon qualifying standards',
    'Kona cutoff time',
    'age group triathlon qualification checker',
  ],
  openGraph: {
    title: 'Can You Qualify? | TRI-NEXUS Qualification Checker',
    description:
      'Enter your finish time and instantly see if you qualify for the world\'s biggest triathlon championships.',
    type: 'website',
  },
}

export default function QualifyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
