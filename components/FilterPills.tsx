import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  };
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  pills,
  onPillPress,
  selectedPill,
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
      contentContainerStyle={styles.container}
    >
      {pills.map((pill) => {
        const isActive = selectedPill === pill.id || pill.active;
        
        return (
          <TouchableOpacity
            key={pill.id}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? theme.primary : theme.surface,
                borderColor: isActive ? theme.primary : theme.surface,
              },
            ]}
            onPress={() => onPillPress(pill.id)}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color: isActive ? 'white' : theme.text,
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
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : theme.primary + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    {
                      color: isActive ? 'white' : theme.primary,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
