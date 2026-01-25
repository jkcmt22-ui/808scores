import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';
import { useSupabase } from '../contexts/SupabaseContext';

// Color palette
const colors = {
  background: '#0A0A0F',
  card: '#141419',
  cardBorder: '#2A2A35',
  primary: '#FF2A6D',
  secondary: '#00D4FF',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  inputBg: '#1A1A22',
};

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
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              We sent a magic link to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
            <Text style={styles.hint}>
              Click the link in the email to sign in
            </Text>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setEmailSent(false)}
            >
              <Text style={styles.secondaryButtonText}>Try different email</Text>
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
          <Text style={styles.closeButtonText}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Welcome to 808scores</Text>
          <Text style={styles.subtitle}>
            Sign in to track your favorite teams, earn points, and join the conversation
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={colors.textMuted}
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
                {isLoading ? 'Sending...' : 'Continue with Email'}
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
    left: 20,
    zIndex: 1,
  },
  closeButtonText: {
    color: colors.secondary,
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emailHighlight: {
    color: colors.secondary,
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 24,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: colors.secondary,
    fontSize: 16,
    textAlign: 'center',
  },
  terms: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});
