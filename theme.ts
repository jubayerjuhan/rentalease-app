export const Colors = {
  light: {
    background: '#FFFFFF',
    text: '#012D4F',
    primary: '#024974',
    accent: '#6CC48C',
    inputBg: '#FFFFFF',
    inputBorder: '#6CC48C',
    placeholder: '#6B7280',
    danger: '#EF4444',
  },
  dark: {
    background: '#012D4F',
    text: '#FFFFFF',
    primary: '#6CC48C',
    accent: '#6CC48C',
    inputBg: '#01223A',
    inputBorder: '#6CC48C',
    placeholder: '#9CA3AF',
    danger: '#F87171',
  },
} as const;

export type ThemeMode = 'light' | 'dark';
