import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSupabase } from '../../contexts/SupabaseContext';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { colors } from '../../lib/theme';

function StatCard({ label, value, color = colors.foreground }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <FontAwesome name={icon as any} size={20} color={colors.foregroundMuted} style={styles.menuIcon} />
      <Text style={styles.menuLabel}>{label}</Text>
      <FontAwesome name="chevron-right" size={14} color={colors.foregroundMuted} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, isLoading, signOut } = useSupabase();
  const {
    isRegistered: notificationsEnabled,
    isLoading: notificationsLoading,
    registerForPushNotifications,
    unregister: unregisterNotifications,
    error: notificationError,
  } = usePushNotifications();

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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loginContainer}>
          <View style={styles.userIconBox}>
            <FontAwesome name="user" size={40} color={colors.neonPink} />
          </View>
          <Text style={styles.loginTitle}>SIGN IN</Text>
          <Text style={styles.loginSubtext}>
            Track your favorite teams, earn points, and join the conversation
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Logged in state
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.displayName}>{profile?.display_name || 'Anonymous User'}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {profile?.tier && (
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>{profile.tier.toUpperCase()}</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <StatCard label="POINTS" value={profile?.total_points || 0} color={colors.neonYellow} />
        <StatCard label="SUBMISSIONS" value={profile?.submission_count || 0} color={colors.neonBlue} />
        <StatCard
          label="ACCURACY"
          value={profile?.accuracy_rate ? `${(profile.accuracy_rate * 100).toFixed(0)}%` : 'N/A'}
          color={colors.neonGreen}
        />
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        <MenuButton icon="star" label="My Favorites" onPress={() => {}} />
        <MenuButton icon="trophy" label="My Badges" onPress={() => {}} />

        {/* Notifications Toggle */}
        <View style={styles.menuButton}>
          <FontAwesome name="bell" size={20} color={colors.foregroundMuted} style={styles.menuIcon} />
          <Text style={styles.menuLabel}>PUSH NOTIFICATIONS</Text>
          {notificationsLoading ? (
            <ActivityIndicator size="small" color={colors.neonPink} />
          ) : (
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.neonPink }}
              thumbColor={colors.foreground}
            />
          )}
        </View>

        <MenuButton icon="cog" label="Settings" onPress={() => {}} />
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    borderColor: colors.neonPink,
    backgroundColor: colors.backgroundSecondary,
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.foreground,
    letterSpacing: 4,
    marginBottom: 12,
  },
  loginSubtext: {
    fontSize: 14,
    color: colors.foregroundMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: colors.neonPink,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderWidth: 0,
  },
  loginButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neonPink,
    backgroundColor: colors.backgroundSecondary,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.neonPink,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.foreground,
    marginTop: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  email: {
    fontSize: 12,
    color: colors.foregroundMuted,
    marginTop: 4,
    letterSpacing: 1,
  },
  tierBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 2,
    borderColor: colors.neonYellow,
  },
  tierText: {
    color: colors.neonYellow,
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
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
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
    color: colors.foregroundMuted,
    marginTop: 4,
    letterSpacing: 1,
    fontWeight: '700',
  },
  menuSection: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 24,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
    fontWeight: '600',
    letterSpacing: 1,
  },
  signOutButton: {
    marginTop: 24,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.neonPink,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.neonPink,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
