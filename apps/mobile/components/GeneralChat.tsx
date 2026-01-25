import React, { useState, useRef } from 'react'
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
} from 'react-native'
import { format, isToday, isYesterday } from 'date-fns'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useGeneralChat, type GeneralChatMessage } from '../hooks/useGeneralChat'
import { useSupabase } from '../contexts/SupabaseContext'
import { colors } from '../lib/theme'

interface MessageItemProps {
  message: GeneralChatMessage
  onLike: (id: string) => void
  onUnlike: (id: string) => void
  currentUserId?: string
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

function MessageItem({ message, onLike, onUnlike, currentUserId }: MessageItemProps) {
  const isOwnMessage = message.user_id === currentUserId
  const displayName = message.user?.display_name || 'Anonymous'
  const initial = displayName.charAt(0).toUpperCase()

  const handleLikeToggle = () => {
    if (message.liked_by_me) {
      onUnlike(message.id)
    } else {
      onLike(message.id)
    }
  }

  return (
    <View style={[styles.messageContainer, isOwnMessage && styles.ownMessage]}>
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
        <Text style={styles.messageText}>{message.content}</Text>

        {/* Actions */}
        <View style={styles.messageActions}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLikeToggle}
            disabled={!currentUserId}
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
        </View>
      </View>
    </View>
  )
}

export function GeneralChat() {
  const { user } = useSupabase()
  const { messages, isLoading, sendMessage, likeMessage, unlikeMessage, isSending, loadMore, hasMore } = useGeneralChat()
  const [inputText, setInputText] = useState('')
  const flatListRef = useRef<FlatList>(null)

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return

    const text = inputText
    setInputText('')

    const success = await sendMessage(text)
    if (success) {
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    } else {
      // Restore text if failed
      setInputText(text)
    }
  }

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
            currentUserId={user?.id}
          />
        )}
        contentContainerStyle={styles.messagesList}
        ListHeaderComponent={
          hasMore ? (
            <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
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
      />

      {/* Input Area */}
      {user ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="SAY SOMETHING..."
            placeholderTextColor={colors.foregroundMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
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
    flexDirection: 'row',
    marginBottom: 12,
  },
  ownMessage: {
    // Styled differently below
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
  messageActions: {
    flexDirection: 'row',
    marginTop: 8,
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
    gap: 10,
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
