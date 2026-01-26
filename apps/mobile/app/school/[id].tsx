import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

// Color palette
const colors = {
  background: '#0A0A0F',
  card: '#141419',
  cardBorder: '#2A2A35',
  primary: '#FF2A6D',
  secondary: '#00D4FF',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
};

export default function SchoolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'School',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <View style={styles.container}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderTitle}>School Details</Text>
          <Text style={styles.placeholderText}>
            School ID: {id}
          </Text>
          <Text style={styles.placeholderSubtext}>
            School details and schedule coming soon!
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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
    color: colors.secondary,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
});
