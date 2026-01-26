import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useTheme } from '../../contexts/ThemeContext';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { colors as defaultColors } from '../../lib/theme';

function StatCard({ label, value, color, colors }: { label: string; value: string | number; color: string; colors: typeof defaultColors }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.foregroundMuted }]}>{label}</Text>
    </View>
  );
}

function MenuButton({ icon, label, onPress, colors }: { icon: string; label: string; onPress: () => void; colors: typeof defaultColors }) {
  return (
    <TouchableOpacity
      style={[styles.menuButton, { borderBottomColor: colors.border }]}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <FontAwesome name={icon as any} size={20} color={colors.foregroundMuted} style={styles.menuIcon} />
      <Text style={[styles.menuLabel, { color: colors.foreground }]}>{label}</Text>
      <FontAwesome name="chevron-right" size={14} color={colors.foregroundMuted} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, isLoading, signOut } = useSupabase();
  const { theme, setTheme, colors, isDark } = useTheme();
  const {
    isRegistered: notificationsEnabled,
    isLoading: notificationsLoading,
    registerForPushNotifications,
    unregister: unregisterNotifications,
    error: notificationError,
  } = usePushNotifications();

  const handleThemeToggle = () => {
    // Cycle through: dark -> light -> system -> dark
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'dark': return 'DARK';
      case 'light': return 'LIGHT';
      case 'system': return 'SYSTEM';
    }
  };

  const handleNotificationToggle = async () => {
    if (notificationsEnabled) {
      await unregisterNotifications();
    } else {
      const success = await registerForPushNotifications();
      if (!success && notificationError) {
        Alert.alert('Notifications', notificationError);
      }
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/login');
  };

  // Not logged in state
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loginContainer}>
          <View style={[styles.userIconBox, { borderColor: colors.neonPink, backgroundColor: colors.backgroundSecondary }]}>
            <FontAwesome name="user" size={40} color={colors.neonPink} />
          </View>
          <Text style={[styles.loginTitle, { color: colors.foreground }]}>SIGN IN</Text>
          <Text style={[styles.loginSubtext, { color: colors.foregroundMuted }]}>
            Track your favorite teams, earn points, and join the conversation
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.neonPink }]}
            onPress={handleLogin}
            accessibilityLabel="Sign in"
            accessibilityRole="button"
          >
            <Text style={[styles.loginButtonText, { color: colors.background }]}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Logged in state
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header */}
      <View style={[styles.profileHeader, { borderBottomColor: colors.border }]}>
        <View style={[styles.avatar, { borderColor: colors.neonPink, backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.avatarText, { color: colors.neonPink }]}>
            {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={[styles.displayName, { color: colors.foreground }]}>{profile?.display_name || 'Anonymous User'}</Text>
        <Text style={[styles.email, { color: colors.foregroundMuted }]}>{user.email}</Text>
        {profile?.tier && (
          <View style={[styles.tierBadge, { backgroundColor: colors.backgroundTertiary, borderColor: colors.neonYellow }]}>
            <Text style={[styles.tierText, { color: colors.neonYellow }]}>{profile.tier.toUpperCase()}</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        <StatCard label="POINTS" value={profile?.total_points || 0} color={colors.neonYellow} colors={colors} />
        <StatCard label="SUBMISSIONS" value={profile?.submission_count || 0} color={colors.neonBlue} colors={colors} />
        <StatCard
          label="ACCURACY"
          value={profile?.accuracy_rate ? `${(profile.accuracy_rate * 100).toFixed(0)}%` : 'N/A'}
          color={colors.neonGreen}
          colors={colors}
        />
      </View>

      {/* Menu */}
      <View style={[styles.menuSection, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        <MenuButton icon="star" label="My Favorites" onPress={() => {}} colors={colors} />
        <MenuButton icon="trophy" label="My Badges" onPress={() => {}} colors={colors} />

        {/* Theme Toggle */}
        <TouchableOpacity
          style={[styles.menuButton, { borderBottomColor: colors.border }]}
          onPress={handleThemeToggle}
          accessibilityLabel={`Theme: ${getThemeLabel()}. Tap to change.`}
          accessibilityRole="button"
        >
          <FontAwesome
            name={isDark ? 'moon-o' : 'sun-o'}
            size={20}
            color={colors.foregroundMuted}
            style={styles.menuIcon}
          />
          <Text style={[styles.menuLabel, { color: colors.foreground }]}>APPEARANCE</Text>
          <View style={[styles.themeBadge, { backgroundColor: colors.backgroundTertiary, borderColor: colors.neonBlue }]}>
            <Text style={[styles.themeBadgeText, { color: colors.neonBlue }]}>{getThemeLabel()}</Text>
          </View>
        </TouchableOpacity>

        {/* Notifications Toggle */}
        <View style={[styles.menuButton, { borderBottomColor: colors.border }]}>
          <FontAwesome name="bell" size={20} color={colors.foregroundMuted} style={styles.menuIcon} />
          <Text style={[styles.menuLabel, { color: colors.foreground }]}>PUSH NOTIFICATIONS</Text>
          {notificationsLoading ? (
            <ActivityIndicator size="small" color={colors.neonPink} />
          ) : (
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.neonPink }}
              thumbColor={colors.foreground}
              accessibilityLabel={`Push notifications ${notificationsEnabled ? 'enabled' : 'disabled'}`}
              accessibilityRole="switch"
            />
          )}
        </View>

        <MenuButton icon="cog" label="Settings" onPress={() => {}} colors={colors} />
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={[styles.signOutButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.neonPink }]}
        onPress={handleSignOut}
        accessibilityLabel="Sign out"
        accessibilityRole="button"
      >
        <Text style={[styles.signOutText, { color: colors.neonPink }]}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  userIconBox: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 12,
  },
  loginSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  loginButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderWidth: 0,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
  },
  displayName: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  email: {
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 1,
  },
  tierBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 2,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 1,
    fontWeight: '700',
  },
  menuSection: {
    marginTop: 24,
    marginHorizontal: 16,
    borderWidth: 2,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 24,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  signOutButton: {
    marginTop: 24,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  themeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  themeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
