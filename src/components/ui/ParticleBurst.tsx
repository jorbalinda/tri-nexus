'use client'

import { useEffect } from 'react'

const PARTICLES = ['🏊', '🚴', '🏃', '⚡', '🏅', '✨', '🔥', '💥', '🏊', '🚴', '🏃', '⚡']

interface ParticleBurstProps {
  active: boolean
  onComplete: () => void
  children: React.ReactNode
  className?: string
}

export default function ParticleBurst({ active, onComplete, children, className }: ParticleBurstProps) {
  useEffect(() => {
    if (active) {
      const t = setTimeout(onComplete, 900)
      return () => clearTimeout(t)
    }
  }, [active, onComplete])

  return (
    <div className={`relative${className ? ` ${className}` : ''}`}>
      {active && PARTICLES.map((emoji, i) => {
        const angle = (i / PARTICLES.length) * 360
        const rad = (angle * Math.PI) / 180
        const dist = 60 + Math.random() * 35
        const tx = Math.cos(rad) * dist
        const ty = Math.sin(rad) * dist
        return (
          <span
            key={i}
            className="pointer-events-none absolute left-1/2 top-1/2 text-lg leading-none z-10"
            style={{
              transform: 'translate(-50%, -50%)',
              animation: 'particle-fly 0.65s ease-out forwards',
              ['--tx' as string]: `${tx}px`,
              ['--ty' as string]: `${ty}px`,
              animationDelay: `${i * 18}ms`,
            }}
          >
            {emoji}
          </span>
        )
      })}
      {children}
      <style>{`
        @keyframes particle-fly {
          0%   { transform: translate(-50%, -50%) scale(0.3); opacity: 1; }
          60%  { opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
