/**
 * Sport utility functions and emoji mappings
 */

// Sport code to emoji mapping
const SPORT_EMOJIS: Record<string, string> = {
  // Football
  'football': '🏈',

  // Basketball
  'boys-basketball': '🏀',
  'girls-basketball': '🏀',
  'basketball': '🏀',

  // Volleyball
  'boys-volleyball': '🏐',
  'girls-volleyball': '🏐',
  'volleyball': '🏐',

  // Baseball & Softball
  'baseball': '⚾',
  'softball': '🥎',

  // Soccer
  'boys-soccer': '⚽',
  'girls-soccer': '⚽',
  'soccer': '⚽',

  // Other sports (for future expansion)
  'swimming': '🏊',
  'track': '🏃',
  'cross-country': '🏃',
  'tennis': '🎾',
  'golf': '⛳',
  'wrestling': '🤼',
  'water-polo': '🤽',
  'paddling': '🛶',
  'bowling': '🎳',
  'cheerleading': '📣',
}

// Category name to emoji mapping (for filter display)
const CATEGORY_EMOJIS: Record<string, string> = {
  'Football': '🏈',
  'Basketball': '🏀',
  'Volleyball': '🏐',
  'Baseball': '⚾',
  'Softball': '🥎',
  'Soccer': '⚽',
  'Swimming': '🏊',
  'Track': '🏃',
  'Cross Country': '🏃',
  'Tennis': '🎾',
  'Golf': '⛳',
  'Wrestling': '🤼',
  'Water Polo': '🤽',
  'Paddling': '🛶',
  'Bowling': '🎳',
  'Cheerleading': '📣',
}

/**
 * Get emoji for a sport code
 * @param sportCode - The sport code (e.g., 'boys-basketball', 'football')
 * @returns The emoji for the sport, or empty string if not found
 */
export function getSportEmoji(sportCode: string): string {
  // Try exact match first
  if (SPORT_EMOJIS[sportCode]) {
    return SPORT_EMOJIS[sportCode]
  }

  // Try matching base sport (remove gender prefix)
  const baseSport = sportCode.replace(/^(boys-|girls-)/, '')
  return SPORT_EMOJIS[baseSport] || ''
}

/**
 * Get emoji for a category name
 * @param categoryName - The category name (e.g., 'Basketball', 'Football')
 * @returns The emoji for the category, or empty string if not found
 */
export function getCategoryEmoji(categoryName: string): string {
  return CATEGORY_EMOJIS[categoryName] || ''
}

/**
 * Format sport display with emoji
 * @param sportCode - The sport code
 * @param displayName - The display name of the sport
 * @returns Formatted string with emoji prefix
 */
export function formatSportWithEmoji(sportCode: string, displayName: string): string {
  const emoji = getSportEmoji(sportCode)
  return emoji ? `${emoji} ${displayName}` : displayName
}

/**
 * Format category display with emoji
 * @param categoryName - The category name
 * @returns Formatted string with emoji prefix
 */
export function formatCategoryWithEmoji(categoryName: string): string {
  const emoji = getCategoryEmoji(categoryName)
  return emoji ? `${emoji} ${categoryName}` : categoryName
}
