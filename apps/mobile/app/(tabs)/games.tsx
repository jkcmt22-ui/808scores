import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { format, addDays, subDays } from 'date-fns';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useGames, type GameWithTeamsAndCount } from '../../hooks/useGames';
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

  const getAbbrev = (name: string) => name?.substring(0, 2).toUpperCase() || '??';

  return (
    <TouchableOpacity
      style={[styles.gameCard, isLive && styles.gameCardLive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.gameHeader}>
        <View style={styles.statusContainer}>
          {isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          {isFinal && <Text style={styles.finalText}>FINAL</Text>}
          {!isLive && !isFinal && <Text style={styles.timeText}>{formatTime(game.scheduled_at)}</Text>}
        </View>
        <Text style={styles.sportLabel}>
          {sportEmoji} {game.sport?.display_name || game.sport?.name}
        </Text>
      </View>

      <View style={styles.scoreboard}>
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
    </TouchableOpacity>
  );
}

export default function GamesScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const { games, isLoading, refetch } = useGames({ date: selectedDate });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleGamePress = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };

  const goToPreviousDay = () => setSelectedDate(prev => subDays(prev, 1));
  const goToNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const goToToday = () => setSelectedDate(new Date());

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={goToPreviousDay} style={styles.navButton}>
          <FontAwesome name="chevron-left" size={18} color={colors.foreground} />
        </TouchableOpacity>

        <TouchableOpacity onPress={goToToday} style={styles.dateContainer}>
          <Text style={styles.dateText}>{format(selectedDate, 'EEE, MMM d').toUpperCase()}</Text>
          {!isToday && <Text style={styles.todayHint}>TAP FOR TODAY</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={goToNextDay} style={styles.navButton}>
          <FontAwesome name="chevron-right" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {isLoading && games.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.neonPink} />
          <Text style={styles.loadingText}>LOADING GAMES...</Text>
        </View>
      ) : games.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyBox}>
            <Text style={styles.emptyScore}>--</Text>
          </View>
          <Text style={styles.emptyText}>NO GAMES</Text>
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
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neonYellow,
    letterSpacing: 2,
  },
  todayHint: {
    fontSize: 10,
    color: colors.neonBlue,
    marginTop: 4,
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.foregroundMuted,
    marginTop: 12,
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
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
