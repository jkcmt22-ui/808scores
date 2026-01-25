import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useStandings, useStandingsSports, type LeagueStandings } from '../../hooks/useStandings';
import { colors } from '../../lib/theme';
import { getSportEmoji } from '../../lib/sport-utils';

function SportSelector({
  sports,
  selectedSport,
  onSelect,
}: {
  sports: Array<{ id: string; name: string; code: string; display_name: string | null }>;
  selectedSport: string | null;
  onSelect: (code: string | null) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.sportSelectorContent}
      style={styles.sportSelector}
    >
      <TouchableOpacity
        style={[styles.sportChip, !selectedSport && styles.sportChipActive]}
        onPress={() => onSelect(null)}
      >
        <Text style={[styles.sportChipText, !selectedSport && styles.sportChipTextActive]}>
          ALL
        </Text>
      </TouchableOpacity>
      {sports.map((sport) => (
        <TouchableOpacity
          key={sport.id}
          style={[styles.sportChip, selectedSport === sport.code && styles.sportChipActive]}
          onPress={() => onSelect(sport.code)}
        >
          <Text style={[styles.sportChipText, selectedSport === sport.code && styles.sportChipTextActive]}>
            {getSportEmoji(sport.code)} {(sport.display_name || sport.name).toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function StandingsTable({ leagueStandings }: { leagueStandings: LeagueStandings }) {
  return (
    <View style={styles.leagueContainer}>
      <View style={styles.leagueHeader}>
        <Text style={styles.leagueName}>{leagueStandings.displayName}</Text>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.rankCell]}>#</Text>
        <Text style={[styles.headerCell, styles.teamCell]}>TEAM</Text>
        <Text style={[styles.headerCell, styles.statCell]}>W</Text>
        <Text style={[styles.headerCell, styles.statCell]}>L</Text>
        <Text style={[styles.headerCell, styles.pctCell]}>PCT</Text>
      </View>

      {/* Table Rows */}
      {leagueStandings.teams.map((team, index) => (
        <View
          key={team.school.id}
          style={[styles.tableRow, index < 2 && styles.topTeamRow]}
        >
          <Text style={[styles.cell, styles.rankCell, styles.rankText]}>
            {index + 1}
          </Text>
          <View style={[styles.teamCell, styles.teamCellContent]}>
            <Text style={styles.teamName} numberOfLines={1}>
              {team.school.short_name || team.school.name}
            </Text>
          </View>
          <Text style={[styles.cell, styles.statCell]}>{team.wins}</Text>
          <Text style={[styles.cell, styles.statCell]}>{team.losses}</Text>
          <Text style={[styles.cell, styles.pctCell]}>
            {team.winPct.toFixed(3).replace('0.', '.')}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function StandingsScreen() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { sports, isLoading: sportsLoading } = useStandingsSports();
  const { standings, isLoading, error, refetch } = useStandings({
    sportCode: selectedSport || undefined,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  }, [refetch]);

  if (sportsLoading || (isLoading && standings.length === 0)) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={colors.neonPink} />
        <Text style={styles.loadingText}>LOADING STANDINGS...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>► STANDINGS</Text>
      </View>

      {/* Sport Selector */}
      {sports.length > 0 && (
        <SportSelector
          sports={sports}
          selectedSport={selectedSport}
          onSelect={setSelectedSport}
        />
      )}

      {/* Content */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>ERROR LOADING STANDINGS</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : standings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyBox}>
            <Text style={styles.emptyScore}>--</Text>
          </View>
          <Text style={styles.emptyText}>NO STANDINGS DATA</Text>
          <Text style={styles.emptySubtext}>
            {selectedSport
              ? 'No standings available for this sport'
              : 'Select a sport to view standings'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.neonPink}
            />
          }
        >
          {standings.map((leagueStandings) => (
            <StandingsTable key={leagueStandings.league} leagueStandings={leagueStandings} />
          ))}
        </ScrollView>
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
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.neonPink,
    textTransform: 'uppercase',
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
  sportSelector: {
    maxHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sportSelectorContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  sportChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    marginRight: 6,
  },
  sportChipActive: {
    borderColor: colors.neonBlue,
    backgroundColor: 'rgba(5, 217, 232, 0.15)',
  },
  sportChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.foregroundMuted,
    letterSpacing: 0.5,
  },
  sportChipTextActive: {
    color: colors.neonBlue,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  leagueContainer: {
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  leagueHeader: {
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundTertiary,
  },
  leagueName: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.neonPink,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundTertiary,
  },
  headerCell: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.foregroundMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topTeamRow: {
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
  },
  cell: {
    fontSize: 13,
    color: colors.foreground,
    fontVariant: ['tabular-nums'],
  },
  rankCell: {
    width: 28,
  },
  rankText: {
    color: colors.neonYellow,
    fontWeight: '700',
  },
  teamCell: {
    flex: 1,
  },
  teamCellContent: {
    flex: 1,
    justifyContent: 'center',
  },
  teamName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
  },
  statCell: {
    width: 36,
    textAlign: 'center',
  },
  pctCell: {
    width: 50,
    textAlign: 'right',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neonPink,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.neonBlue,
    backgroundColor: colors.backgroundSecondary,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neonBlue,
    textTransform: 'uppercase',
    letterSpacing: 2,
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
