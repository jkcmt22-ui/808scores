import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useSports } from '../../hooks/useSports';

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
};

export default function StandingsScreen() {
  const { sports, isLoading } = useSports();
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading sports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sport Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sportFilter}
        contentContainerStyle={styles.sportFilterContent}
      >
        {sports.map((sport) => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportChip,
              selectedSport === sport.id && styles.sportChipActive,
            ]}
            onPress={() => setSelectedSport(sport.id === selectedSport ? null : sport.id)}
          >
            <Text
              style={[
                styles.sportChipText,
                selectedSport === sport.id && styles.sportChipTextActive,
              ]}
            >
              {sport.display_name || sport.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Placeholder for standings */}
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderTitle}>Standings</Text>
        <Text style={styles.placeholderText}>
          {selectedSport
            ? `Viewing ${sports.find(s => s.id === selectedSport)?.name} standings`
            : 'Select a sport to view standings'}
        </Text>
        <Text style={styles.placeholderSubtext}>
          Standings will be calculated from game results
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  sportFilter: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  sportFilterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  sportChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 8,
  },
  sportChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sportChipText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  sportChipTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
