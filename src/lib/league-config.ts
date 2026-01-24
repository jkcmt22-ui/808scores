// League structure definitions for Hawaii high school sports

export interface LeagueConfig {
  name: string
  shortName: string
  island: string
  divisions: string[]
  hasRegional: boolean
  regionalDivisions?: string[]
  regions?: string[]
}

export const LEAGUES: Record<string, LeagueConfig> = {
  OIA: {
    name: 'Oahu Interscholastic Association',
    shortName: 'OIA',
    island: 'Oahu',
    divisions: ['Open', 'Division I', 'Division II'],
    hasRegional: true,
    regionalDivisions: ['Division I', 'Division II'],
    regions: ['East', 'West']
  },
  ILH: {
    name: 'Interscholastic League of Honolulu',
    shortName: 'ILH',
    island: 'Oahu',
    divisions: ['Open', 'Division I', 'Division II', 'Division III'],
    hasRegional: false
  },
  BIIF: {
    name: 'Big Island Interscholastic Federation',
    shortName: 'BIIF',
    island: 'Hawaii',
    divisions: ['Division I', 'Division II'],
    hasRegional: false
  },
  MIL: {
    name: 'Maui Interscholastic League',
    shortName: 'MIL',
    island: 'Maui',
    divisions: ['Division I', 'Division II'],
    hasRegional: false
  },
  KIF: {
    name: 'Kauai Interscholastic Federation',
    shortName: 'KIF',
    island: 'Kauai',
    divisions: ['Division I', 'Division II'],
    hasRegional: false
  }
} as const

export const ISLANDS = ['Oahu', 'Maui', 'Hawaii', 'Kauai', 'Molokai', 'Lanai'] as const

export type Island = typeof ISLANDS[number]
export type LeagueCode = keyof typeof LEAGUES

// Helper functions
export function getLeagueByIsland(island: string): LeagueConfig[] {
  return Object.values(LEAGUES).filter(league => league.island === island)
}

export function getLeaguesForIsland(island: string): string[] {
  return Object.entries(LEAGUES)
    .filter(([, config]) => config.island === island)
    .map(([code]) => code)
}

export function getDivisionsForLeague(leagueCode: string, region?: string): string[] {
  const league = LEAGUES[leagueCode]
  if (!league) return []

  if (league.hasRegional && region && league.regionalDivisions) {
    return league.divisions.map(div =>
      league.regionalDivisions?.includes(div) ? `${div} ${region}` : div
    )
  }

  return league.divisions
}

export function parseLeagueDivision(division: string | null): { league: string; division: string; region?: string } | null {
  if (!division) return null

  // Check for regional format like "Division I East"
  const regionalMatch = division.match(/^(.+?)\s+(East|West)$/i)
  if (regionalMatch) {
    return {
      league: '', // Will need to be determined from school's league field
      division: regionalMatch[1],
      region: regionalMatch[2]
    }
  }

  return {
    league: '',
    division: division,
    region: undefined
  }
}

export function getFullDivisionName(division: string, region?: string): string {
  if (region) {
    return `${division} ${region}`
  }
  return division
}

export function getLeagueDisplayName(leagueCode: string): string {
  return LEAGUES[leagueCode]?.name ?? leagueCode
}
