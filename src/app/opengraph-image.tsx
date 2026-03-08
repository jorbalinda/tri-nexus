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
          flexDirection: 'row',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
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

        {/* Left column — logo */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            width: '340px',
            paddingLeft: '80px',
            paddingRight: '60px',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            height: '100%',
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #219ebc, #4cc9a0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px' }}>TR</div>
          </div>

          <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
            RACE DAY
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' }}>
            triraceday.com
          </div>

          {/* Sport pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '36px' }}>
            {[
              { label: 'Swim', color: '#219ebc' },
              { label: 'Bike', color: '#fb8500' },
              { label: 'Run',  color: '#4cc9a0' },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            flex: 1,
            paddingLeft: '72px',
            paddingRight: '80px',
          }}
        >
          <div
            style={{
              fontSize: '62px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: '20px',
            }}
          >
            Know Your<br />Finish Time.
          </div>
          <div
            style={{
              fontSize: '22px',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.5,
            }}
          >
            Train, project, race, compare.<br />Your finish time — before the start line.
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
