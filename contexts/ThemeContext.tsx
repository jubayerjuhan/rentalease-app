import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Accent colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Status colors
  active: string;
  scheduled: string;
  completed: string;
  pending: string;
  
  // Border and divider colors
  border: string;
  divider: string;
  
  // Shadow colors
  shadow: string;
  
  // Special colors
  overlay: string;
  disabled: string;
  placeholder: string;
}

export const lightTheme: Theme = {
  // Background colors
  background: '#F9FAFB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text colors
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // Primary colors
  primary: '#024974',
  primaryLight: '#0369A1',
  primaryDark: '#012D4F',
  
  // Accent colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Status colors
  active: '#F59E0B',
  scheduled: '#3B82F6',
  completed: '#10B981',
  pending: '#F59E0B',
  
  // Border and divider colors
  border: '#E5E7EB',
  divider: '#F3F4F6',
  
  // Shadow colors
  shadow: '#000000',
  
  // Special colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  disabled: '#9CA3AF',
  placeholder: '#9CA3AF',
};

export const darkTheme: Theme = {
  // Background colors
  background: '#0F172A',
  surface: '#1E293B',
  card: '#334155',
  
  // Text colors
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  
  // Primary colors
  primary: '#0EA5E9',
  primaryLight: '#38BDF8',
  primaryDark: '#0284C7',
  
  // Accent colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Status colors
  active: '#F59E0B',
  scheduled: '#3B82F6',
  completed: '#22C55E',
  pending: '#F59E0B',
  
  // Border and divider colors
  border: '#475569',
  divider: '#374151',
  
  // Shadow colors
  shadow: '#000000',
  
  // Special colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  disabled: '#64748B',
  placeholder: '#64748B',
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: (position?: { x: number; y: number }) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.log('Error loading theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTheme();
  }, []);

  const toggleTheme = async (position?: { x: number; y: number }) => {
    const newTheme: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    
    // Immediate theme change without any animation
    setThemeMode(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };


  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isDark = themeMode === 'dark';

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper function to create themed styles
export const createThemedStyles = (styleFunction: (theme: Theme) => any) => {
  return (theme: Theme) => styleFunction(theme);
};