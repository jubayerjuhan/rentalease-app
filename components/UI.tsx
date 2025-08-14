import React from 'react';
import { ActivityIndicator, ColorValue, GestureResponderEvent, Image, Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../theme';

export function useTheme() {
  const scheme = useColorScheme();
  const mode = scheme === 'dark' ? 'dark' : 'light';
  return { mode, colors: Colors[mode] };
}

type ButtonProps = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'filled' | 'outline';
};

export function PrimaryButton({ title, onPress, style, disabled, loading, variant = 'filled' }: ButtonProps) {
  const { colors } = useTheme();
  const isOutline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isOutline ? 'transparent' : colors.primary,
          borderColor: colors.accent as ColorValue,
          opacity: pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.accent : '#FFFFFF'} />
      ) : (
        <Text style={[styles.buttonText, { color: isOutline ? colors.accent : '#FFFFFF' }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function InputField(props: TextInputProps & { error?: string }) {
  const { colors } = useTheme();
  const { error, style, placeholderTextColor, ...rest } = props as any;
  return (
    <View style={{ width: '100%' }}>
      <TextInput
        placeholderTextColor={placeholderTextColor || colors.placeholder}
        style={[
          styles.input,
          {
            backgroundColor: colors.inputBg,
            borderColor: error ? colors.danger : colors.inputBorder,
            color: colors.text,
          },
          style,
        ]}
        {...rest}
      />
      {!!error && <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

export function ScreenContainer({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.container, { backgroundColor: colors.background }]}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.title, { color: colors.text }]}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.subtitle, { color: colors.placeholder }]}>{children}</Text>;
}

export function LinkText({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 8 }}>
      <Text style={{ color: colors.accent, textAlign: 'center', fontSize: 16 }}>{children}</Text>
    </Pressable>
  );
}

export function Logo({ size = 160 }: { size?: number }) {
  return (
    <View style={{ alignItems: 'center', marginBottom: 12 }}>
      <Image
        source={require('@assets/rentalease-logo.png')}
        style={{ width: size, aspectRatio: 1, resizeMode: 'contain' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 13,
    marginTop: -6,
    marginBottom: 8,
  },
});
