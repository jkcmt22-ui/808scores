import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Hawaii Sports Center - Live High School Sports Scores'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a12 0%, #1a1a2e 50%, #0a0a12 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid background effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Glow effects */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,42,109,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            zIndex: 10,
          }}
        >
          {/* Logo text */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <span
              style={{
                fontSize: '72px',
                fontWeight: 900,
                color: '#ff2a6d',
                textTransform: 'uppercase',
                letterSpacing: '-2px',
                textShadow: '0 0 40px rgba(255,42,109,0.5)',
              }}
            >
              Hawaii
            </span>
            <span
              style={{
                fontSize: '72px',
                fontWeight: 700,
                color: '#00d4ff',
                textTransform: 'uppercase',
                letterSpacing: '-2px',
                textShadow: '0 0 40px rgba(0,212,255,0.5)',
              }}
            >
              Sports
            </span>
            <span
              style={{
                fontSize: '72px',
                fontWeight: 900,
                color: '#ffd700',
                textTransform: 'uppercase',
                letterSpacing: '-2px',
                textShadow: '0 0 40px rgba(255,215,0,0.5)',
              }}
            >
              Center
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '32px',
              color: 'rgba(255,255,255,0.8)',
              textTransform: 'uppercase',
              letterSpacing: '8px',
              marginTop: '10px',
            }}
          >
            Live High School Sports
          </div>

          {/* Scoreboard style element */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginTop: '40px',
              padding: '30px 60px',
              background: 'rgba(0,0,0,0.5)',
              border: '3px solid rgba(0,212,255,0.3)',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '2px' }}>Football</span>
              <span style={{ fontSize: '14px', color: '#ff2a6d' }}>LIVE</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '2px' }}>Basketball</span>
              <span style={{ fontSize: '14px', color: '#ffd700' }}>6 Games</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '2px' }}>Volleyball</span>
              <span style={{ fontSize: '14px', color: '#00ff88' }}>Final</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            display: 'flex',
            gap: '30px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '16px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          <span>OIA</span>
          <span>•</span>
          <span>ILH</span>
          <span>•</span>
          <span>BIIF</span>
          <span>•</span>
          <span>MIL</span>
          <span>•</span>
          <span>KIF</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
