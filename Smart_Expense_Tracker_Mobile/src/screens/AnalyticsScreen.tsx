import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { getHistoricalSummary, getExpenses, getCategoryBreakdown, getSpendingTrends, getAnalyticsStats } from '../services/apiService';
import { useCurrency } from '../context/CurrencyContext';
import { HistoricalDataPoint, Expense, CategoryBreakdown, SpendingTrend, AnalyticsStats } from '../types';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const { formatCurrency } = useCurrency();
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '1y'>('6m');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      const months = selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12;
      const [historical, expenseData, categoryBreakdown, stats] = await Promise.all([
        getHistoricalSummary(months),
        getExpenses(),
        getCategoryBreakdown(months),
        getAnalyticsStats(),
      ]);
      
      setHistoricalData(historical);
      setExpenses(expenseData);
      setCategoryData(categoryBreakdown);
      setAnalyticsStats(stats);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const getSpendingTrendData = () => {
    const months = selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12;
    const data = historicalData.slice(-months);
    return {
      labels: data.map(item => 
        new Date(item.year, item.month - 1).toLocaleDateString('en-US', { month: 'short' })
      ),
      datasets: [
        {
          data: data.map(item => item.total_expenses),
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          strokeWidth: 3,
        },
        {
          data: data.map(item => item.total_income),
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 3,
        },
      ],
      legend: ['Expenses', 'Income'],
    };
  };



  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#3B82F6',
    },
  };



  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  const trendData = getSpendingTrendData();
  const pieChartData = categoryData.map(item => ({
    name: item.category,
    population: item.amount,
    color: item.color,
    legendFontColor: '#6B7280',
    legendFontSize: 12,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Insights into your spending patterns</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Spending Trend Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Spending Trend</Text>
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === '3m' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('3m')}
              >
                <Text style={[styles.periodButtonText, selectedPeriod === '3m' && styles.periodButtonTextActive]}>
                  3M
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === '6m' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('6m')}
              >
                <Text style={[styles.periodButtonText, selectedPeriod === '6m' && styles.periodButtonTextActive]}>
                  6M
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === '1y' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('1y')}
              >
                <Text style={[styles.periodButtonText, selectedPeriod === '1y' && styles.periodButtonTextActive]}>
                  1Y
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {trendData.labels.length > 0 && (
            <LineChart
              data={trendData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          )}
        </View>

        {/* Category Breakdown */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Category Breakdown</Text>
          {pieChartData.length > 0 && (
            <View>
              <PieChart
                data={pieChartData.map(item => ({ ...item, name: '' }))}
                width={width - -180}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                hasLegend={false}
                style={styles.chart}
              />
              <View style={styles.legendContainer}>
                {categoryData.map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.category}</Text>
                    <Text style={styles.legendValue}>{formatCurrency(item.amount)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.statGradient}>
                <Ionicons name="trending-down" size={24} color="#FFFFFF" />
                <Text style={styles.statValue}>
                  {formatCurrency(analyticsStats?.total_expenses || 0)}
                </Text>
                <Text style={styles.statLabel}>Total Expenses</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.statGradient}>
                <Ionicons name="calendar" size={24} color="#FFFFFF" />
                <Text style={styles.statValue}>
                  {formatCurrency(analyticsStats?.daily_average || 0)}
                </Text>
                <Text style={styles.statLabel}>Daily Average</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.statGradient}>
                <Ionicons name="pie-chart" size={24} color="#FFFFFF" />
                <Text style={styles.statValue}>
                  {analyticsStats?.top_category || 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Top Category</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.statGradient}>
                <Ionicons name="receipt" size={24} color="#FFFFFF" />
                <Text style={styles.statValue}>{analyticsStats?.transaction_count || 0}</Text>
                <Text style={styles.statLabel}>Transactions</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
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
  statGradient: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  savingsRateContainer: {
    marginVertical: 10,
    marginHorizontal: 20,
  },
  savingsRateCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  savingsRateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  savingsRateText: {
    marginLeft: 16,
  },
  savingsRateValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  savingsRateLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  savingsRateDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
  },
  legendContainer: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
});

export default AnalyticsScreen;