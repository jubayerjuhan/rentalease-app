import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ViewStyle } from 'react-native';

export interface FilterPill {
  id: string;
  label: string;
  count?: number;
  active?: boolean;
}

interface FilterPillsProps {
  pills: FilterPill[];
  onPillPress: (pillId: string) => void;
  selectedPill?: string;
  theme?: {
    primary: string;
    surface: string;
    text: string;
    textSecondary: string;
    background: string;
    border?: string;
  };
  isDark?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  pills,
  onPillPress,
  selectedPill,
  isDark = false,
  style,
  contentContainerStyle,
  theme = {
    primary: '#024974',
    surface: '#F8F9FA',
    text: '#1F2937',
    textSecondary: '#6B7280',
    background: '#FFFFFF',
  },
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={[styles.container, contentContainerStyle]}
    >
      {pills.map((pill) => {
        const isActive = selectedPill === pill.id || pill.active;
        const inactiveBg = isDark ? '#1F2937' : '#F3F4F6';
        const inactiveBorder = isDark ? theme.border || '#374151' : '#E5E7EB';
        const activeTextColor = '#FFFFFF';
        const inactiveTextColor = isDark ? '#D1D5DB' : '#4B5563';

        return (
          <TouchableOpacity
            key={pill.id}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? theme.primary : inactiveBg,
                borderColor: isActive ? theme.primary : inactiveBorder,
                shadowOpacity: isActive ? 0.12 : (isDark ? 0 : 0.04),
                transform: [{ scale: isActive ? 1 : 0.98 }],
              },
            ]}
            onPress={() => onPillPress(pill.id)}
            activeOpacity={0.7}
            >
            <Text
              style={[
                styles.pillText,
                {
                  color: isActive ? activeTextColor : inactiveTextColor,
                },
              ]}
            >
              {pill.label}
            </Text>
            {pill.count !== undefined && (
              <View
                style={[
                styles.countBadge,
                {
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : theme.primary + '20',
                },
              ]}
            >
              <Text
                style={[
                    styles.countText,
                    {
                      color: isActive ? activeTextColor : theme.primary,
                    },
                  ]}
                >
                  {pill.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 24,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    height: 36,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
