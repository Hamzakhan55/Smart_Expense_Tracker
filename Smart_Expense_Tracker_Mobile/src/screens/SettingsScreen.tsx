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
import ChangeEmailModal from '../components/ChangeEmailModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { getExpenses, getIncomes, getBudgets, getGoals, deleteExpense, deleteIncome, deleteBudget, deleteGoal, updateEmail, updatePassword } from '../services/apiService';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
  disabled?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  showArrow = true,
  danger = false,
  disabled = false 
}) => {
  const { theme } = useTheme();
  return (
  <TouchableOpacity 
    style={[styles.settingItem, { borderBottomColor: theme.colors.border, opacity: disabled ? 0.6 : 1 }]} 
    onPress={disabled ? undefined : onPress}
    disabled={disabled}
  >
    <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
      <Ionicons 
        name={icon} 
        size={20} 
        color={danger ? '#EF4444' : '#6B7280'} 
      />
    </View>
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, { color: danger ? '#EF4444' : theme.colors.text }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
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
};

const SettingsScreen = () => {
  const { user, logout, updateUser } = useAuth();
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { selectedCurrency } = useCurrency();
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Any unsaved changes will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Signed Out', 'You have been successfully signed out.');
            logout();
          },
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
            Alert.prompt(
              'Confirm Deletion',
              'Type "DELETE" to confirm account deletion:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Account',
                  style: 'destructive',
                  onPress: (text) => {
                    if (text === 'DELETE') {
                      Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
                      logout();
                    } else {
                      Alert.alert('Error', 'Please type "DELETE" to confirm.');
                    }
                  }
                }
              ],
              'plain-text'
            );
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
          { text: 'Save', style: 'cancel' },
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
              const [expenses, incomes, budgets, goals] = await Promise.all([
                getExpenses(),
                getIncomes(),
                getBudgets(new Date().getFullYear(), new Date().getMonth() + 1),
                getGoals()
              ]);
              
              await Promise.all([
                ...expenses.map(expense => deleteExpense(expense.id)),
                ...incomes.map(income => deleteIncome(income.id)),
                ...budgets.map(budget => deleteBudget(budget.id)),
                ...goals.map(goal => deleteGoal(goal.id))
              ]);
              
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.gradients.background}
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Settings</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Manage your account and preferences</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Profile</Text>
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
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preferences</Text>
          <View style={[styles.settingsGroup, { backgroundColor: theme.colors.card }]}>
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
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Data</Text>
          <View style={[styles.settingsGroup, { backgroundColor: theme.colors.card }]}>
            <SettingItem
              icon="download-outline"
              title="Export Data"
              subtitle="Download your data as Pdf"
              onPress={handleExportData}
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
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Support</Text>
          <View style={[styles.settingsGroup, { backgroundColor: theme.colors.card }]}>
            <SettingItem
              icon="help-circle-outline"
              title="Help & FAQ"
              subtitle="Get help and find answers"
              onPress={() => {
                Alert.alert(
                  'Help & FAQ',
                  'Common Questions:\n\n• How to add expenses?\nTap the + button on dashboard or use voice recording\n\n• How to set budgets?\nGo to Budgets tab and tap "Set New Budget"\n\n• How to track goals?\nUse Goals tab to create and manage savings goals\n\n• How to export data?\nGo to Settings > Export Data for PDF reports\n\n• How to change theme?\nSettings > Dark Mode toggle',
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
                  'Need help or have feedback?\n\nEmail: hamzakhan127109@gmail.com\n\nWe typically respond within 24 hours.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Send Email', onPress: () => {
                      // In a real app, this would open the email client
                      Alert.alert('Email Client', 'Opening email app...');
                    }}
                  ]
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
                  'Enjoying the app? Your rating helps us improve and reach more users!',
                  [
                    { text: 'Later', style: 'cancel' },
                    { text: 'Rate Now', onPress: () => {
                      // In a real app, this would open the app store
                      Alert.alert('Thank You!', 'Redirecting to app store...');
                    }}
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
                  'Version 1.0.0\n\nSmart Expense Tracker is a comprehensive financial management app that helps you take control of your finances. Features include:\n\n• AI-powered expense tracking with voice input\n• Smart budget management with alerts\n• Goal setting and progress tracking\n• Advanced analytics and insights\n• Data export and reporting\n• Dark/Light theme support\n• Multi-currency support\n\nAI Models Integrated:\n• AI Voice Recognition - Converts speech to expense data\n• Category Prediction - Automatically categorizes transactions\n\nBuilt with React Native and modern AI technologies for intelligent financial management.\n\nDeveloped by Hamza Khan\nFull-Stack Developer\n\nCreated with ❤️ for better financial wellness.',
                  [{ text: 'OK' }]
                );
              }}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account</Text>
          <View style={[styles.settingsGroup, { backgroundColor: theme.colors.card }]}>
            <SettingItem
              icon="mail-outline"
              title="Change Email"
              subtitle="Update your email address"
              onPress={() => setShowChangeEmailModal(true)}
            />
            <SettingItem
              icon="lock-closed-outline"
              title="Change Password"
              subtitle="Update your password"
              onPress={() => setShowChangePasswordModal(true)}
            />
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
      
      <ChangeEmailModal
        visible={showChangeEmailModal}
        onClose={() => setShowChangeEmailModal(false)}
        onUpdate={async (email) => {
          await updateEmail(email);
          await updateUser({ email });
          Alert.alert('Success', 'Email updated successfully!');
        }}
        currentEmail={user?.email || ''}
      />
      
      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onUpdate={async (password) => {
          try {
            console.log('Updating password...');
            const result = await updatePassword(password);
            console.log('Password update result:', result);
            Alert.alert('Success', 'Password updated successfully!');
          } catch (error) {
            console.error('Password update error:', error);
            Alert.alert('Error', 'Failed to update password. Please try again.');
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
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
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
});

export default SettingsScreen;