import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { InputField, PrimaryButton, ScreenContainer, Subtitle, Title, LinkText } from '@components/UI';
import { technicianLogin } from '@services/auth';
import { saveToken } from '@services/secureStore';

export default function LoginPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(params.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const next: typeof errors = {};
    if (!email) next.email = 'Email is required';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit() {
    if (!validate()) return;
    try {
      setLoading(true);
      const trimmedEmail = email.trim();
      console.log('[LoginPage] Attempting login with:', { email: trimmedEmail, passwordLength: password.length });
      const data = await technicianLogin(trimmedEmail, password);
      if (data?.token) await saveToken(data.token);
      router.replace('/(app)');
    } catch (e: any) {
      Alert.alert('Login failed', e?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.form}>
        <View style={{ width: '100%', maxWidth: 480, alignItems: 'center' }}>
          <Title>Technician Login</Title>
          <Subtitle>Sign in to continue</Subtitle>
          <InputField
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
          <InputField
            secureTextEntry
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />
          <PrimaryButton title={loading ? 'Signing in...' : 'Sign In'} onPress={onSubmit} loading={loading} />
          <LinkText onPress={() => router.push('/(auth)/forgot-password')}>Forgot password?</LinkText>
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