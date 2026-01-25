import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useMemo } from 'react';
import { useStandings, useStandingsSports, type LeagueStandings } from '../../hooks/useStandings';
import { colors } from '../../lib/theme';
import { getSportEmoji } from '../../lib/sport-utils';

// Season configuration
const SEASON_ORDER = ['fall', 'winter', 'spring'] as const;
const SEASON_LABELS: Record<string, string> = {
  fall: 'FALL 2025',
  winter: 'WINTER 2025-26',
  spring: 'SPRING 2025',
};

type SportType = { id: string; name: string; code: string; display_name: string | null; season?: string | null };

function SportPicker({
  sports,
  selectedSport,
  onSelect,
}: {
  sports: SportType[];
  selectedSport: string | null;
  onSelect: (code: string | null) => void;
}) {
  const [modalVisible, setModalVisible] = useState(false);

  // Group sports by season
  const sportsBySeason = useMemo(() => {
    const grouped = new Map<string, SportType[]>();

    for (const season of SEASON_ORDER) {
      grouped.set(season, []);
    }

    const seen = new Set<string>();
    for (const sport of sports) {
      if (seen.has(sport.code)) continue;
      seen.add(sport.code);

      const season = sport.season || 'other';
      if (!grouped.has(season)) {
        grouped.set(season, []);
      }
      grouped.get(season)!.push(sport);
    }

    return grouped;
  }, [sports]);

  const selectedSportObj = sports.find(s => s.code === selectedSport);
  const displayText = selectedSportObj
    ? `${getSportEmoji(selectedSportObj.code)} ${(selectedSportObj.display_name || selectedSportObj.name).toUpperCase()}`
    : 'SELECT SPORT';

  return (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>SELECT SPORT</Text>
      <TouchableOpacity
        style={[styles.pickerButton, styles.pickerButtonActive]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.pickerButtonText, styles.pickerButtonTextActive]}>
          {displayText}
        </Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECT SPORT</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Grouped by season */}
              {SEASON_ORDER.map(season => {
                const seasonSports = sportsBySeason.get(season) || [];
                if (seasonSports.length === 0) return null;

                return (
                  <View key={season}>
                    <Text style={styles.seasonHeader}>{SEASON_LABELS[season]}</Text>
                    {seasonSports.map(sport => (
                      <TouchableOpacity
                        key={sport.code}
                        style={[styles.modalOption, selectedSport === sport.code && styles.modalOptionActive]}
                        onPress={() => {
                          onSelect(sport.code);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={[styles.modalOptionText, selectedSport === sport.code && styles.modalOptionTextActive]}>
                          {getSportEmoji(sport.code)} {(sport.display_name || sport.name).toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
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

  // Get unique sports list (deduplicated by code)
  const uniqueSports = useMemo(() => {
    const seen = new Set<string>();
    return sports.filter(s => {
      if (seen.has(s.code)) return false;
      seen.add(s.code);
      return true;
    });
  }, [sports]);

  // Default to first sport if none selected
  const effectiveSportCode = selectedSport || uniqueSports[0]?.code || null;

  const { standings, isLoading, error, refetch } = useStandings({
    sportCode: effectiveSportCode || undefined,
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

      {/* Sport Picker */}
      {uniqueSports.length > 0 && (
        <SportPicker
          sports={uniqueSports}
          selectedSport={effectiveSportCode}
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
            Standings will be available once regular season games are completed
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
  // Sport Picker styles
  pickerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.foregroundMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  pickerButtonActive: {
    borderColor: colors.neonBlue,
    backgroundColor: 'rgba(5, 217, 232, 0.1)',
  },
  pickerButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: 1,
  },
  pickerButtonTextActive: {
    color: colors.neonBlue,
  },
  pickerArrow: {
    fontSize: 10,
    color: colors.foregroundMuted,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 2,
    borderTopColor: colors.neonPink,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.neonPink,
    letterSpacing: 2,
  },
  modalClose: {
    fontSize: 18,
    color: colors.foregroundMuted,
    padding: 4,
  },
  modalScroll: {
    paddingBottom: 40,
  },
  seasonHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neonYellow,
    letterSpacing: 2,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.backgroundTertiary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionActive: {
    backgroundColor: 'rgba(5, 217, 232, 0.1)',
  },
  modalOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.foreground,
    letterSpacing: 0.5,
  },
  modalOptionTextActive: {
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
