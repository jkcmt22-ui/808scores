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
import { format } from 'date-fns'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useChat, type ChatMessage } from '../hooks/useChat'
import { useSupabase } from '../contexts/SupabaseContext'
import { colors } from '../lib/theme'

interface MessageItemProps {
  message: ChatMessage
  onLike: (id: string) => void
  onUnlike: (id: string) => void
  currentUserId?: string
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
            {format(new Date(message.created_at), 'h:mm a')}
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

interface GameChatProps {
  gameId: string
}

export function GameChat({ gameId }: GameChatProps) {
  const { user } = useSupabase()
  const { messages, isLoading, sendMessage, likeMessage, unlikeMessage, isSending } = useChat({ gameId })
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
        <ActivityIndicator size="small" color={colors.neonPink} />
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <FontAwesome name="comments-o" size={32} color={colors.neonBlue} />
            </View>
            <Text style={styles.emptyText}>NO MESSAGES YET</Text>
            <Text style={styles.emptySubtext}>Be the first to comment!</Text>
          </View>
        }
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false })
        }}
      />

      {/* Input Area */}
      {user ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="ADD A COMMENT..."
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
          <Text style={styles.loginPromptText}>LOG IN TO JOIN THE CONVERSATION</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.foregroundMuted,
    marginTop: 8,
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
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: colors.neonPink,
    backgroundColor: colors.backgroundTertiary,
  },
  ownAvatar: {
    borderColor: colors.neonBlue,
  },
  avatarText: {
    color: colors.neonPink,
    fontSize: 14,
    fontWeight: '900',
  },
  ownAvatarText: {
    color: colors.neonBlue,
  },
  messageContent: {
    flex: 1,
    backgroundColor: colors.backgroundTertiary,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 2,
    borderLeftColor: colors.neonPink,
  },
  ownMessageContent: {
    borderLeftColor: colors.neonBlue,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neonBlue,
    backgroundColor: colors.backgroundTertiary,
    marginBottom: 16,
  },
  emptyText: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  emptySubtext: {
    color: colors.foregroundMuted,
    fontSize: 12,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.foreground,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.neonPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  loginPrompt: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  loginPromptText: {
    color: colors.foregroundMuted,
    fontSize: 12,
    letterSpacing: 1,
  },
})
