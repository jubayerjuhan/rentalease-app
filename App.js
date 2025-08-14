import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Enable screens (required for react-navigation)
import 'react-native-screens/enable-screens';

// Dummy Screen Components
const HomeScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Home Screen</Text>
    <Text style={styles.screenSubtitle}>Welcome to the home screen</Text>
  </View>
);

const AvailableJobsScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Available Jobs</Text>
    <Text style={styles.screenSubtitle}>Browse available jobs</Text>
  </View>
);

const ActiveJobsScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>My Active Jobs</Text>
    <Text style={styles.screenSubtitle}>Track your active jobs</Text>
  </View>
);

const CompletedJobsScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Completed Jobs</Text>
    <Text style={styles.screenSubtitle}>View completed jobs</Text>
  </View>
);

const SettingsScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Settings</Text>
    <Text style={styles.screenSubtitle}>Manage your preferences</Text>
  </View>
);

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const tabIcons = {
    Home: { active: 'home', inactive: 'home-outline' },
    AvailableJobs: { active: 'briefcase', inactive: 'briefcase-outline' },
    ActiveJobs: { active: 'clipboard-check', inactive: 'clipboard-check-outline' },
    CompletedJobs: { active: 'check-circle', inactive: 'check-circle-outline' },
    Settings: { active: 'cog', inactive: 'cog-outline' },
  };

  const tabLabels = {
    Home: 'Home',
    AvailableJobs: 'Available Jobs',
    ActiveJobs: 'My Active Jobs',
    CompletedJobs: 'Completed Jobs',
    Settings: 'Settings',
  };

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName = isFocused 
          ? tabIcons[route.name]?.active 
          : tabIcons[route.name]?.inactive;

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabItem}
          >
            <MaterialCommunityIcons
              name={iconName}
              size={24}
              color={isFocused ? '#8B5CF6' : '#9CA3AF'}
            />
            <Text style={[
              styles.tabLabel,
              { 
                color: isFocused ? '#8B5CF6' : '#9CA3AF',
                fontWeight: isFocused ? 'bold' : 'normal'
              }
            ]}>
              {tabLabels[route.name]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="AvailableJobs" component={AvailableJobsScreen} />
          <Tab.Screen name="ActiveJobs" component={ActiveJobsScreen} />
          <Tab.Screen name="CompletedJobs" component={CompletedJobsScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});