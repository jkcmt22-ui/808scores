import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useGames, useLiveGames, type GameWithTeamsAndCount } from '../../hooks/useGames';
import { getSportEmoji } from '../../lib/sport-utils';
import { colors } from '../../lib/theme';

function GameCard({ game, onPress }: { game: GameWithTeamsAndCount; onPress: () => void }) {
  const isLive = game.status === 'in_progress';
  const isFinal = game.status === 'final';
  const sportEmoji = getSportEmoji(game.sport?.code || '');

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'h:mm a');
  };

  // Get 2-letter abbreviation
  const getAbbrev = (name: string) => {
    return name?.substring(0, 2).toUpperCase() || '??';
  };

  const statusText = isLive ? 'Live' : isFinal ? 'Final' : 'Scheduled';
  const gameLabel = `${game.away_team?.short_name || game.away_team?.name} ${game.away_score} at ${game.home_team?.short_name || game.home_team?.name} ${game.home_score}, ${statusText}`;

  return (
    <TouchableOpacity
      style={[styles.gameCard, isLive && styles.gameCardLive]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={gameLabel}
      accessibilityRole="button"
      accessibilityHint="View game details"
    >
      {/* Header */}
      <View style={styles.gameHeader}>
        <View style={styles.statusContainer}>
          {isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          {isFinal && (
            <Text style={styles.finalText}>FINAL</Text>
          )}
          {!isLive && !isFinal && (
            <Text style={styles.timeText}>{formatTime(game.scheduled_at)}</Text>
          )}
        </View>
        <Text style={styles.sportLabel}>
          {sportEmoji} {game.sport?.display_name || game.sport?.name}
        </Text>
      </View>

      {/* Scoreboard */}
      <View style={styles.scoreboard}>
        {/* Away Team */}
        <View style={styles.teamRow}>
          <View style={[styles.teamAbbrevBox, styles.awayBox]}>
            <Text style={styles.teamAbbrev}>{getAbbrev(game.away_team?.short_name || game.away_team?.name)}</Text>
          </View>
          <Text style={[styles.teamName, isFinal && game.away_score > game.home_score && styles.winnerTeam]} numberOfLines={1}>
            {game.away_team?.short_name || game.away_team?.name}
          </Text>
          <View style={[styles.scoreBox, isFinal && game.away_score > game.home_score && styles.scoreBoxWinner]}>
            <Text style={[styles.score, isFinal && game.away_score > game.home_score && styles.winnerScore]}>
              {game.away_score}
            </Text>
          </View>
        </View>

        {/* Home Team */}
        <View style={styles.teamRow}>
          <View style={[styles.teamAbbrevBox, styles.homeBox]}>
            <Text style={styles.teamAbbrev}>{getAbbrev(game.home_team?.short_name || game.home_team?.name)}</Text>
          </View>
          <Text style={[styles.teamName, isFinal && game.home_score > game.away_score && styles.winnerTeam]} numberOfLines={1}>
            {game.home_team?.short_name || game.home_team?.name}
          </Text>
          <View style={[styles.scoreBox, isFinal && game.home_score > game.away_score && styles.scoreBoxWinner]}>
            <Text style={[styles.score, isFinal && game.home_score > game.away_score && styles.winnerScore]}>
              {game.home_score}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      {game.message_count > 0 && (
        <View style={styles.gameFooter}>
          <Text style={styles.messageCount}>{game.message_count} comments</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();
  const { games, isLoading, refetch } = useGames({ date: today });
  const { games: liveGames } = useLiveGames();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleGamePress = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };

  const upcomingGames = games.filter(g => g.status === 'scheduled');
  const finalGames = games.filter(g => g.status === 'final');

  if (isLoading && games.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={colors.neonPink} />
        <Text style={styles.loadingText}>Loading games...</Text>
      </SafeAreaView>
    );
  }

  const sections = [];
  if (liveGames.length > 0) {
    sections.push({ title: '► LIVE NOW', data: liveGames });
  }
  if (upcomingGames.length > 0) {
    sections.push({ title: '► UPCOMING', data: upcomingGames });
  }
  if (finalGames.length > 0) {
    sections.push({ title: '► FINAL', data: finalGames });
  }

  type ListItem = GameWithTeamsAndCount | { type: 'header'; title: string };
  const flatData: ListItem[] = [];
  sections.forEach(section => {
    flatData.push({ type: 'header', title: section.title });
    flatData.push(...section.data);
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with neon branding */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandHawaii}>Hawaii</Text>
          <Text style={styles.brandSports}>Sports</Text>
          <Text style={styles.brandCenter}>Center</Text>
        </View>
        <Text style={styles.headerSubtitle}>{format(today, 'EEEE, MMMM d').toUpperCase()}</Text>
      </View>

      {games.length === 0 && liveGames.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyBox}>
            <Text style={styles.emptyScore}>--</Text>
          </View>
          <Text style={styles.emptyText}>NO GAMES TODAY</Text>
          <Text style={styles.emptySubtext}>Check back later or browse all games</Text>
        </View>
      ) : (
        <FlatList
          data={flatData}
          keyExtractor={(item, index) => 'type' in item ? `header-${item.title}` : item.id}
          renderItem={({ item }) => {
            if ('type' in item && item.type === 'header') {
              return <SectionHeader title={item.title} />;
            }
            return <GameCard game={item as GameWithTeamsAndCount} onPress={() => handleGamePress((item as GameWithTeamsAndCount).id)} />;
          }}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.neonPink}
            />
          }
        />
      )}
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
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  brandHawaii: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.neonPink,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  brandSports: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.neonBlue,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  brandCenter: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.neonYellow,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.neonYellow,
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 2,
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neonPink,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  gameCard: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
  },
  gameCardLive: {
    borderColor: colors.neonPink,
    shadowColor: colors.neonPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportLabel: {
    fontSize: 11,
    color: colors.foregroundMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neonPink,
  },
  liveText: {
    color: colors.neonPink,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  finalText: {
    color: colors.foregroundMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  timeText: {
    color: colors.neonYellow,
    fontSize: 12,
    fontWeight: '600',
  },
  scoreboard: {
    gap: 8,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teamAbbrevBox: {
    width: 36,
    height: 36,
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
    fontSize: 12,
    fontWeight: '900',
    color: colors.foreground,
    letterSpacing: 1,
  },
  teamName: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
    fontWeight: '500',
  },
  winnerTeam: {
    fontWeight: '800',
  },
  scoreBox: {
    minWidth: 50,
    height: 36,
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
  score: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.foreground,
    fontVariant: ['tabular-nums'],
  },
  winnerScore: {
    color: colors.neonGreen,
  },
  gameFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  messageCount: {
    fontSize: 11,
    color: colors.neonBlue,
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyBox: {
    width: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#3a3a3a',
    marginBottom: 16,
  },
  emptyScore: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.foregroundMuted,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.foreground,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.foregroundMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
