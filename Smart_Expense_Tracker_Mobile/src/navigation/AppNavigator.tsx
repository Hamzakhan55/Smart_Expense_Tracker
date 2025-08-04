import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import MobileNavbar from '../components/MobileNavbar';
import NavigationWrapper from '../components/NavigationWrapper';
import VoiceInputFAB from '../components/VoiceInputFAB';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';

import { RootStackParamList, MainTabParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabNavigator = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('Dashboard');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardScreen />;
      case 'Transactions':
        return <TransactionsScreen />;
      case 'Budgets':
        return <BudgetsScreen />;
      case 'Goals':
        return <GoalsScreen />;
      case 'Analytics':
        return <AnalyticsScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <MobileNavbar />
      
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      
      <NavigationWrapper 
        activeTab={activeTab} 
        onTabPress={setActiveTab}
        style="floating" // Change to "default" for standard bottom nav
      />
      
      <VoiceInputFAB />
    </View>
  );
};

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    paddingBottom: 120, // Extra space for floating nav
  },
});

export default AppNavigator;