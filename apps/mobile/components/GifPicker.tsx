import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { colors } from '../lib/theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const GIF_SIZE = (SCREEN_WIDTH - 48) / 3 // 3 columns with padding

interface GifResult {
  id: string
  title: string
  url: string
  preview: string
  width: number
  height: number
}

interface GifPickerProps {
  visible: boolean
  onClose: () => void
  onSelect: (gif: { id: string; url: string }) => void
  apiBaseUrl: string // Base URL for the Giphy proxy API
}

export function GifPicker({ visible, onClose, onSelect, apiBaseUrl }: GifPickerProps) {
  const [query, setQuery] = useState('')
  const [gifs, setGifs] = useState<GifResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<TextInput>(null)

  const fetchGifs = useCallback(async (searchQuery: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: '30',
        offset: '0',
      })
      if (searchQuery) {
        params.set('q', searchQuery)
      }

      const response = await fetch(`${apiBaseUrl}/api/giphy/search?${params}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch GIFs')
      }

      const data = await response.json()
      setGifs(data.data || [])
    } catch (err) {
      console.error('Error fetching GIFs:', err)
      setError(err instanceof Error ? err.message : 'Failed to load GIFs')
      setGifs([])
    } finally {
      setIsLoading(false)
    }
  }, [apiBaseUrl])

  // Fetch trending GIFs on open
  useEffect(() => {
    if (visible) {
      fetchGifs('')
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setGifs([])
    }
  }, [visible, fetchGifs])

  // Debounced search
  useEffect(() => {
    if (!visible) return

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchGifs(query)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, visible, fetchGifs])

  const handleSelect = (gif: GifResult) => {
    onSelect({ id: gif.id, url: gif.url })
    onClose()
  }

  const renderGif = ({ item }: { item: GifResult }) => (
    <TouchableOpacity
      style={styles.gifItem}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
      accessibilityLabel={item.title || 'GIF'}
    >
      <Image
        source={{ uri: item.preview || item.url }}
        style={styles.gifImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  )

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>SELECT GIF</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close GIF picker"
            >
              <FontAwesome name="times" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <FontAwesome name="search" size={16} color={colors.foregroundMuted} style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search GIPHY..."
              placeholderTextColor={colors.foregroundMuted}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {isLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.neonPink} />
              </View>
            ) : error ? (
              <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : gifs.length === 0 ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>
                  {query ? 'No GIFs found' : 'Search for GIFs'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={gifs}
                keyExtractor={(item) => item.id}
                renderItem={renderGif}
                numColumns={3}
                contentContainerStyle={styles.gifList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by GIPHY</Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.neonYellow,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.foreground,
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  emptyText: {
    color: colors.foregroundMuted,
    fontSize: 14,
  },
  gifList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  gifItem: {
    width: GIF_SIZE,
    height: GIF_SIZE,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.backgroundTertiary,
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    color: colors.foregroundMuted,
    fontSize: 10,
    letterSpacing: 1,
  },
})
