import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSupabase } from '../contexts/SupabaseContext';
import { colors } from '../lib/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'exp://808scores.app/--/auth/callback',
        },
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send login email');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconBox}>
              <FontAwesome name="envelope" size={32} color={colors.neonGreen} />
            </View>
            <Text style={styles.title}>CHECK YOUR EMAIL</Text>
            <Text style={styles.subtitle}>
              We sent a magic link to
            </Text>
            <Text style={styles.emailHighlight}>{email}</Text>
            <Text style={styles.hint}>
              Click the link in the email to sign in
            </Text>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setEmailSent(false)}
            >
              <Text style={styles.secondaryButtonText}>TRY DIFFERENT EMAIL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <FontAwesome name="times" size={24} color={colors.foregroundMuted} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandHawaii}>HAWAII</Text>
            <Text style={styles.brandSports}>SPORTS</Text>
            <Text style={styles.brandCenter}>CENTER</Text>
          </View>

          <Text style={styles.subtitle}>
            Sign in to track your favorite teams, earn points, and join the conversation
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="YOUR@EMAIL.COM"
              placeholderTextColor={colors.foregroundMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'SENDING...' : 'CONTINUE WITH EMAIL'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandHawaii: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.neonPink,
    letterSpacing: 6,
  },
  brandSports: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.neonBlue,
    letterSpacing: 6,
  },
  brandCenter: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.neonYellow,
    letterSpacing: 6,
  },
  iconBox: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: colors.neonGreen,
    backgroundColor: colors.backgroundSecondary,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.foregroundMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  emailHighlight: {
    color: colors.neonBlue,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 8,
    letterSpacing: 1,
  },
  hint: {
    fontSize: 12,
    color: colors.foregroundMuted,
    textAlign: 'center',
    marginTop: 16,
    letterSpacing: 1,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 8,
    letterSpacing: 2,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.foreground,
    marginBottom: 16,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: colors.neonPink,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  secondaryButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: colors.neonBlue,
    backgroundColor: colors.backgroundSecondary,
  },
  secondaryButtonText: {
    color: colors.neonBlue,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
  },
  terms: {
    fontSize: 10,
    color: colors.foregroundMuted,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
    letterSpacing: 1,
  },
});
