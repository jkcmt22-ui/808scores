import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { SupabaseProvider } from '../contexts/SupabaseContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Custom dark theme for 808scores (neon aesthetic)
const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#FF2A6D', // Neon pink
    background: '#0A0A0F', // Dark background
    card: '#141419', // Card background
    text: '#FFFFFF',
    border: '#2A2A35',
    notification: '#FF2A6D',
  },
};

// Custom light theme for 808scores
const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#d91a5a', // Darker pink for light mode
    background: '#f5f0fa', // Light background
    card: '#ffffff', // Card background
    text: '#1a1a2e',
    border: '#d0c8e0',
    notification: '#d91a5a',
  },
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <SupabaseProvider>
        <RootLayoutNav />
      </SupabaseProvider>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { isDark } = useTheme();
  const navigationTheme = isDark ? customDarkTheme : customLightTheme;

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="game/[id]" options={{ presentation: 'card', headerShown: true, title: 'Game Details' }} />
        <Stack.Screen name="school/[id]" options={{ presentation: 'card', headerShown: true, title: 'School' }} />
        <Stack.Screen name="login" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
