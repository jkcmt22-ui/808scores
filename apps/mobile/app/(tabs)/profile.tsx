import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSupabase } from '../../contexts/SupabaseContext';

// Color palette
const colors = {
  background: '#0A0A0F',
  card: '#141419',
  cardBorder: '#2A2A35',
  primary: '#FF2A6D',
  secondary: '#00D4FF',
  yellow: '#FACC15',
  green: '#10B981',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
};

function StatCard({ label, value, color = colors.text }: { label: string; value: string | number; color?: string }) {
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
      <FontAwesome name={icon as any} size={20} color={colors.textMuted} style={styles.menuIcon} />
      <Text style={styles.menuLabel}>{label}</Text>
      <FontAwesome name="chevron-right" size={14} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, isLoading, signOut } = useSupabase();

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
      <View style={styles.container}>
        <View style={styles.loginContainer}>
          <FontAwesome name="user-circle" size={80} color={colors.textMuted} />
          <Text style={styles.loginTitle}>Sign in to 808scores</Text>
          <Text style={styles.loginSubtext}>
            Track your favorite teams, earn points, and join the conversation
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Logged in state
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
        <StatCard label="Points" value={profile?.total_points || 0} color={colors.yellow} />
        <StatCard label="Submissions" value={profile?.submission_count || 0} color={colors.secondary} />
        <StatCard
          label="Accuracy"
          value={profile?.accuracy_rate ? `${(profile.accuracy_rate * 100).toFixed(0)}%` : 'N/A'}
          color={colors.green}
        />
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        <MenuButton icon="star" label="My Favorites" onPress={() => {}} />
        <MenuButton icon="trophy" label="My Badges" onPress={() => {}} />
        <MenuButton icon="bell" label="Notifications" onPress={() => {}} />
        <MenuButton icon="cog" label="Settings" onPress={() => {}} />
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  loginSubtext: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  loginButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  email: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  tierBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tierText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  menuSection: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  menuIcon: {
    width: 24,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  signOutButton: {
    marginTop: 24,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
