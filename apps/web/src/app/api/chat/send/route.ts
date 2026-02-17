import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { validateMessage, isValidGifUrl } from '@808scores/shared/lib'

interface SendMessageRequest {
  content: string
  reply_to_id?: string | null
  message_type?: 'text' | 'gif'
  gif_url?: string | null
  gif_id?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Authenticate
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Check if user is banned
    const { data: isBanned } = await supabase.rpc('is_user_banned', { p_user_id: user.id } as never)
    if (isBanned) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
    }

    // 3. Parse and validate request
    const body: SendMessageRequest = await request.json()
    const { content, reply_to_id, message_type = 'text', gif_url, gif_id } = body

    if (message_type === 'gif') {
      if (!isValidGifUrl(gif_url)) {
        return NextResponse.json(
          { error: 'Invalid GIF URL: only GIPHY images are allowed' },
          { status: 400 }
        )
      }
    } else {
      // 4. Server-side message validation (profanity, spam, length)
      const validation = validateMessage(content, user.id)
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || 'Message not allowed' },
          { status: 400 }
        )
      }
    }

    // 5. Rate limit check via DB (last 10 messages in 60 seconds)
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString()
    const { count: recentCount } = await supabase
      .from('general_chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneMinuteAgo)

    if ((recentCount ?? 0) >= 10) {
      return NextResponse.json(
        { error: 'Slow down! You can send up to 10 messages per minute.' },
        { status: 429 }
      )
    }

    // 6. Resolve @mentions
    let mentionedUserIds: string[] = []
    if (message_type === 'text' && content) {
      const mentionRegex = /@(\w+)/g
      const mentionMatches = content.match(mentionRegex) || []
      const mentionedUsernames = mentionMatches.map(m => m.slice(1))

      if (mentionedUsernames.length > 0) {
        const { data: mentionedUsers } = await supabase
          .from('users')
          .select('id, display_name')
          .in('display_name', mentionedUsernames)

        mentionedUserIds = (mentionedUsers as { id: string }[] || []).map(u => u.id)
      }
    }

    // 7. Insert message
    const { data: message, error: insertError } = await (supabase as never as { from: (table: string) => { insert: (row: Record<string, unknown>) => { select: () => { single: () => Promise<{ data: unknown; error: unknown }> } } } })
      .from('general_chat_messages')
      .insert({
        user_id: user.id,
        content: message_type === 'gif' ? '' : content.trim(),
        reply_to_id: reply_to_id || null,
        mentions: mentionedUserIds,
        message_type,
        gif_url: message_type === 'gif' ? gif_url : null,
        gif_id: message_type === 'gif' ? gif_id : null,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to send message', message: String(insertError) },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send message', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
