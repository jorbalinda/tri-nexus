import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Race Day | Know Your Finish Line'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #05123e 0%, #023047 40%, #0a5c8a 70%, #219ebc 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle top-left swim teal glow */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '-120px',
            width: '480px',
            height: '480px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(33,158,188,0.25) 0%, transparent 70%)',
          }}
        />
        {/* Subtle bottom-right run green glow */}
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(76,201,160,0.2) 0%, transparent 70%)',
          }}
        />

        {/* Sport color bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '5px',
            background: 'linear-gradient(90deg, #219ebc 0%, #4cc9a0 50%, #fb8500 100%)',
          }}
        />

        {/* Wordmark */}
        <div
          style={{
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '6px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '24px',
          }}
        >
          RACE DAY
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '24px',
            maxWidth: '900px',
          }}
        >
          Know Your Finish Time.
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: '24px',
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
            maxWidth: '680px',
            lineHeight: 1.4,
            marginBottom: '48px',
          }}
        >
          Train, project, race, compare.
        </div>

        {/* Sport pills */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Swim', color: '#219ebc' },
            { label: 'Bike', color: '#fb8500' },
            { label: 'Run',  color: '#4cc9a0' },
          ].map(({ label, color }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: '999px',
                border: `1.5px solid ${color}`,
                background: `rgba(255,255,255,0.05)`,
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
              <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '40px',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '1px',
          }}
        >
          triraceday.com
        </div>
      </div>
    ),
    { ...size }
  )
}
