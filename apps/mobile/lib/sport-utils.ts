// Sport code to emoji mapping
const SPORT_EMOJIS: Record<string, string> = {
  'football': '',
  'boys-basketball': '',
  'girls-basketball': '',
  'basketball': '',
  'boys-volleyball': '',
  'girls-volleyball': '',
  'volleyball': '',
  'baseball': '',
  'softball': '',
  'boys-soccer': '',
  'girls-soccer': '',
  'soccer': '',
  'swimming': '',
  'track': '',
  'cross-country': '',
  'tennis': '',
  'golf': '',
  'wrestling': '',
  'water-polo': '',
  'paddling': '',
  'bowling': '',
  'cheerleading': '',
}

export function getSportEmoji(sportCode: string): string {
  if (SPORT_EMOJIS[sportCode]) {
    return SPORT_EMOJIS[sportCode]
  }
  const baseSport = sportCode.replace(/^(boys-|girls-)/, '')
  return SPORT_EMOJIS[baseSport] || ''
}
