import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { format } from 'date-fns';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useGame } from '../../hooks/useGames';
import { getSportEmoji } from '@808scores/shared';

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
  live: '#EF4444',
};

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { game, isLoading, error } = useGame(id || '');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  if (error || !game) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Game not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLive = game.status === 'in_progress';
  const isFinal = game.status === 'final';
  const sportEmoji = getSportEmoji(game.sport?.code || '');

  const formatGameTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEEE, MMM d @ h:mm a');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: game.sport?.display_name || game.sport?.name || 'Game',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Game Status Banner */}
        {isLive && (
          <View style={styles.liveBanner}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBannerText}>LIVE</Text>
            {game.current_period && (
              <Text style={styles.periodText}>{game.current_period}</Text>
            )}
          </View>
        )}

        {/* Scoreboard */}
        <View style={styles.scoreboardCard}>
          <Text style={styles.sportLabel}>
            {sportEmoji} {game.sport?.display_name || game.sport?.name}
          </Text>

          {/* Away Team */}
          <View style={styles.teamScoreRow}>
            <TouchableOpacity
              style={styles.teamInfo}
              onPress={() => router.push(`/school/${game.away_team_id}`)}
            >
              <Text style={[styles.teamName, isFinal && game.away_score > game.home_score && styles.winnerText]}>
                {game.away_team?.name}
              </Text>
              <Text style={styles.teamMeta}>{game.away_team?.island}</Text>
            </TouchableOpacity>
            <Text style={[styles.scoreText, isFinal && game.away_score > game.home_score && styles.winnerScore]}>
              {game.away_score}
            </Text>
          </View>

          {/* Home Team */}
          <View style={styles.teamScoreRow}>
            <TouchableOpacity
              style={styles.teamInfo}
              onPress={() => router.push(`/school/${game.home_team_id}`)}
            >
              <Text style={[styles.teamName, isFinal && game.home_score > game.away_score && styles.winnerText]}>
                {game.home_team?.name}
              </Text>
              <Text style={styles.teamMeta}>{game.home_team?.island} (Home)</Text>
            </TouchableOpacity>
            <Text style={[styles.scoreText, isFinal && game.home_score > game.away_score && styles.winnerScore]}>
              {game.home_score}
            </Text>
          </View>

          {/* Game Info */}
          <View style={styles.gameInfo}>
            <Text style={styles.gameTime}>{formatGameTime(game.scheduled_at)}</Text>
            {game.venue && <Text style={styles.venue}>{game.venue}</Text>}
          </View>

          {isFinal && (
            <View style={styles.finalBadge}>
              <Text style={styles.finalBadgeText}>FINAL</Text>
            </View>
          )}
        </View>

        {/* Chat Section Placeholder */}
        <View style={styles.chatSection}>
          <View style={styles.chatHeader}>
            <FontAwesome name="comments" size={20} color={colors.secondary} />
            <Text style={styles.chatTitle}>Game Chat</Text>
            <Text style={styles.chatCount}>{game.message_count} messages</Text>
          </View>
          <View style={styles.chatPlaceholder}>
            <Text style={styles.chatPlaceholderText}>
              Chat functionality coming soon!
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome name="bell" size={16} color={colors.text} />
            <Text style={styles.actionButtonText}>Set Reminder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome name="share" size={16} color={colors.text} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.live,
  },
  liveBannerText: {
    color: colors.live,
    fontWeight: '700',
    fontSize: 14,
  },
  periodText: {
    color: colors.text,
    fontSize: 14,
  },
  scoreboardCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    marginBottom: 16,
  },
  sportLabel: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  teamScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '500',
  },
  winnerText: {
    fontWeight: '700',
    color: colors.text,
  },
  teamMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    minWidth: 60,
    textAlign: 'right',
  },
  winnerScore: {
    color: colors.green,
  },
  gameInfo: {
    paddingTop: 16,
    alignItems: 'center',
  },
  gameTime: {
    fontSize: 14,
    color: colors.textMuted,
  },
  venue: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  finalBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  finalBadgeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  chatSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: 8,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  chatCount: {
    fontSize: 14,
    color: colors.textMuted,
  },
  chatPlaceholder: {
    padding: 32,
    alignItems: 'center',
  },
  chatPlaceholderText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 14,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
