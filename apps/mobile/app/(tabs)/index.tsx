import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useGames, useLiveGames, type GameWithTeamsAndCount } from '../../hooks/useGames';
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

function GameCard({ game, onPress }: { game: GameWithTeamsAndCount; onPress: () => void }) {
  const isLive = game.status === 'in_progress';
  const isFinal = game.status === 'final';
  const sportEmoji = getSportEmoji(game.sport?.code || '');

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'h:mm a');
  };

  return (
    <TouchableOpacity style={styles.gameCard} onPress={onPress} activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.gameHeader}>
        <Text style={styles.sportLabel}>
          {sportEmoji} {game.sport?.display_name || game.sport?.name}
        </Text>
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

      {/* Teams */}
      <View style={styles.teamsContainer}>
        {/* Away Team */}
        <View style={styles.teamRow}>
          <Text style={[styles.teamName, game.status === 'final' && game.away_score > game.home_score && styles.winnerTeam]}>
            {game.away_team?.short_name || game.away_team?.name}
          </Text>
          <Text style={[styles.score, game.status === 'final' && game.away_score > game.home_score && styles.winnerScore]}>
            {game.away_score}
          </Text>
        </View>

        {/* Home Team */}
        <View style={styles.teamRow}>
          <Text style={[styles.teamName, game.status === 'final' && game.home_score > game.away_score && styles.winnerTeam]}>
            {game.home_team?.short_name || game.home_team?.name}
          </Text>
          <Text style={[styles.score, game.status === 'final' && game.home_score > game.away_score && styles.winnerScore]}>
            {game.home_score}
          </Text>
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

  // Get today's games
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

  // Separate games by status
  const upcomingGames = games.filter(g => g.status === 'scheduled');
  const finalGames = games.filter(g => g.status === 'final');

  if (isLoading && games.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading games...</Text>
      </View>
    );
  }

  // Combine sections
  const sections = [];

  if (liveGames.length > 0) {
    sections.push({ title: 'Live Now', data: liveGames });
  }
  if (upcomingGames.length > 0) {
    sections.push({ title: 'Upcoming', data: upcomingGames });
  }
  if (finalGames.length > 0) {
    sections.push({ title: 'Final', data: finalGames });
  }

  // Flatten for FlatList
  type ListItem = GameWithTeamsAndCount | { type: 'header'; title: string };
  const flatData: ListItem[] = [];
  sections.forEach(section => {
    flatData.push({ type: 'header', title: section.title });
    flatData.push(...section.data);
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>808scores</Text>
        <Text style={styles.headerSubtitle}>{format(today, 'EEEE, MMMM d')}</Text>
      </View>

      {games.length === 0 && liveGames.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No games scheduled for today</Text>
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
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  gameCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    marginBottom: 12,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sportLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.live,
    marginRight: 4,
  },
  liveText: {
    color: colors.live,
    fontSize: 11,
    fontWeight: '600',
  },
  finalText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  teamsContainer: {
    gap: 4,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  teamName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  winnerTeam: {
    fontWeight: '600',
  },
  score: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    minWidth: 40,
    textAlign: 'right',
  },
  winnerScore: {
    color: colors.green,
  },
  gameFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  messageCount: {
    fontSize: 12,
    color: colors.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
