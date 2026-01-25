/**
 * Parse @mentions from text
 * Extracts user IDs from mention patterns
 */

export interface ParsedMention {
  displayName: string
  startIndex: number
  endIndex: number
}

/**
 * Extract @mention patterns from text
 * Returns display names found in the text
 */
export function extractMentions(text: string): ParsedMention[] {
  const mentionRegex = /@(\w+)/g
  const mentions: ParsedMention[] = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      displayName: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    })
  }

  return mentions
}

/**
 * Convert display names to user IDs using a lookup map
 */
export function resolveMentionsToUserIds(
  mentions: ParsedMention[],
  userLookup: Map<string, string> // displayName (lowercase) -> userId
): string[] {
  const userIds: string[] = []

  for (const mention of mentions) {
    const userId = userLookup.get(mention.displayName.toLowerCase())
    if (userId) {
      userIds.push(userId)
    }
  }

  // Return unique user IDs
  return [...new Set(userIds)]
}

/**
 * Create a lookup map from a list of users
 */
export function createUserLookup(
  users: Array<{ id: string; display_name: string | null }>
): Map<string, string> {
  const lookup = new Map<string, string>()

  for (const user of users) {
    if (user.display_name) {
      lookup.set(user.display_name.toLowerCase(), user.id)
    }
  }

  return lookup
}

/**
 * Full mention parsing: extract mentions and resolve to user IDs
 */
export function parseMentions(
  text: string,
  users: Array<{ id: string; display_name: string | null }>
): string[] {
  const mentions = extractMentions(text)
  const userLookup = createUserLookup(users)
  return resolveMentionsToUserIds(mentions, userLookup)
}

/**
 * Highlight mentions in text for display (returns React-renderable parts)
 */
export function highlightMentions(text: string): Array<{ text: string; isMention: boolean }> {
  const parts: Array<{ text: string; isMention: boolean }> = []
  const mentionRegex = /@(\w+)/g
  let lastIndex = 0
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, match.index),
        isMention: false,
      })
    }

    // Add mention
    parts.push({
      text: match[0],
      isMention: true,
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      isMention: false,
    })
  }

  return parts
}

/**
 * Validate that a mention format is correct
 */
export function isValidMention(mention: string): boolean {
  return /^@\w+$/.test(mention)
}
