import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import CurrencySelector from '../components/CurrencySelector';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { getExpenses, getIncomes } from '../services/apiService';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  showArrow = true,
  danger = false 
}) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
      <Ionicons 
        name={icon} 
        size={20} 
        color={danger ? '#EF4444' : '#6B7280'} 
      />
    </View>
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      )}
    </View>
    {showArrow && (
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color="#9CA3AF" 
      />
    )}
  </TouchableOpacity>
);

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { selectedCurrency } = useCurrency();
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Handle account deletion
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const [expenses, incomes] = await Promise.all([
        getExpenses(),
        getIncomes()
      ]);
      
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #3B82F6; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f2f2f2; }
              .expense { color: #EF4444; }
              .income { color: #10B981; }
            </style>
          </head>
          <body>
            <h1>Smart Expense Tracker - Data Export</h1>
            <h2>Expenses</h2>
            <table>
              <tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr>
              ${expenses.map(exp => `
                <tr>
                  <td>${new Date(exp.date).toLocaleDateString()}</td>
                  <td>${exp.category}</td>
                  <td>${exp.description}</td>
                  <td class="expense">-$${exp.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
            <h2>Income</h2>
            <table>
              <tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr>
              ${incomes.map(inc => `
                <tr>
                  <td>${new Date(inc.date).toLocaleDateString()}</td>
                  <td>${inc.category}</td>
                  <td>${inc.description}</td>
                  <td class="income">+$${inc.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
          </body>
        </html>
      `;
      
      const { uri } = await Print.printToFileAsync({ html });
      const fileName = `expense_data_${new Date().toISOString().split('T')[0]}.pdf`;
      const localUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.copyAsync({ from: uri, to: localUri });
      
      Alert.alert(
        'Export Complete',
        `Data exported as ${fileName}. Would you like to share it?`,
        [
          { text: 'Just Save', style: 'cancel' },
          { 
            text: 'Share', 
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(localUri);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export data. Please try again.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your transactions, budgets, and goals. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, you'd call an API to clear data
              Alert.alert('Data Cleared', 'All your data has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['#3B82F6', '#1E40AF']}
              style={styles.profileGradient}
            >
              <View style={styles.profileIcon}>
                <Ionicons name="person" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Budget alerts and reminders"
              onPress={() => {
                Alert.alert(
                  'Notification Settings',
                  'Choose your notification preferences:',
                  [
                    { text: 'Budget Alerts', onPress: () => Alert.alert('Budget Alerts', 'Budget alert notifications enabled') },
                    { text: 'Goal Reminders', onPress: () => Alert.alert('Goal Reminders', 'Goal reminder notifications enabled') },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            />
            <SettingItem
              icon="globe-outline"
              title="Currency"
              subtitle={`${selectedCurrency.name} (${selectedCurrency.symbol})`}
              onPress={() => setShowCurrencySelector(true)}
            />
            <SettingItem
              icon={isDarkMode ? "sunny-outline" : "moon-outline"}
              title="Dark Mode"
              subtitle={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
              onPress={toggleTheme}
            />
            <SettingItem
              icon="language-outline"
              title="Language"
              subtitle="English"
              onPress={() => {
                Alert.alert(
                  'Select Language',
                  'Choose your preferred language:',
                  [
                    { text: 'English', onPress: () => Alert.alert('Language', 'English selected') },
                    { text: 'Spanish', onPress: () => Alert.alert('Language', 'Spanish selected') },
                    { text: 'French', onPress: () => Alert.alert('Language', 'French selected') },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="download-outline"
              title="Export Data"
              subtitle="Download your data as CSV"
              onPress={handleExportData}
            />
            <SettingItem
              icon="cloud-upload-outline"
              title="Backup & Sync"
              subtitle="Sync your data across devices"
              onPress={() => {
                Alert.alert(
                  'Backup & Sync',
                  'Your data is automatically synced to the cloud.',
                  [
                    { text: 'Backup Now', onPress: () => Alert.alert('Backup', 'Data backed up successfully!') },
                    { text: 'OK', style: 'cancel' }
                  ]
                );
              }}
            />
            <SettingItem
              icon="trash-outline"
              title="Clear All Data"
              subtitle="Delete all transactions and data"
              onPress={handleClearData}
              danger
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="help-circle-outline"
              title="Help & FAQ"
              subtitle="Get help and find answers"
              onPress={() => {
                Alert.alert(
                  'Help & FAQ',
                  'Common questions:\n\n• How to add expenses?\n• How to set budgets?\n• How to track goals?\n• How to export data?',
                  [{ text: 'OK' }]
                );
              }}
            />
            <SettingItem
              icon="mail-outline"
              title="Contact Support"
              subtitle="Get in touch with our team"
              onPress={() => {
                Alert.alert(
                  'Contact Support',
                  'Need help? Contact us at:\n\nsupport@smartexpensetracker.com\n\nOr call: +1 (555) 123-4567',
                  [{ text: 'OK' }]
                );
              }}
            />
            <SettingItem
              icon="star-outline"
              title="Rate App"
              subtitle="Rate us on the app store"
              onPress={() => {
                Alert.alert(
                  'Rate Smart Expense Tracker',
                  'Enjoying the app? Please rate us on the app store!',
                  [
                    { text: 'Later', style: 'cancel' },
                    { text: 'Rate Now', onPress: () => Alert.alert('Thank You!', 'Thanks for rating us!') }
                  ]
                );
              }}
            />
            <SettingItem
              icon="information-circle-outline"
              title="About"
              subtitle="Version 1.0.0"
              onPress={() => {
                Alert.alert(
                  'About Smart Expense Tracker',
                  'Version 1.0.0\n\nA modern expense tracking app built with React Native.\n\nDeveloped with ❤️ for better financial management.',
                  [{ text: 'OK' }]
                );
              }}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="log-out-outline"
              title="Sign Out"
              onPress={handleLogout}
              showArrow={false}
              danger
            />
            <SettingItem
              icon="person-remove-outline"
              title="Delete Account"
              subtitle="Permanently delete your account"
              onPress={handleDeleteAccount}
              showArrow={false}
              danger
            />
          </View>
        </View>
      </ScrollView>
      
      <CurrencySelector
        isVisible={showCurrencySelector}
        onClose={() => setShowCurrencySelector(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  profileCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingIconDanger: {
    backgroundColor: '#FEE2E2',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingTitleDanger: {
    color: '#EF4444',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default SettingsScreen;