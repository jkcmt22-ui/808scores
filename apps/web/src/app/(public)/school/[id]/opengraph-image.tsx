import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export const alt = 'School - Hawaii Sports Center'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: { id: string } }) {
  const { id } = params

  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let school = null

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data } = await supabase
      .from('schools')
      .select('*')
      .eq('id', id)
      .single()

    school = data
  }

  // Fallback if no school found
  if (!school) {
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #0a0a12 0%, #1a1a2e 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <span style={{ fontSize: '48px', color: '#fff' }}>Hawaii Sports Center</span>
        </div>
      ),
      { ...size }
    )
  }

  // Get league color
  const leagueColors: Record<string, string> = {
    OIA: '#ff2a6d',
    ILH: '#00d4ff',
    BIIF: '#00ff88',
    MIL: '#ffd700',
    KIF: '#ff8c00',
  }
  const leagueColor = leagueColors[school.league] || '#00d4ff'

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
        {/* Grid background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            height: '500px',
            background: `radial-gradient(circle, ${leagueColor}15 0%, transparent 70%)`,
            borderRadius: '50%',
          }}
        />

        {/* School Logo Placeholder */}
        <div
          style={{
            width: '180px',
            height: '180px',
            background: 'linear-gradient(135deg, #1a1a2e, #0a0a12)',
            border: `4px solid ${leagueColor}`,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '72px',
            fontWeight: 900,
            color: leagueColor,
            marginBottom: '30px',
            boxShadow: `0 0 40px ${leagueColor}40`,
          }}
        >
          {school.short_name.slice(0, 2).toUpperCase()}
        </div>

        {/* School Name */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 900,
            color: '#fff',
            textAlign: 'center',
            maxWidth: '900px',
            marginBottom: '10px',
          }}
        >
          {school.name}
        </div>

        {/* Mascot */}
        {school.mascot && (
          <div
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: leagueColor,
              textTransform: 'uppercase',
              letterSpacing: '4px',
              marginBottom: '20px',
            }}
          >
            {school.mascot}
          </div>
        )}

        {/* League & Island */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            marginTop: '20px',
          }}
        >
          {school.league && (
            <div
              style={{
                fontSize: '24px',
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '3px',
                padding: '12px 30px',
                background: `${leagueColor}20`,
                border: `2px solid ${leagueColor}`,
                borderRadius: '6px',
              }}
            >
              {school.league}
            </div>
          )}
          {school.island && (
            <div
              style={{
                fontSize: '22px',
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              {school.island}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '24px', fontWeight: 900, color: '#ff2a6d' }}>HAWAII</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#00d4ff' }}>SPORTS</span>
          <span style={{ fontSize: '24px', fontWeight: 900, color: '#ffd700' }}>CENTER</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
