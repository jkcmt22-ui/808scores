import React, { createContext, useContext, useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { darkColors, lightColors, ThemeColors } from '../lib/theme'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: ThemeMode
  resolvedTheme: 'light' | 'dark'
  colors: ThemeColors
  setTheme: (theme: ThemeMode) => void
  isDark: boolean
}

const THEME_STORAGE_KEY = '@808scores_theme'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme()
  const [theme, setThemeState] = useState<ThemeMode>('system')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved theme preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedTheme) => {
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme as ThemeMode)
      }
      setIsLoaded(true)
    })
  }, [])

  // Determine the resolved theme based on user preference and system
  const resolvedTheme: 'light' | 'dark' =
    theme === 'system'
      ? (systemColorScheme ?? 'dark')
      : theme

  const isDark = resolvedTheme === 'dark'
  const colors = isDark ? darkColors : lightColors

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme)
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }

  // Don't render until we've loaded the saved theme
  if (!isLoaded) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, colors, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
