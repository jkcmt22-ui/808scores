import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { format, addDays, subDays } from 'date-fns';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useGames, type GameWithTeamsAndCount } from '../../hooks/useGames';
import { useSports } from '../../hooks/useSports';
import { getSportEmoji } from '@808scores/shared';

// Color palette
const colors = {
  background: '#0A0A0F',
  card: '#141419',
  cardBorder: '#2A2A35',
  primary: '#FF2A6D',
  secondary: '#00D4FF',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  green: '#10B981',
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
        {isFinal && <Text style={styles.finalText}>FINAL</Text>}
        {!isLive && !isFinal && <Text style={styles.timeText}>{formatTime(game.scheduled_at)}</Text>}
      </View>

      <View style={styles.teamsContainer}>
        <View style={styles.teamRow}>
          <Text style={[styles.teamName, isFinal && game.away_score > game.home_score && styles.winnerTeam]}>
            {game.away_team?.short_name || game.away_team?.name}
          </Text>
          <Text style={[styles.score, isFinal && game.away_score > game.home_score && styles.winnerScore]}>
            {game.away_score}
          </Text>
        </View>
        <View style={styles.teamRow}>
          <Text style={[styles.teamName, isFinal && game.home_score > game.away_score && styles.winnerTeam]}>
            {game.home_team?.short_name || game.home_team?.name}
          </Text>
          <Text style={[styles.score, isFinal && game.home_score > game.away_score && styles.winnerScore]}>
            {game.home_score}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function GamesScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const { games, isLoading, refetch } = useGames({ date: selectedDate });
  const { sports } = useSports();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleGamePress = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };

  const goToPreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <View style={styles.container}>
      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={goToPreviousDay} style={styles.navButton}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={goToToday} style={styles.dateContainer}>
          <Text style={styles.dateText}>{format(selectedDate, 'EEEE, MMM d')}</Text>
          {!isToday && <Text style={styles.todayHint}>Tap for today</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={goToNextDay} style={styles.navButton}>
          <FontAwesome name="chevron-right" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {isLoading && games.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading games...</Text>
        </View>
      ) : games.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No games scheduled</Text>
          <Text style={styles.emptySubtext}>Try selecting a different date</Text>
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GameCard game={item} onPress={() => handleGamePress(item.id)} />
          )}
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
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  navButton: {
    padding: 8,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  todayHint: {
    fontSize: 12,
    color: colors.secondary,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
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
