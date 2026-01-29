import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export const alt = 'Game Score - Hawaii Sports Center'
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

  let game = null

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // After migration 072, games reference teams instead of schools
    const { data } = await supabase
      .from('games')
      .select(`
        *,
        sport:sports(name, display_name, code),
        home_team:teams!games_home_team_id_fkey(school:schools(name, short_name)),
        away_team:teams!games_away_team_id_fkey(school:schools(name, short_name))
      `)
      .eq('id', id)
      .single()

    // Transform to expected structure for backward compatibility
    if (data) {
      game = {
        ...data,
        home_team: data.home_team?.school || data.home_team,
        away_team: data.away_team?.school || data.away_team,
      }
    }
  }

  // Fallback if no game found
  if (!game) {
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

  const isLive = game.status === 'in_progress'
  const isFinal = game.status === 'final'
  const isScheduled = game.status === 'scheduled'
  const sportName = game.sport.display_name || game.sport.name

  // Format game time
  const gameDate = new Date(game.scheduled_at)
  const formattedDate = gameDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'Pacific/Honolulu',
  })
  const formattedTime = gameDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Pacific/Honolulu',
  })

  // Status color
  const statusColor = isLive ? '#ff2a6d' : isFinal ? '#888' : '#ffd700'
  const statusText = isLive ? 'LIVE' : isFinal ? 'FINAL' : formattedTime

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

        {/* Live glow effect */}
        {isLive && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '600px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(255,42,109,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
        )}

        {/* Header - Sport & Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          <span
            style={{
              fontSize: '28px',
              color: '#00d4ff',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              fontWeight: 700,
            }}
          >
            {sportName}
          </span>
          <span
            style={{
              fontSize: '24px',
              color: statusColor,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: 900,
              padding: '8px 20px',
              background: isLive ? 'rgba(255,42,109,0.2)' : 'transparent',
              border: `2px solid ${statusColor}`,
              borderRadius: '4px',
            }}
          >
            {statusText}
          </span>
        </div>

        {/* Scoreboard */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '60px',
            padding: '40px 80px',
            background: 'rgba(0,0,0,0.6)',
            border: '3px solid rgba(0,212,255,0.3)',
            borderRadius: '12px',
          }}
        >
          {/* Away Team */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <div
              style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #1a1a2e, #0a0a12)',
                border: '3px solid #00d4ff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: 900,
                color: '#00d4ff',
              }}
            >
              {game.away_team.short_name.slice(0, 2).toUpperCase()}
            </div>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#fff',
                textAlign: 'center',
                maxWidth: '200px',
              }}
            >
              {game.away_team.short_name}
            </span>
          </div>

          {/* Score */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            {!isScheduled ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                <span
                  style={{
                    fontSize: '96px',
                    fontWeight: 900,
                    color: '#ffd700',
                    fontFamily: 'monospace',
                    textShadow: '0 0 30px rgba(255,215,0,0.5)',
                  }}
                >
                  {game.away_score}
                </span>
                <span style={{ fontSize: '48px', color: 'rgba(255,255,255,0.3)' }}>-</span>
                <span
                  style={{
                    fontSize: '96px',
                    fontWeight: 900,
                    color: '#ffd700',
                    fontFamily: 'monospace',
                    textShadow: '0 0 30px rgba(255,215,0,0.5)',
                  }}
                >
                  {game.home_score}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontSize: '64px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>--</span>
                <span style={{ fontSize: '48px', color: 'rgba(255,255,255,0.3)' }}>vs</span>
                <span style={{ fontSize: '64px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>--</span>
              </div>
            )}
            {isLive && game.current_period && (
              <span style={{ fontSize: '20px', color: '#ff2a6d', textTransform: 'uppercase' }}>
                {game.current_period} {game.time_remaining && `• ${game.time_remaining}`}
              </span>
            )}
          </div>

          {/* Home Team */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <div
              style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #1a1a2e, #0a0a12)',
                border: '3px solid #ff2a6d',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: 900,
                color: '#ff2a6d',
              }}
            >
              {game.home_team.short_name.slice(0, 2).toUpperCase()}
            </div>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#fff',
                textAlign: 'center',
                maxWidth: '200px',
              }}
            >
              {game.home_team.short_name}
            </span>
          </div>
        </div>

        {/* Date */}
        <div
          style={{
            marginTop: '30px',
            fontSize: '22px',
            color: 'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
            letterSpacing: '3px',
          }}
        >
          {formattedDate}
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
