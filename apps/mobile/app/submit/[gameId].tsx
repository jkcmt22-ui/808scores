import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useGame } from '../../hooks/useGames';
import { colors } from '../../lib/theme';
import { useSupabase } from '../../contexts/SupabaseContext';

type SubmissionType = 'final_score' | 'period_score' | 'live_update';

export default function SubmitScoreScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const router = useRouter();
  const { game, isLoading: gameLoading } = useGame(gameId || '');
  const { supabase, user } = useSupabase();

  const [step, setStep] = useState(1);
  const [submissionType, setSubmissionType] = useState<SubmissionType | null>(null);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [period, setPeriod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (gameLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.neonPink} />
        <Text style={styles.loadingText}>LOADING...</Text>
      </View>
    );
  }

  if (!game || !user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>UNABLE TO LOAD GAME</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.backButtonText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getAbbrev = (name: string) => name?.substring(0, 2).toUpperCase() || '??';

  const handleSelectType = (type: SubmissionType) => {
    setSubmissionType(type);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!homeScore || !awayScore) {
      Alert.alert('Error', 'Please enter both scores');
      return;
    }

    const home = parseInt(homeScore, 10);
    const away = parseInt(awayScore, 10);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      Alert.alert('Error', 'Please enter valid scores');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create submission
      const { error: submitError } = await supabase.from('submissions').insert({
        game_id: gameId,
        user_id: user.id,
        submission_type: submissionType,
        home_score: home,
        away_score: away,
        period: period || null,
        status: 'pending',
      });

      if (submitError) throw submitError;

      // If final score, update game
      if (submissionType === 'final_score') {
        await supabase
          .from('games')
          .update({
            home_score: home,
            away_score: away,
            status: 'final',
          })
          .eq('id', gameId);
      } else if (submissionType === 'live_update' || submissionType === 'period_score') {
        await supabase
          .from('games')
          .update({
            home_score: home,
            away_score: away,
            status: 'in_progress',
            current_period: period || null,
          })
          .eq('id', gameId);
      }

      setStep(3); // Success
    } catch (err) {
      console.error('Submit error:', err);
      Alert.alert('Error', 'Failed to submit score. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Select submission type
  if (step === 1) {
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
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>► SUBMIT SCORE</Text>
            <Text style={styles.headerSubtitle}>Select submission type</Text>
          </View>

          <View style={styles.typeOptions}>
            <TouchableOpacity
              style={styles.typeCard}
              onPress={() => handleSelectType('final_score')}
              accessibilityLabel="Final score, game has ended, plus 10 points"
              accessibilityRole="button"
            >
              <View style={styles.typeIconContainer}>
                <FontAwesome name="flag-checkered" size={24} color={colors.neonGreen} />
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeName}>FINAL SCORE</Text>
                <Text style={styles.typeDesc}>Game has ended</Text>
              </View>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>+10</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.typeCard}
              onPress={() => handleSelectType('period_score')}
              accessibilityLabel="Period score, end of quarter or half, plus 5 points"
              accessibilityRole="button"
            >
              <View style={styles.typeIconContainer}>
                <FontAwesome name="clock-o" size={24} color={colors.neonBlue} />
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeName}>PERIOD SCORE</Text>
                <Text style={styles.typeDesc}>End of quarter/half/inning</Text>
              </View>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>+5</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.typeCard}
              onPress={() => handleSelectType('live_update')}
              accessibilityLabel="Live update, score during play, plus 5 points"
              accessibilityRole="button"
            >
              <View style={styles.typeIconContainer}>
                <FontAwesome name="bolt" size={24} color={colors.neonYellow} />
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeName}>LIVE UPDATE</Text>
                <Text style={styles.typeDesc}>Score during play</Text>
              </View>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>+5</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  // Step 2: Enter scores
  if (step === 2) {
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
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>► ENTER SCORE</Text>
              <Text style={styles.headerSubtitle}>
                {submissionType === 'final_score' && 'Final Score'}
                {submissionType === 'period_score' && 'Period Score'}
                {submissionType === 'live_update' && 'Live Update'}
              </Text>
            </View>

            {/* Period selector for period scores */}
            {submissionType === 'period_score' && (
              <View style={styles.periodSection}>
                <Text style={styles.sectionLabel}>SELECT PERIOD</Text>
                <View style={styles.periodOptions}>
                  {['1st', '2nd', '3rd', '4th', 'OT'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.periodButton, period === p && styles.periodButtonActive]}
                      onPress={() => setPeriod(p)}
                      accessibilityLabel={`${p} period${period === p ? ', selected' : ''}`}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.periodButtonText, period === p && styles.periodButtonTextActive]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Score inputs */}
            <View style={styles.scoreSection}>
              {/* Away Team */}
              <View style={styles.teamScoreRow}>
                <View style={[styles.teamAbbrevBox, styles.awayBox]}>
                  <Text style={styles.teamAbbrev}>
                    {getAbbrev(game.away_team?.short_name || game.away_team?.name)}
                  </Text>
                </View>
                <Text style={styles.teamNameInput} numberOfLines={1}>
                  {game.away_team?.short_name || game.away_team?.name}
                </Text>
                <TextInput
                  style={styles.scoreInput}
                  value={awayScore}
                  onChangeText={setAwayScore}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.foregroundMuted}
                  maxLength={3}
                  accessibilityLabel={`${game.away_team?.short_name || 'Away team'} score`}
                />
              </View>

              {/* Home Team */}
              <View style={styles.teamScoreRow}>
                <View style={[styles.teamAbbrevBox, styles.homeBox]}>
                  <Text style={styles.teamAbbrev}>
                    {getAbbrev(game.home_team?.short_name || game.home_team?.name)}
                  </Text>
                </View>
                <Text style={styles.teamNameInput} numberOfLines={1}>
                  {game.home_team?.short_name || game.home_team?.name}
                </Text>
                <TextInput
                  style={styles.scoreInput}
                  value={homeScore}
                  onChangeText={setHomeScore}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.foregroundMuted}
                  maxLength={3}
                  accessibilityLabel={`${game.home_team?.short_name || 'Home team'} score`}
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.backActionButton}
                onPress={() => setStep(1)}
                accessibilityLabel="Go back"
                accessibilityRole="button"
              >
                <Text style={styles.backActionText}>BACK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitActionButton, isSubmitting && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                accessibilityLabel={isSubmitting ? 'Submitting score' : 'Submit score'}
                accessibilityRole="button"
                accessibilityState={{ disabled: isSubmitting }}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text style={styles.submitActionText}>SUBMIT</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </>
    );
  }

  // Step 3: Success
  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerShadowVisible: false,
          headerLeft: () => null,
        }}
      />
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconBox}>
            <FontAwesome name="check" size={40} color={colors.neonGreen} />
          </View>
          <Text style={styles.successTitle}>SCORE SUBMITTED!</Text>
          <Text style={styles.successSubtitle}>Thank you for contributing</Text>

          <View style={styles.pointsEarnedBox}>
            <Text style={styles.pointsEarnedLabel}>POINTS EARNED</Text>
            <Text style={styles.pointsEarnedValue}>
              +{submissionType === 'final_score' ? '10' : '5'}
            </Text>
          </View>

          <View style={styles.successActions}>
            <TouchableOpacity
              style={styles.viewGameButton}
              onPress={() => router.replace(`/game/${gameId}`)}
              accessibilityLabel="View game"
              accessibilityRole="button"
            >
              <Text style={styles.viewGameText}>VIEW GAME</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.goHomeButton}
              onPress={() => router.replace('/')}
              accessibilityLabel="Go home"
              accessibilityRole="button"
            >
              <Text style={styles.goHomeText}>GO HOME</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
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
    letterSpacing: 1,
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
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: 2,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.neonBlue,
  },
  backButtonText: {
    color: colors.neonBlue,
    fontWeight: '700',
    letterSpacing: 2,
  },
  header: {
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.neonPink,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.foregroundMuted,
    marginTop: 4,
    letterSpacing: 1,
  },
  typeOptions: {
    padding: 16,
    gap: 12,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 12,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  typeInfo: {
    flex: 1,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: 1,
  },
  typeDesc: {
    fontSize: 12,
    color: colors.foregroundMuted,
    marginTop: 2,
  },
  pointsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.neonGreen,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.background,
    letterSpacing: 1,
  },
  periodSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.foregroundMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  periodOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  periodButtonActive: {
    borderColor: colors.neonBlue,
    backgroundColor: colors.backgroundTertiary,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.foregroundMuted,
    letterSpacing: 1,
  },
  periodButtonTextActive: {
    color: colors.neonBlue,
  },
  scoreSection: {
    padding: 16,
    gap: 12,
  },
  teamScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  teamNameInput: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
    fontWeight: '600',
  },
  scoreInput: {
    width: 70,
    height: 50,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#3a3a3a',
    color: colors.foreground,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  backActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  backActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: 2,
  },
  submitActionButton: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: colors.neonPink,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitActionText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.background,
    letterSpacing: 2,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successIconBox: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.neonGreen,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.foreground,
    letterSpacing: 2,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.foregroundMuted,
    marginBottom: 32,
  },
  pointsEarnedBox: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.neonBlue,
    marginBottom: 32,
  },
  pointsEarnedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.foregroundMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  pointsEarnedValue: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.neonBlue,
  },
  successActions: {
    width: '100%',
    gap: 12,
  },
  viewGameButton: {
    paddingVertical: 14,
    backgroundColor: colors.neonPink,
    alignItems: 'center',
  },
  viewGameText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.background,
    letterSpacing: 2,
  },
  goHomeButton: {
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  goHomeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.foreground,
    letterSpacing: 2,
  },
});
