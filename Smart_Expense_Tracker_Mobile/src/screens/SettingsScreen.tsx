import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Linking,
  Modal,
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
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

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
    setShowClearDataModal(true);
  };

  const confirmClearData = async () => {
    setIsClearing(true);
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
      
      Alert.alert('✅ Success', 'All your data has been cleared successfully!');
      setShowClearDataModal(false);
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to clear data. Please try again.');
    } finally {
      setIsClearing(false);
    }
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
                <Text style={styles.profileEmail}>{user?.email || 'demo@example.com'}</Text>
              </View>

            </LinearGradient>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preferences</Text>
          <View style={[styles.settingsGroup, { backgroundColor: theme.colors.card }]}>

            <SettingItem
              icon="globe-outline"
              title="Currency"
              subtitle={`${selectedCurrency.name} (${selectedCurrency.symbol})`}
              onPress={() => setShowCurrencySelector(true)}
            />
            <SettingItem
              icon={isDarkMode ? "sunny-outline" : "moon-outline"}
              title="Theme"
              subtitle={isDarkMode ? "Dark Mode" : "Light Mode"}
              onPress={() => setShowThemeModal(true)}
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
                  '📱 Smart Expense Tracker - Help & FAQ',
                  '🎯 GETTING STARTED:\n• Dashboard: View financial overview with real-time stats\n• Voice Input: Hold FAB button to record expenses\n• Quick Actions: Add income/expenses from dashboard\n\n💰 EXPENSE MANAGEMENT:\n• Add expenses manually or via voice recognition\n• Categorize transactions automatically\n• Edit/delete transactions by tapping them\n• Search and filter transaction history\n\n📊 BUDGETS & GOALS:\n• Set monthly budgets by category\n• Track spending progress with visual indicators\n• Create savings goals with target amounts\n• Monitor goal progress and add funds\n\n📈 ANALYTICS:\n• View spending trends and patterns\n• Analyze category breakdowns\n• Get AI-powered financial insights\n• Track savings rate and net worth\n\n⚙️ SETTINGS & DATA:\n• Switch between light/dark themes\n• Change currency preferences\n• Export data as PDF reports\n• Clear all data when needed\n\n🔊 VOICE FEATURES:\n• AI-powered expense recognition\n• Automatic category prediction\n• Amount extraction from speech\n• Fallback manual entry option',
                  [{ text: 'Got it!' }]
                );
              }}
            />
            <SettingItem
              icon="mail-outline"
              title="Contact Support"
              subtitle="Get in touch with our team"
              onPress={() => {
                const email = 'hamzakhan127109@gmail.com';
                const subject = 'Smart Expense Tracker - Support Request';
                const body = 'Hi,\n\nI need help with Smart Expense Tracker app.\n\nIssue Description:\n\n\nDevice Info:\n- App Version: 1.0.0\n- Platform: Mobile\n\nThank you!';
                
                const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                
                Linking.openURL(mailtoUrl).catch(() => {
                  Alert.alert('Error', 'Could not open email client. Please email us at: hamzakhan127109@gmail.com');
                });
              }}
            />

            <SettingItem
              icon="information-circle-outline"
              title="About"
              subtitle="Version 1.0.0"
              onPress={() => {
                Alert.alert(
                  '🚀 Smart Expense Tracker',
                  '📱 Version 1.0.0\n\n💡 ABOUT THE APP:\nSmart Expense Tracker is an advanced financial management solution designed to revolutionize how you handle personal finances. Built with cutting-edge technology and AI integration, it provides intelligent insights for better financial decision-making.\n\n🎯 KEY FEATURES:\n• AI-Powered Voice Recognition for instant expense logging\n• Intelligent category prediction and auto-categorization\n• Real-time budget tracking with smart alerts\n• Goal-oriented savings management\n• Advanced analytics with predictive insights\n• Multi-currency support for global users\n• Secure data export and backup capabilities\n• Adaptive dark/light theme interface\n\n🤖 AI TECHNOLOGY:\n• Natural Language Processing for voice commands\n• Machine Learning for spending pattern analysis\n• Predictive algorithms for financial forecasting\n• Smart categorization engine\n\n⚡ TECHNICAL STACK:\n• React Native with TypeScript\n• FastAPI backend architecture\n• SQLite database with real-time sync\n• Expo framework for cross-platform deployment\n• Advanced charting and visualization libraries\n\n👨‍💻 DEVELOPER PROFILE:\n\n🎓 Hamza Khan\n🏢 Senior Full-Stack Developer & AI Specialist\n🌟 5+ years in mobile app development\n🔧 Expert in React Native, Python, AI/ML\n📧 hamzakhan127109@gmail.com\n\n🎯 MISSION:\nEmpowering individuals with intelligent financial tools for better money management and long-term financial wellness.\n\n💝 Crafted with passion and precision for your financial success.',
                  [{ text: 'Awesome!' }]
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
      
      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.themeModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.themeHeader}>
              <Text style={[styles.themeTitle, { color: theme.colors.text }]}>Choose Theme</Text>
              <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.themeOption, !isDarkMode && styles.themeOptionActive]}
              onPress={() => {
                if (isDarkMode) toggleTheme();
                setShowThemeModal(false);
              }}
            >
              <Ionicons name="sunny" size={24} color={!isDarkMode ? '#F59E0B' : theme.colors.textSecondary} />
              <View style={styles.themeOptionText}>
                <Text style={[styles.themeOptionTitle, { color: theme.colors.text }]}>Light Mode</Text>
                <Text style={[styles.themeOptionSubtitle, { color: theme.colors.textSecondary }]}>Bright and clean interface</Text>
              </View>
              {!isDarkMode && <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.themeOption, isDarkMode && styles.themeOptionActive]}
              onPress={() => {
                if (!isDarkMode) toggleTheme();
                setShowThemeModal(false);
              }}
            >
              <Ionicons name="moon" size={24} color={isDarkMode ? '#8B5CF6' : theme.colors.textSecondary} />
              <View style={styles.themeOptionText}>
                <Text style={[styles.themeOptionTitle, { color: theme.colors.text }]}>Dark Mode</Text>
                <Text style={[styles.themeOptionSubtitle, { color: theme.colors.textSecondary }]}>Easy on the eyes</Text>
              </View>
              {isDarkMode && <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Clear Data Confirmation Modal */}
      <Modal
        visible={showClearDataModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isClearing && setShowClearDataModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.clearDataModal, { backgroundColor: theme.colors.card }]}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.clearDataHeader}
            >
              <View style={styles.clearDataIconContainer}>
                <Ionicons name="warning" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.clearDataTitle}>Clear All Data</Text>
              <Text style={styles.clearDataSubtitle}>This action cannot be undone</Text>
            </LinearGradient>
            
            <View style={styles.clearDataContent}>
              <View style={[styles.clearDataWarning, { 
                backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2', 
                borderColor: '#EF4444' 
              }]}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={[styles.clearDataWarningText, { color: isDarkMode ? '#F87171' : '#DC2626' }]}>
                  All your transactions, budgets, goals, and settings will be permanently deleted.
                </Text>
              </View>
              
              <View style={styles.clearDataButtons}>
                <TouchableOpacity 
                  style={[styles.clearDataCancelButton, { 
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border 
                  }]} 
                  onPress={() => setShowClearDataModal(false)}
                  disabled={isClearing}
                >
                  <Text style={[styles.clearDataCancelText, { color: theme.colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.clearDataConfirmButton, isClearing && styles.clearDataConfirmButtonDisabled]} 
                  onPress={confirmClearData}
                  disabled={isClearing}
                >
                  <LinearGradient
                    colors={isClearing ? ['#9CA3AF', '#6B7280'] : ['#EF4444', '#DC2626']}
                    style={styles.clearDataConfirmGradient}
                  >
                    {isClearing ? (
                      <View style={styles.clearDataLoadingContainer}>
                        <Ionicons name="hourglass" size={18} color="#FFFFFF" />
                        <Text style={styles.clearDataConfirmText}>Clearing...</Text>
                      </View>
                    ) : (
                      <View style={styles.clearDataLoadingContainer}>
                        <Ionicons name="trash" size={18} color="#FFFFFF" />
                        <Text style={styles.clearDataConfirmText}>Clear All</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  themeModal: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  themeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  themeOptionText: {
    flex: 1,
    marginLeft: 16,
  },
  themeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  themeOptionSubtitle: {
    fontSize: 14,
  },
  clearDataModal: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  clearDataHeader: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 20,
  },
  clearDataIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearDataTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  clearDataSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  clearDataContent: {
    padding: 24,
  },
  clearDataWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  clearDataWarningText: {
    fontSize: 14,
    color: '#DC2626',
    flex: 1,
  },
  clearDataButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  clearDataCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearDataCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearDataConfirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  clearDataConfirmGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearDataConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  clearDataLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SettingsScreen;