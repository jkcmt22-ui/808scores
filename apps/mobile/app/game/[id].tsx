import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { format } from 'date-fns';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useGame } from '../../hooks/useGames';
import { getSportEmoji } from '../../lib/sport-utils';
import { GameChat } from '../../components/GameChat';
import { colors } from '../../lib/theme';
import { useSupabase } from '../../contexts/SupabaseContext';

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { game, isLoading, error } = useGame(id || '');
  const { user } = useSupabase();
  const [showChat, setShowChat] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.neonPink} />
        <Text style={styles.loadingText}>LOADING GAME...</Text>
      </View>
    );
  }

  if (error || !game) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorBox}>
          <Text style={styles.errorScore}>!</Text>
        </View>
        <Text style={styles.errorText}>GAME NOT FOUND</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLive = game.status === 'in_progress';
  const isFinal = game.status === 'final';
  const isScheduled = game.status === 'scheduled';
  const sportEmoji = getSportEmoji(game.sport?.code || '');

  const getAbbrev = (name: string) => name?.substring(0, 2).toUpperCase() || '??';

  const formatGameTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEE, MMM d @ h:mm a').toUpperCase();
  };

  const handleSubmitScore = () => {
    router.push(`/submit/${id}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Status Banner */}
        {isLive && (
          <View style={styles.liveBanner}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBannerText}>LIVE</Text>
            {game.current_period && (
              <Text style={styles.periodText}>• {game.current_period}</Text>
            )}
          </View>
        )}

        {/* Scoreboard */}
        <View style={[styles.scoreboardCard, isLive && styles.scoreboardLive]}>
          {/* Sport Label */}
          <View style={styles.sportHeader}>
            <Text style={styles.sportLabel}>
              {sportEmoji} {game.sport?.display_name || game.sport?.name}
            </Text>
            {isFinal && <Text style={styles.finalBadge}>FINAL</Text>}
            {isScheduled && <Text style={styles.scheduledBadge}>{formatGameTime(game.scheduled_at)}</Text>}
          </View>

          {/* Away Team */}
          <View style={styles.teamRow}>
            <View style={[styles.teamAbbrevBox, styles.awayBox]}>
              <Text style={styles.teamAbbrev}>{getAbbrev(game.away_team?.short_name || game.away_team?.name)}</Text>
            </View>
            <View style={styles.teamInfo}>
              <Text style={[styles.teamName, isFinal && game.away_score > game.home_score && styles.winnerTeam]} numberOfLines={1}>
                {game.away_team?.name}
              </Text>
              <Text style={styles.teamMeta}>{game.away_team?.island}</Text>
            </View>
            <View style={[styles.scoreBox, isFinal && game.away_score > game.home_score && styles.scoreBoxWinner]}>
              <Text style={[styles.scoreText, isFinal && game.away_score > game.home_score && styles.winnerScore]}>
                {game.away_score}
              </Text>
            </View>
          </View>

          {/* Home Team */}
          <View style={styles.teamRow}>
            <View style={[styles.teamAbbrevBox, styles.homeBox]}>
              <Text style={styles.teamAbbrev}>{getAbbrev(game.home_team?.short_name || game.home_team?.name)}</Text>
            </View>
            <View style={styles.teamInfo}>
              <Text style={[styles.teamName, isFinal && game.home_score > game.away_score && styles.winnerTeam]} numberOfLines={1}>
                {game.home_team?.name}
              </Text>
              <Text style={styles.teamMeta}>{game.home_team?.island} • HOME</Text>
            </View>
            <View style={[styles.scoreBox, isFinal && game.home_score > game.away_score && styles.scoreBoxWinner]}>
              <Text style={[styles.scoreText, isFinal && game.home_score > game.away_score && styles.winnerScore]}>
                {game.home_score}
              </Text>
            </View>
          </View>

          {/* Game Info */}
          <View style={styles.gameInfo}>
            {!isScheduled && <Text style={styles.gameTime}>{formatGameTime(game.scheduled_at)}</Text>}
            {game.venue && <Text style={styles.venue}>{game.venue}</Text>}
          </View>
        </View>

        {/* Submit Score Button */}
        {!isFinal && (
          user ? (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitScore}>
              <FontAwesome name="plus-circle" size={20} color={colors.background} />
              <Text style={styles.submitButtonText}>SUBMIT SCORE</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.loginPromptButton} onPress={() => router.push('/login')}>
              <FontAwesome name="user" size={16} color={colors.neonBlue} />
              <Text style={styles.loginPromptText}>SIGN IN TO SUBMIT SCORES</Text>
            </TouchableOpacity>
          )
        )}

        {/* Chat Section */}
        <TouchableOpacity
          style={styles.chatSection}
          onPress={() => setShowChat(true)}
          activeOpacity={0.8}
        >
          <View style={styles.chatHeader}>
            <FontAwesome name="comments" size={18} color={colors.neonBlue} />
            <Text style={styles.chatTitle}>GAME CHAT</Text>
            <Text style={styles.chatCount}>{game.message_count}</Text>
            <FontAwesome name="chevron-right" size={14} color={colors.foregroundMuted} />
          </View>
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome name="bell-o" size={16} color={colors.neonYellow} />
            <Text style={styles.actionButtonText}>REMINDER</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome name="share-alt" size={16} color={colors.neonBlue} />
            <Text style={styles.actionButtonText}>SHARE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Full Screen Chat */}
      {showChat && (
        <View style={styles.chatFullScreen}>
          <View style={styles.chatFullHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowChat(false)}>
              <FontAwesome name="chevron-down" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={styles.chatFullTitle}>GAME CHAT</Text>
            <View style={styles.closeButton} />
          </View>
          <GameChat gameId={id || ''} />
        </View>
      )}
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
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.foregroundMuted,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 32,
  },
  errorBox: {
    width: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: colors.neonPink,
    marginBottom: 16,
  },
  errorScore: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.neonPink,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.neonBlue,
    backgroundColor: colors.backgroundSecondary,
  },
  backButtonText: {
    color: colors.neonBlue,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 42, 109, 0.15)',
    borderWidth: 2,
    borderColor: colors.neonPink,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.neonPink,
  },
  liveBannerText: {
    color: colors.neonPink,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
  },
  periodText: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: '600',
  },
  scoreboardCard: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  scoreboardLive: {
    borderColor: colors.neonPink,
    shadowColor: colors.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  sportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sportLabel: {
    fontSize: 12,
    color: colors.foregroundMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  finalBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.foregroundMuted,
    letterSpacing: 2,
  },
  scheduledBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neonYellow,
    letterSpacing: 1,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  teamAbbrevBox: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: colors.backgroundTertiary,
  },
  awayBox: {
    borderColor: colors.neonBlue,
  },
  homeBox: {
    borderColor: colors.neonPink,
  },
  teamAbbrev: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.foreground,
    letterSpacing: 1,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    color: colors.foreground,
    fontWeight: '600',
  },
  winnerTeam: {
    fontWeight: '800',
  },
  teamMeta: {
    fontSize: 11,
    color: colors.foregroundMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreBox: {
    minWidth: 60,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  scoreBoxWinner: {
    backgroundColor: '#0a1a0a',
    borderColor: '#1a3a1a',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.foreground,
    fontVariant: ['tabular-nums'],
  },
  winnerScore: {
    color: colors.neonGreen,
  },
  gameInfo: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  gameTime: {
    fontSize: 12,
    color: colors.foregroundMuted,
    letterSpacing: 1,
  },
  venue: {
    fontSize: 12,
    color: colors.foregroundMuted,
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.neonPink,
    paddingVertical: 14,
    marginBottom: 16,
  },
  submitButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  loginPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.neonBlue,
    paddingVertical: 14,
    marginBottom: 16,
  },
  loginPromptText: {
    color: colors.neonBlue,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  chatSection: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  chatTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.foreground,
    flex: 1,
    letterSpacing: 1,
  },
  chatCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neonBlue,
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
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 14,
  },
  actionButtonText: {
    color: colors.foreground,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  chatFullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
  },
  chatFullHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatFullTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: 2,
  },
});
