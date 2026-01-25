import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { SupabaseProvider } from '../contexts/SupabaseContext';

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
    <SupabaseProvider>
      <RootLayoutNav />
    </SupabaseProvider>
  );
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={customDarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="game/[id]" options={{ presentation: 'card', headerShown: true, title: 'Game Details' }} />
        <Stack.Screen name="school/[id]" options={{ presentation: 'card', headerShown: true, title: 'School' }} />
        <Stack.Screen name="login" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
