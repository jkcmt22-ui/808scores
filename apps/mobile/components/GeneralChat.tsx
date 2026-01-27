import React, { useState, useRef, useCallback } from 'react'
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native'
import { format, isToday, isYesterday } from 'date-fns'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import EmojiPicker from 'rn-emoji-keyboard'
import { useGeneralChat, type GeneralChatMessage } from '../hooks/useGeneralChat'
import { useSupabase } from '../contexts/SupabaseContext'
import { GifPicker } from './GifPicker'
import { colors } from '../lib/theme'
import Constants from 'expo-constants'

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'https://hawaiisportscenter.com'

interface MessageItemProps {
  message: GeneralChatMessage
  onLike: (id: string) => void
  onUnlike: (id: string) => void
  onReply: (message: GeneralChatMessage) => void
  onScrollToMessage?: (id: string) => void
  currentUserId?: string
  isHighlighted?: boolean
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) {
    return format(date, 'h:mm a')
  } else if (isYesterday(date)) {
    return 'Yesterday ' + format(date, 'h:mm a')
  }
  return format(date, 'MMM d, h:mm a')
}

function MessageItem({ message, onLike, onUnlike, onReply, onScrollToMessage, currentUserId, isHighlighted }: MessageItemProps) {
  const isOwnMessage = message.user_id === currentUserId
  const displayName = message.user?.display_name || 'Anonymous'
  const initial = displayName.charAt(0).toUpperCase()
  const isGifMessage = message.message_type === 'gif' && message.gif_url

  const handleLikeToggle = () => {
    if (message.liked_by_me) {
      onUnlike(message.id)
    } else {
      onLike(message.id)
    }
  }

  const handleReplyPress = () => {
    if (message.reply_to?.id && onScrollToMessage) {
      onScrollToMessage(message.reply_to.id)
    }
  }

  return (
    <View style={[styles.messageContainer, isOwnMessage && styles.ownMessage, isHighlighted && styles.highlightedMessage]}>
      {/* Reply preview */}
      {message.reply_to && (
        <TouchableOpacity
          style={styles.replyPreview}
          onPress={handleReplyPress}
          disabled={!onScrollToMessage}
          activeOpacity={0.7}
        >
          <View style={styles.replyHeader}>
            <View style={styles.replyAvatar}>
              <Text style={styles.replyAvatarText}>
                {message.reply_to.user?.display_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={styles.replyUsername}>
              @{message.reply_to.user?.display_name || 'User'}
            </Text>
          </View>
          <Text style={styles.replyContent} numberOfLines={2}>
            {message.reply_to.message_type === 'gif' ? '[GIF]' : message.reply_to.content}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.messageRow}>
        {/* Avatar */}
        <View style={[styles.avatar, isOwnMessage && styles.ownAvatar]}>
          <Text style={[styles.avatarText, isOwnMessage && styles.ownAvatarText]}>{initial}</Text>
        </View>

        {/* Message Content */}
        <View style={[styles.messageContent, isOwnMessage && styles.ownMessageContent]}>
          <View style={styles.messageHeader}>
            <Text style={[styles.displayName, isOwnMessage && styles.ownDisplayName]}>{displayName.toUpperCase()}</Text>
            <Text style={styles.timestamp}>
              {formatMessageTime(message.created_at)}
            </Text>
          </View>

          {/* GIF or Text Content */}
          {isGifMessage ? (
            <View style={styles.gifContainer}>
              <Image
                source={{ uri: message.gif_url! }}
                style={styles.gifImage}
                resizeMode="contain"
              />
              <Text style={styles.giphyAttribution}>via GIPHY</Text>
            </View>
          ) : (
            <Text style={styles.messageText}>{message.content}</Text>
          )}

          {/* Actions */}
          <View style={styles.messageActions}>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={handleLikeToggle}
              disabled={!currentUserId}
              accessibilityLabel={`${message.liked_by_me ? 'Unlike' : 'Like'} message${message.like_count > 0 ? `, ${message.like_count} likes` : ''}`}
              accessibilityRole="button"
            >
              <FontAwesome
                name={message.liked_by_me ? 'heart' : 'heart-o'}
                size={14}
                color={message.liked_by_me ? colors.neonPink : colors.foregroundMuted}
              />
              {message.like_count > 0 && (
                <Text style={[styles.likeCount, message.liked_by_me && styles.likedCount]}>
                  {message.like_count}
                </Text>
              )}
            </TouchableOpacity>

            {currentUserId && (
              <TouchableOpacity
                style={styles.replyButton}
                onPress={() => onReply(message)}
                accessibilityLabel="Reply to message"
              >
                <FontAwesome name="reply" size={14} color={colors.foregroundMuted} />
                <Text style={styles.replyButtonText}>Reply</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

export function GeneralChat() {
  const { user } = useSupabase()
  const { messages, isLoading, sendMessage, sendGif, likeMessage, unlikeMessage, isSending, loadMore, hasMore } = useGeneralChat()
  const [inputText, setInputText] = useState('')
  const [replyingTo, setReplyingTo] = useState<GeneralChatMessage | null>(null)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const flatListRef = useRef<FlatList>(null)

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return

    const text = inputText
    setInputText('')

    const success = await sendMessage(text, replyingTo?.id)
    if (success) {
      setReplyingTo(null)
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    } else {
      setInputText(text)
    }
  }

  const handleGifSelect = async (gif: { id: string; url: string }) => {
    setShowGifPicker(false)
    const success = await sendGif(gif, replyingTo?.id)
    if (success) {
      setReplyingTo(null)
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }

  const handleEmojiSelect = (emoji: { emoji: string }) => {
    setInputText(prev => prev + emoji.emoji)
    setShowEmojiPicker(false)
  }

  const handleReply = (message: GeneralChatMessage) => {
    setReplyingTo(message)
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  const scrollToMessage = useCallback((messageId: string) => {
    const index = messages.findIndex(m => m.id === messageId)
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 })
      setHighlightedMessageId(messageId)
      setTimeout(() => setHighlightedMessageId(null), 2000)
    }
  }, [messages])

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.neonPink} />
        <Text style={styles.loadingText}>LOADING CHAT...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageItem
            message={item}
            onLike={likeMessage}
            onUnlike={unlikeMessage}
            onReply={handleReply}
            onScrollToMessage={scrollToMessage}
            currentUserId={user?.id}
            isHighlighted={highlightedMessageId === item.id}
          />
        )}
        contentContainerStyle={styles.messagesList}
        ListHeaderComponent={
          hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={loadMore}
              accessibilityLabel="Load older messages"
              accessibilityRole="button"
            >
              <Text style={styles.loadMoreText}>LOAD OLDER MESSAGES</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <FontAwesome name="comments-o" size={40} color={colors.neonBlue} />
            </View>
            <Text style={styles.emptyTitle}>WELCOME TO THE COMMUNITY</Text>
            <Text style={styles.emptyText}>This is the general chat for all Hawaii high school sports fans.</Text>
            <Text style={styles.emptySubtext}>Be the first to start the conversation!</Text>
          </View>
        }
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        }}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true })
          }, 100)
        }}
      />

      {/* Reply Preview */}
      {replyingTo && (
        <View style={styles.replyBanner}>
          <View style={styles.replyBannerContent}>
            <Text style={styles.replyBannerLabel}>Replying to </Text>
            <Text style={styles.replyBannerUsername}>@{replyingTo.user?.display_name || 'User'}</Text>
            <Text style={styles.replyBannerPreview} numberOfLines={1}>
              : {replyingTo.message_type === 'gif' ? '[GIF]' : replyingTo.content}
            </Text>
          </View>
          <TouchableOpacity style={styles.replyBannerClose} onPress={cancelReply}>
            <FontAwesome name="times" size={16} color={colors.foregroundMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Area */}
      {user ? (
        <View style={styles.inputContainer}>
          {/* Emoji Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowEmojiPicker(true)}
            accessibilityLabel="Add emoji"
          >
            <FontAwesome name="smile-o" size={20} color={colors.foregroundMuted} />
          </TouchableOpacity>

          {/* GIF Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowGifPicker(true)}
            accessibilityLabel="Add GIF"
          >
            <FontAwesome name="image" size={20} color={colors.foregroundMuted} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={replyingTo ? 'Write a reply...' : 'SAY SOMETHING...'}
            placeholderTextColor={colors.foregroundMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            accessibilityLabel="Message input"
            accessibilityHint="Type your message here"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
            accessibilityLabel={isSending ? 'Sending message' : 'Send message'}
            accessibilityRole="button"
            accessibilityState={{ disabled: !inputText.trim() || isSending }}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <FontAwesome name="send" size={16} color={colors.background} />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loginPrompt}>
          <FontAwesome name="user" size={16} color={colors.neonBlue} />
          <Text style={styles.loginPromptText}>SIGN IN TO JOIN THE CONVERSATION</Text>
        </View>
      )}

      {/* GIF Picker */}
      <GifPicker
        visible={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelect={handleGifSelect}
        apiBaseUrl={API_BASE_URL}
      />

      {/* Emoji Picker */}
      <EmojiPicker
        open={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelected={handleEmojiSelect}
        theme={{
          backdrop: colors.background + 'CC',
          knob: colors.border,
          container: colors.backgroundSecondary,
          header: colors.foreground,
          skinTonesContainer: colors.backgroundTertiary,
          category: {
            icon: colors.foregroundMuted,
            iconActive: colors.neonPink,
            container: colors.backgroundSecondary,
            containerActive: colors.backgroundTertiary,
          },
          search: {
            text: colors.foreground,
            placeholder: colors.foregroundMuted,
            icon: colors.foregroundMuted,
            background: colors.backgroundTertiary,
          },
          emoji: {
            selected: colors.neonPink + '40',
          },
        }}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.foregroundMuted,
    marginTop: 12,
    letterSpacing: 1,
    fontSize: 12,
  },
  messagesList: {
    padding: 12,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageRow: {
    flexDirection: 'row',
  },
  ownMessage: {},
  highlightedMessage: {
    backgroundColor: colors.neonBlue + '20',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  replyPreview: {
    marginLeft: 46,
    marginBottom: 4,
    paddingLeft: 8,
    paddingVertical: 4,
    borderLeftWidth: 2,
    borderLeftColor: colors.foregroundMuted,
    backgroundColor: colors.backgroundSecondary + '80',
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyAvatarText: {
    color: colors.foregroundMuted,
    fontSize: 8,
    fontWeight: '700',
  },
  replyUsername: {
    color: colors.neonBlue,
    fontSize: 10,
    fontWeight: '600',
  },
  replyContent: {
    color: colors.foregroundMuted,
    fontSize: 11,
    marginTop: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: colors.neonPink,
    backgroundColor: colors.backgroundSecondary,
  },
  ownAvatar: {
    borderColor: colors.neonBlue,
  },
  avatarText: {
    color: colors.neonPink,
    fontSize: 16,
    fontWeight: '900',
  },
  ownAvatarText: {
    color: colors.neonBlue,
  },
  messageContent: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.neonPink,
  },
  ownMessageContent: {
    borderLeftColor: colors.neonBlue,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  displayName: {
    color: colors.neonPink,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  ownDisplayName: {
    color: colors.neonBlue,
  },
  timestamp: {
    color: colors.foregroundMuted,
    fontSize: 10,
  },
  messageText: {
    color: colors.foreground,
    fontSize: 14,
    lineHeight: 20,
  },
  gifContainer: {
    marginTop: 4,
  },
  gifImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: colors.backgroundTertiary,
  },
  giphyAttribution: {
    color: colors.foregroundMuted,
    fontSize: 9,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  messageActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    color: colors.foregroundMuted,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  likedCount: {
    color: colors.neonPink,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyButtonText: {
    color: colors.foregroundMuted,
    fontSize: 12,
  },
  loadMoreButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  loadMoreText: {
    color: colors.foregroundMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  replyBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyBannerLabel: {
    color: colors.foregroundMuted,
    fontSize: 12,
  },
  replyBannerUsername: {
    color: colors.neonBlue,
    fontSize: 12,
    fontWeight: '600',
  },
  replyBannerPreview: {
    color: colors.foregroundMuted,
    fontSize: 12,
    flex: 1,
  },
  replyBannerClose: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neonBlue,
    backgroundColor: colors.backgroundSecondary,
    marginBottom: 20,
  },
  emptyTitle: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12,
  },
  emptyText: {
    color: colors.foregroundMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptySubtext: {
    color: colors.neonYellow,
    fontSize: 12,
    marginTop: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.foreground,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.neonPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  loginPromptText: {
    color: colors.neonBlue,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
})
