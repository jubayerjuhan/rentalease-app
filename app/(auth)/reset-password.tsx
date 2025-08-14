import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { InputField, PrimaryButton, ScreenContainer, Subtitle, Title, useTheme, LinkText } from '@components/UI';
import { technicianResetPassword } from '@services/auth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(params.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; otp?: string; newPassword?: string; confirmPassword?: string }>({});

  function validate() {
    const next: typeof errors = {};
    if (!email) next.email = 'Email is required';
    if (!otp) next.otp = 'OTP is required';
    if (!newPassword) next.newPassword = 'New password is required';
    if (newPassword && newPassword.length < 8) next.newPassword = 'Password must be at least 8 characters';
    if (!confirmPassword) next.confirmPassword = 'Confirm your new password';
    if (newPassword && confirmPassword && newPassword !== confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit() {
    if (!validate()) return;
    try {
      setLoading(true);
      const message = await technicianResetPassword(email.trim(), otp.trim(), newPassword);
      Alert.alert('Success', message, [
        {
          text: 'OK',
          onPress: () => router.replace({ pathname: '/(auth)/login', params: { email } }),
        },
      ]);
    } catch (e: any) {
      Alert.alert('Reset failed', e?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.form}>
        <View style={{ width: '100%', maxWidth: 480, alignItems: 'center' }}>
          <Title>Reset Password</Title>
          <Subtitle>Enter the OTP you received and your new password.</Subtitle>

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
            keyboardType="number-pad"
            maxLength={6}
            placeholder="6-digit OTP"
            value={otp}
            onChangeText={setOtp}
            error={errors.otp}
          />
          <InputField
            secureTextEntry
            placeholder="New password"
            value={newPassword}
            onChangeText={setNewPassword}
            error={errors.newPassword}
          />
          <InputField
            secureTextEntry
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
          />

          <PrimaryButton title={loading ? 'Resetting...' : 'Reset Password'} onPress={onSubmit} loading={loading} />
          <LinkText onPress={() => router.back()}>Back</LinkText>
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
