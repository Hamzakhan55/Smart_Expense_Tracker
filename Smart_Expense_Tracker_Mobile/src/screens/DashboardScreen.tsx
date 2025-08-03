import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getMonthlySummary, getRunningBalance } from '../services/apiService';
import { MonthlySummary, RunningBalance } from '../types';

const { width } = Dimensions.get('window');

interface StatCardProps {
  title: string;
  amount: number;
  icon: keyof typeof Ionicons.glyphMap;
  colors: string[];
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, amount, icon, colors, change, trend }) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#10B981';
      case 'down':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  return (
    <LinearGradient colors={colors} style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <View>
          <Text style={styles.statCardTitle}>{title}</Text>
          <View style={styles.statCardDivider} />
        </View>
        <View style={styles.statCardIconContainer}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </View>
      </View>
      
      <View style={styles.statCardContent}>
        <Text style={styles.statCardAmount}>{formatCurrency(amount)}</Text>
        {change && (
          <View style={styles.changeContainer}>
            <View style={[styles.changeBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Ionicons 
                name={getTrendIcon() as keyof typeof Ionicons.glyphMap} 
                size={12} 
                color="#FFFFFF" 
              />
              <Text style={styles.changeText}>{change}</Text>
            </View>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [runningBalance, setRunningBalance] = useState<RunningBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [summaryData, balanceData] = await Promise.all([
        getMonthlySummary(currentYear, currentMonth),
        getRunningBalance(),
      ]);
      
      setMonthlySummary(summaryData);
      setRunningBalance(balanceData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const savingsRate = monthlySummary?.total_income
    ? ((monthlySummary.total_income - monthlySummary.total_expenses) / monthlySummary.total_income) * 100
    : 0;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0', '#CBD5E1']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}, {user?.name || 'User'}!</Text>
              <Text style={styles.headerSubtitle}>Here's your financial overview</Text>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={logout}>
              <Ionicons name="person-circle-outline" size={32} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsGrid}>
          <StatCard
            title="Net Worth"
            amount={runningBalance?.total_balance ?? 0}
            icon="wallet"
            colors={['#10B981', '#059669']}
            change="+5.2% from last month"
            trend="up"
          />
          
          <StatCard
            title="Monthly Income"
            amount={monthlySummary?.total_income ?? 0}
            icon="trending-up"
            colors={['#3B82F6', '#1E40AF']}
            change="+12.3% from last month"
            trend="up"
          />
          
          <StatCard
            title="Monthly Expenses"
            amount={monthlySummary?.total_expenses ?? 0}
            icon="trending-down"
            colors={['#EF4444', '#DC2626']}
            change="-3.1% from last month"
            trend="down"
          />
          
          <View style={styles.savingsCard}>
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.savingsGradient}>
              <View style={styles.statCardHeader}>
                <View>
                  <Text style={styles.statCardTitle}>Savings Rate</Text>
                  <View style={styles.statCardDivider} />
                </View>
                <View style={styles.statCardIconContainer}>
                  <Ionicons name="trophy" size={24} color="#FFFFFF" />
                </View>
              </View>
              
              <View style={styles.statCardContent}>
                <Text style={styles.statCardAmount}>{savingsRate.toFixed(1)}%</Text>
                <View style={styles.changeContainer}>
                  <View style={[styles.changeBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                    <Text style={styles.changeText}>Target: 20%</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionGradient}>
                <Ionicons name="add-circle" size={32} color="#FFFFFF" />
                <Text style={styles.actionText}>Add Expense</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.actionGradient}>
                <Ionicons name="cash" size={32} color="#FFFFFF" />
                <Text style={styles.actionText}>Add Income</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.actionGradient}>
                <Ionicons name="mic" size={32} color="#FFFFFF" />
                <Text style={styles.actionText}>Voice Input</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.actionGradient}>
                <Ionicons name="analytics" size={32} color="#FFFFFF" />
                <Text style={styles.actionText}>View Reports</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  statsGrid: {
    marginBottom: 30,
  },
  statCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statCardDivider: {
    width: 30,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    marginTop: 4,
  },
  statCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardContent: {
    flex: 1,
  },
  statCardAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  savingsCard: {
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
  savingsGradient: {
    borderRadius: 16,
    padding: 20,
  },
  quickActions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionGradient: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardScreen;