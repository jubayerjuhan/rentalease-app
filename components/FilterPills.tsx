import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface FilterPill {
  id: string;
  label: string;
  value?: string;
}

interface FilterPillsProps {
  pills: FilterPill[];
  selectedPill: string;
  onPillPress: (pill: FilterPill) => void;
  style?: ViewStyle;
}

export function FilterPills({ pills, selectedPill, onPillPress, style }: FilterPillsProps) {
  const { theme, isDark } = useTheme();

  const styles = createStyles(theme, isDark);

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {pills.map((pill, index) => {
          const isSelected = selectedPill === pill.id;
          const isFirst = index === 0;
          const isLast = index === pills.length - 1;
          const isOverdue = pill.id === 'Overdue';

          return (
            <TouchableOpacity
              key={pill.id}
              style={[
                styles.pill,
                isSelected && (isOverdue ? styles.pillSelectedOverdue : styles.pillSelected),
                isFirst && styles.pillFirst,
                isLast && styles.pillLast,
              ]}
              onPress={() => onPillPress(pill)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  isSelected && styles.pillTextSelected,
                ]}
                numberOfLines={1}
              >
                {pill.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingVertical: 8,
    },
    scrollView: {
      flexGrow: 0,
    },
    scrollContent: {
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    pill: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginRight: 8,
      borderRadius: 25,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.border,
      minHeight: 40,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: isDark ? 'transparent' : '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 2,
      elevation: isDark ? 0 : 1,
    },
    pillSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
      shadowColor: theme.primary,
      shadowOpacity: isDark ? 0 : 0.25,
      shadowRadius: 4,
      elevation: isDark ? 0 : 3,
    },
    pillSelectedOverdue: {
      backgroundColor: '#EF4444',
      borderColor: '#EF4444',
      shadowColor: '#EF4444',
      shadowOpacity: isDark ? 0 : 0.25,
      shadowRadius: 4,
      elevation: isDark ? 0 : 3,
    },
    pillFirst: {
      marginLeft: 0,
    },
    pillLast: {
      marginRight: 16,
    },
    pillText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
      textAlign: 'center',
    },
    pillTextSelected: {
      color: isDark ? theme.surface : '#FFFFFF',
      fontWeight: '700',
    },
  });