import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { GeneralChat } from '../../components/GeneralChat';
import { colors } from '../../lib/theme';

export default function CommunityScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <FontAwesome name="comments" size={20} color={colors.neonBlue} />
          <Text style={styles.headerTitle}>COMMUNITY</Text>
        </View>
        <Text style={styles.headerSubtitle}>Hawaii High School Sports Talk</Text>
      </View>

      {/* Chat */}
      <GeneralChat />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.foreground,
    letterSpacing: 3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.foregroundMuted,
    marginTop: 4,
    letterSpacing: 1,
  },
});
