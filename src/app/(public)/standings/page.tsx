'use client'

import { useState } from 'react'
import { Header } from '@/components/layout'
import { cn } from '@/lib/utils'
import { getCategoryEmoji } from '@/lib/sport-utils'

// Mock standings data
const mockStandings = {
  football: {
    'OIA Open': [
      { team: 'Kahuku', wins: 8, losses: 0, pct: 1.0, pf: 312, pa: 98 },
      { team: 'Mililani', wins: 7, losses: 1, pct: 0.875, pf: 278, pa: 112 },
      { team: 'Campbell', wins: 6, losses: 2, pct: 0.75, pf: 245, pa: 134 },
      { team: 'Kapolei', wins: 5, losses: 3, pct: 0.625, pf: 198, pa: 156 },
      { team: 'Waianae', wins: 4, losses: 4, pct: 0.5, pf: 167, pa: 189 },
    ],
    'ILH Open': [
      { team: 'Saint Louis', wins: 7, losses: 1, pct: 0.875, pf: 298, pa: 87 },
      { team: 'Punahou', wins: 6, losses: 2, pct: 0.75, pf: 234, pa: 112 },
      { team: 'Kamehameha', wins: 5, losses: 3, pct: 0.625, pf: 212, pa: 145 },
      { team: 'Iolani', wins: 3, losses: 5, pct: 0.375, pf: 156, pa: 198 },
    ],
  },
  basketball: {
    'OIA East': [
      { team: 'Kailua', wins: 12, losses: 2, pct: 0.857, pf: 845, pa: 678 },
      { team: 'Kalaheo', wins: 10, losses: 4, pct: 0.714, pf: 798, pa: 712 },
      { team: 'Kalani', wins: 8, losses: 6, pct: 0.571, pf: 756, pa: 734 },
    ],
    'OIA West': [
      { team: 'Mililani', wins: 11, losses: 3, pct: 0.786, pf: 867, pa: 723 },
      { team: 'Kapolei', wins: 9, losses: 5, pct: 0.643, pf: 789, pa: 756 },
      { team: 'Campbell', wins: 7, losses: 7, pct: 0.5, pf: 734, pa: 745 },
    ],
  },
}

const sports = ['Football', 'Basketball', 'Volleyball', 'Baseball', 'Soccer']

export default function StandingsPage() {
  const [selectedSport, setSelectedSport] = useState('Football')
  const sportKey = selectedSport.toLowerCase() as keyof typeof mockStandings
  const leagues = mockStandings[sportKey] || {}

  return (
    <>
      <Header title="Standings" />

      {/* Sport selector */}
      <div className="border-b-2 border-border bg-background-secondary">
        <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-3">
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={cn(
                'whitespace-nowrap px-4 py-2 font-display text-xs font-bold uppercase tracking-widest transition-all border-2',
                selectedSport === sport
                  ? 'bg-neon-blue/20 text-neon-blue border-neon-blue'
                  : 'bg-background-tertiary text-foreground-muted border-border hover:border-neon-pink hover:text-neon-pink'
              )}
              style={selectedSport === sport ? {
                textShadow: '0 0 10px var(--neon-blue)',
                boxShadow: '0 0 10px rgba(5, 217, 232, 0.3), inset 0 0 10px rgba(5, 217, 232, 0.1)'
              } : undefined}
            >
              {getCategoryEmoji(sport)} {sport}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 pb-24 grid-bg">
        {/* Standings tables */}
        {Object.entries(leagues).length > 0 ? (
          <div className="space-y-4 mt-4">
            {Object.entries(leagues).map(([league, teams]) => (
              <div key={league} className="scoreboard-panel p-4">
                <h3 className="mb-4 font-display font-bold text-neon-pink uppercase tracking-wider">{league}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="pb-2 text-left font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">Team</th>
                        <th className="pb-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">W</th>
                        <th className="pb-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">L</th>
                        <th className="pb-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">PCT</th>
                        <th className="pb-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">PF</th>
                        <th className="pb-2 text-center font-display text-xs font-bold text-foreground-muted uppercase tracking-wider">PA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((team, index) => (
                        <tr
                          key={team.team}
                          className={cn(
                            'border-b border-border',
                            index < 2 && 'bg-neon-green/5'
                          )}
                        >
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-display font-bold text-neon-yellow">{index + 1}</span>
                              <span className="font-display font-bold text-foreground">{team.team}</span>
                            </div>
                          </td>
                          <td className="py-3 text-center font-display tabular-nums text-neon-green">{team.wins}</td>
                          <td className="py-3 text-center font-display tabular-nums text-foreground-muted">{team.losses}</td>
                          <td className="py-3 text-center font-display tabular-nums text-foreground">{team.pct.toFixed(3)}</td>
                          <td className="py-3 text-center font-display tabular-nums text-foreground-subtle">{team.pf}</td>
                          <td className="py-3 text-center font-display tabular-nums text-foreground-subtle">{team.pa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="scoreboard-panel p-8 mb-4">
              <div className="score-led text-5xl mb-4 neon-text-pink">--</div>
              <span className="text-4xl">{getCategoryEmoji(selectedSport)}</span>
            </div>
            <h3 className="mb-2 font-display text-xl font-black text-foreground uppercase tracking-widest">
              No Standings
            </h3>
            <p className="text-sm text-foreground-muted max-w-xs font-display">
              Standings for {selectedSport} will be available once the season starts.
            </p>
          </div>
        )}
      </main>
    </>
  )
}
