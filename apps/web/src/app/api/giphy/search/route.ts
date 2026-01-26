import { NextRequest, NextResponse } from 'next/server'

const GIPHY_API_KEY = process.env.GIPHY_API_KEY
const GIPHY_RATING_LIMIT = process.env.GIPHY_RATING_LIMIT || 'pg'

// Rate limiting: track requests per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const MAX_REQUESTS_PER_MINUTE = 30

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 })
    return false
  }

  if (userLimit.count >= MAX_REQUESTS_PER_MINUTE) {
    return true
  }

  userLimit.count++
  return false
}

// Simple in-memory cache (15 minute TTL)
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

function getCachedResponse(key: string): unknown | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  cache.delete(key)
  return null
}

function setCachedResponse(key: string, data: unknown): void {
  // Clean old entries if cache grows too large
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) cache.delete(oldestKey)
  }
  cache.set(key, { data, timestamp: Date.now() })
}

export async function GET(request: NextRequest) {
  if (!GIPHY_API_KEY) {
    return NextResponse.json(
      { error: 'Giphy API not configured' },
      { status: 503 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
  const offset = parseInt(searchParams.get('offset') || '0')

  // Get user ID from header (set by auth middleware) or use IP
  const userId = request.headers.get('x-user-id') ||
                 request.headers.get('x-forwarded-for') ||
                 'anonymous'

  // Check rate limit
  if (isRateLimited(userId)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before searching again.' },
      { status: 429 }
    )
  }

  // Build cache key
  const cacheKey = `giphy:${query}:${limit}:${offset}`

  // Check cache
  const cachedData = getCachedResponse(cacheKey)
  if (cachedData) {
    return NextResponse.json(cachedData)
  }

  try {
    let giphyUrl: string

    if (query) {
      // Search endpoint
      giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&rating=${GIPHY_RATING_LIMIT}&lang=en`
    } else {
      // Trending endpoint when no query
      giphyUrl = `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&offset=${offset}&rating=${GIPHY_RATING_LIMIT}`
    }

    const response = await fetch(giphyUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Giphy API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform response to only include necessary data
    const transformedData = {
      data: data.data.map((gif: {
        id: string
        title: string
        images: {
          fixed_height: { url: string; width: string; height: string }
          fixed_height_small: { url: string; width: string; height: string }
          preview_gif: { url: string }
        }
      }) => ({
        id: gif.id,
        title: gif.title,
        url: gif.images.fixed_height.url,
        preview: gif.images.fixed_height_small?.url || gif.images.preview_gif?.url,
        width: parseInt(gif.images.fixed_height.width),
        height: parseInt(gif.images.fixed_height.height),
      })),
      pagination: data.pagination,
    }

    // Cache the response
    setCachedResponse(cacheKey, transformedData)

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Giphy API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GIFs' },
      { status: 500 }
    )
  }
}
