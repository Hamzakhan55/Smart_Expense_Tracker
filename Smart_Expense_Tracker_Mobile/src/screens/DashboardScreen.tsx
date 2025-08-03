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
import { MonthlySummary, RunningBalance, AiResponse } from '../types';
import { useNavigation } from '@react-navigation/native';
import QuickAddModal from '../components/QuickAddModal';
import { useSmartInsights } from '../hooks/useSmartInsights';

import AiConfirmationModal from '../components/AiConfirmationModal';

const { width } = Dimensions.get('window');

interface StatCardProps {
  title: string;
  amount: number;
  icon: keyof typeof Ionicons.glyphMap;
  colors: string[];
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  isPercentage?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, amount, icon, colors, change, trend, isPercentage = false }) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);

  const formatValue = (value: number) => {
    if (isPercentage) {
      return `${value.toFixed(1)}%`;
    }
    return formatCurrency(value);
  };

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
    <View style={styles.statCard}>
      <LinearGradient colors={colors} style={styles.statCardGradient}>
        <View style={styles.statCardHeader}>
          <View style={styles.statCardIconContainer}>
            <Ionicons name={icon} size={18} color="#FFFFFF" />
          </View>
        </View>
        
        <View style={styles.statCardContent}>
          <Text style={styles.statCardTitle}>{title}</Text>
          <Text style={styles.statCardAmount}>{formatValue(amount)}</Text>
          {change && (
            <View style={styles.changeContainer}>
              <Ionicons 
                name={getTrendIcon() as keyof typeof Ionicons.glyphMap} 
                size={10} 
                color="rgba(255, 255, 255, 0.9)" 
              />
              <Text style={styles.changeText}>{change}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [runningBalance, setRunningBalance] = useState<RunningBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [aiData, setAiData] = useState<AiResponse | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const { insights, isLoading: insightsLoading } = useSmartInsights();

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
      // Use mock data if API fails
      setMonthlySummary({
        year: currentYear,
        month: currentMonth,
        total_income: 5000,
        total_expenses: 3200,
        net_balance: 1800
      });
      setRunningBalance({ total_balance: 15000 });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleVoiceRecording = (aiResponse: AiResponse) => {
    setAiData(aiResponse);
    setIsProcessingVoice(false);
  };

  const handleModalClose = () => {
    setAiData(null);
  };

  const handleExpenseSuccess = () => {
    loadDashboardData();
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return 'trending-up'
      case 'warning': return 'warning'
      case 'success': return 'checkmark-circle'
      case 'info': return 'information-circle'
      default: return 'bulb'
    }
  };

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
      }>

      <View style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              title="Net Worth"
              amount={runningBalance?.total_balance ?? 0}
              icon="wallet"
              colors={['#10B981', '#059669']}
              change="+5.2%"
              trend="up"
            />
            <StatCard
              title="Monthly Income"
              amount={monthlySummary?.total_income ?? 0}
              icon="trending-up"
              colors={['#3B82F6', '#1E40AF']}
              change="+12.3%"
              trend="up"
            />
          </View>
          
          <View style={styles.statsRow}>
            <StatCard
              title="Monthly Expenses"
              amount={monthlySummary?.total_expenses ?? 0}
              icon="trending-down"
              colors={['#EF4444', '#DC2626']}
              change="-3.1%"
              trend="down"
            />
            <StatCard
              title="Savings Rate"
              amount={savingsRate}
              icon="trophy"
              colors={['#8B5CF6', '#7C3AED']}
              change="Target: 20%"
              trend="neutral"
              isPercentage={true}
            />
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionCard} onPress={() => setShowExpenseModal(true)}>
                <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionGradient}>
                  <Ionicons name="add-circle" size={32} color="#FFFFFF" />
                  <Text style={styles.actionText}>Add Expense</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard} onPress={() => setShowIncomeModal(true)}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.actionGradient}>
                  <Ionicons name="cash" size={32} color="#FFFFFF" />
                  <Text style={styles.actionText}>Add Income</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            

          </View>
        </View>

        {/* Smart Insights */}
        <View style={styles.smartInsights}>
          <Text style={styles.sectionTitle}>Smart Insights</Text>
          {insightsLoading ? (
            <View style={styles.insightCard}>
              <View style={styles.loadingInsight}>
                <View style={styles.loadingDot} />
                <Text style={styles.loadingText}>Analyzing your data...</Text>
              </View>
            </View>
          ) : (
            insights.map((insight, index) => (
              <View key={index} style={[styles.insightCard, styles[`insight${insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}`]]}>
                <View style={styles.insightHeader}>
                  <View style={[styles.insightIcon, styles[`icon${insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}`]]}>
                    <Ionicons 
                      name={getInsightIcon(insight.type)} 
                      size={16} 
                      color="#FFFFFF" 
                    />
                  </View>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                </View>
                <Text style={styles.insightMessage}>{insight.message}</Text>
                {insight.confidence && (
                  <View style={styles.confidenceBar}>
                    <View style={styles.confidenceLabel}>
                      <Text style={styles.confidenceText}>Confidence: {Math.round(insight.confidence * 100)}%</Text>
                    </View>
                    <View style={styles.confidenceProgress}>
                      <View style={[styles.confidenceFill, { width: `${insight.confidence * 100}%` }]} />
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </View>
      
      <QuickAddModal
        isVisible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSuccess={loadDashboardData}
        initialType="expense"
        hideTypeSelector={true}
      />
      
      <QuickAddModal
        isVisible={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onSuccess={loadDashboardData}
        initialType="income"
        hideTypeSelector={true}
      />
      

      
      {/* AI Confirmation Modal */}
      <AiConfirmationModal 
        aiData={aiData}
        onClose={handleModalClose}
        onSuccess={handleExpenseSuccess}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  statsGrid: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
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
  statCardGradient: {
    borderRadius: 16,
    padding: 12,
    height: 120,
    justifyContent: 'space-between',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  statCardTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    lineHeight: 12,
  },
  statCardIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardContent: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 0,
  },
  statCardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
    lineHeight: 22,
    flexShrink: 1,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 12,
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
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
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
  actionGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  smartInsights: {
    marginBottom: 20,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  insightPrediction: {
    borderLeftColor: '#3B82F6',
  },
  insightWarning: {
    borderLeftColor: '#F59E0B',
  },
  insightSuccess: {
    borderLeftColor: '#10B981',
  },
  insightInfo: {
    borderLeftColor: '#8B5CF6',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconPrediction: {
    backgroundColor: '#3B82F6',
  },
  iconWarning: {
    backgroundColor: '#F59E0B',
  },
  iconSuccess: {
    backgroundColor: '#10B981',
  },
  iconInfo: {
    backgroundColor: '#8B5CF6',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  insightMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  confidenceBar: {
    marginTop: 8,
  },
  confidenceLabel: {
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  confidenceProgress: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  loadingInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginRight: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },

});

export default DashboardScreen;