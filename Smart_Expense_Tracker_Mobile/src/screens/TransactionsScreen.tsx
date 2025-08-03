import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getExpenses, getIncomes } from '../services/apiService';
import { Expense, Income } from '../types';

interface TransactionItemProps {
  item: Expense | Income;
  type: 'expense' | 'income';
}

const TransactionItem: React.FC<TransactionItemProps> = ({ item, type }) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      'Food': 'restaurant',
      'Transportation': 'car',
      'Entertainment': 'game-controller',
      'Shopping': 'bag',
      'Bills': 'receipt',
      'Healthcare': 'medical',
      'Salary': 'cash',
      'Freelance': 'laptop',
      'Investment': 'trending-up',
      'Other': 'ellipsis-horizontal',
    };
    return iconMap[category] || 'ellipsis-horizontal';
  };

  return (
    <View style={styles.transactionItem}>
      <View style={[
        styles.categoryIcon, 
        { backgroundColor: type === 'expense' ? '#FEE2E2' : '#D1FAE5' }
      ]}>
        <Ionicons 
          name={getCategoryIcon(item.category)} 
          size={20} 
          color={type === 'expense' ? '#EF4444' : '#10B981'} 
        />
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionCategory}>{item.category}</Text>
        <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      
      <Text style={[
        styles.transactionAmount,
        { color: type === 'expense' ? '#EF4444' : '#10B981' }
      ]}>
        {type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
      </Text>
    </View>
  );
};

const TransactionsScreen = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'expenses' | 'incomes'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const [expenseData, incomeData] = await Promise.all([
        getExpenses(),
        getIncomes(),
      ]);
      
      setExpenses(expenseData);
      setIncomes(incomeData);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const getFilteredTransactions = () => {
    let transactions: Array<{ item: Expense | Income; type: 'expense' | 'income' }> = [];
    
    if (filter === 'all' || filter === 'expenses') {
      transactions = [...transactions, ...expenses.map(expense => ({ item: expense, type: 'expense' as const }))];
    }
    
    if (filter === 'all' || filter === 'incomes') {
      transactions = [...transactions, ...incomes.map(income => ({ item: income, type: 'income' as const }))];
    }
    
    return transactions.sort((a, b) => new Date(b.item.date).getTime() - new Date(a.item.date).getTime());
  };

  const FilterButton: React.FC<{ 
    title: string; 
    value: 'all' | 'expenses' | 'incomes'; 
    isActive: boolean; 
    onPress: () => void;
  }> = ({ title, value, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Transactions</Text>
        <Text style={styles.headerSubtitle}>Track your income and expenses</Text>
        
        <View style={styles.filterContainer}>
          <FilterButton
            title="All"
            value="all"
            isActive={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterButton
            title="Expenses"
            value="expenses"
            isActive={filter === 'expenses'}
            onPress={() => setFilter('expenses')}
          />
          <FilterButton
            title="Income"
            value="incomes"
            isActive={filter === 'incomes'}
            onPress={() => setFilter('incomes')}
          />
        </View>
      </LinearGradient>

      <FlatList
        data={getFilteredTransactions()}
        keyExtractor={(item, index) => `${item.type}-${item.item.id}-${index}`}
        renderItem={({ item }) => (
          <TransactionItem item={item.item} type={item.type} />
        )}
        style={styles.transactionsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>Start by adding your first transaction</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab}>
        <LinearGradient colors={['#3B82F6', '#1E40AF']} style={styles.fabGradient}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
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
    paddingTop: 50,
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
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TransactionsScreen;