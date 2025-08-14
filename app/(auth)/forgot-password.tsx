import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { InputField, PrimaryButton, ScreenContainer, Subtitle, Title, LinkText } from '@components/UI';
import { technicianForgotPassword } from '@services/auth';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function onSubmit() {
    if (!email) {
      setError('Email is required');
      return;
    }
    try {
      setLoading(true);
      const message = await technicianForgotPassword(email.trim());
      Alert.alert('OTP sent', message, [
        {
          text: 'Enter OTP',
          onPress: () => router.push({ pathname: '/(auth)/reset-password', params: { email } }),
        },
      ]);
    } catch (e: any) {
      Alert.alert('Request failed', e?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.form}>
        <View style={{ width: '100%', maxWidth: 480, alignItems: 'center' }}>
          <Title>Forgot Password</Title>
          <Subtitle>Enter your email and we'll send a 6‑digit OTP.</Subtitle>
          <InputField
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Email address"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError(undefined);
            }}
            error={error}
          />
          <PrimaryButton title={loading ? 'Sending...' : 'Send OTP'} onPress={onSubmit} loading={loading} />
          <LinkText onPress={() => router.back()}>Back to Login</LinkText>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});