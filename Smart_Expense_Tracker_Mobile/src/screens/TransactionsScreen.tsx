import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  SafeAreaView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { getExpenses, getIncomes, exportTransactionsPDF, exportFilteredTransactionsPDF } from '../services/apiService';
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
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [isExporting, setIsExporting] = useState(false);
  
  const categories = ['Food & Drinks', 'Transport', 'Shopping', 'Entertainment', 'Bills & Fees', 'Healthcare', 'Education', 'Salary', 'Freelance', 'Investment', 'Other'];

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
    
    // Apply filters
    return transactions
      .filter(transaction => {
        // Search filter
        if (searchText) {
          const searchLower = searchText.toLowerCase();
          const matchesDescription = transaction.item.description.toLowerCase().includes(searchLower);
          const matchesCategory = transaction.item.category.toLowerCase().includes(searchLower);
          if (!matchesDescription && !matchesCategory) return false;
        }
        
        // Category filter
        if (selectedCategory && transaction.item.category !== selectedCategory) {
          return false;
        }
        
        // Date range filter
        if (dateRange.start || dateRange.end) {
          const transactionDate = new Date(transaction.item.date);
          if (dateRange.start && transactionDate < new Date(dateRange.start)) return false;
          if (dateRange.end && transactionDate > new Date(dateRange.end)) return false;
        }
        
        return true;
      })
      .sort((a, b) => new Date(b.item.date).getTime() - new Date(a.item.date).getTime());
  };
  
  const generatePDF = async (transactions: any[], title: string, filters?: any) => {
    const formatCurrency = (amount: number, type: string) => 
      type === 'expense' ? `-$${amount.toFixed(2)}` : `+$${amount.toFixed(2)}`;
    
    let html = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        h1 { color: #3B82F6; text-align: center; margin-bottom: 10px; }
        .subtitle { text-align: center; color: #6B7280; margin-bottom: 20px; }
        .filters { background: #F3F4F6; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3B82F6; }
        .summary { background: #F8FAFC; padding: 15px; margin: 15px 0; border-radius: 8px; display: flex; justify-content: space-around; }
        .summary-item { text-align: center; }
        .summary-label { font-size: 12px; color: #6B7280; margin-bottom: 5px; }
        .summary-value { font-size: 16px; font-weight: bold; }
        .income { color: #10B981; }
        .expense { color: #EF4444; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #3B82F6; color: white; padding: 12px 8px; text-align: left; font-weight: bold; }
        td { border: 1px solid #E5E7EB; padding: 10px 8px; }
        tr:nth-child(even) { background-color: #F9FAFB; }
        .amount-cell { text-align: right; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Smart Expense Tracker</h1>
      <div class="subtitle">${title}</div>
      <p style="text-align: center; color: #6B7280;">Generated: ${new Date().toLocaleString()}</p>`;
    
    if (filters) {
      html += '<div class="filters"><strong>Applied Filters:</strong><br>';
      if (filters.search) html += `🔍 Search: ${filters.search}<br>`;
      if (filters.category) html += `📂 Category: ${filters.category}<br>`;
      if (filters.startDate) html += `📅 From: ${filters.startDate}<br>`;
      if (filters.endDate) html += `📅 To: ${filters.endDate}<br>`;
      html += `📊 Type: ${filters.type || 'All'}</div>`;
    }
    
    // Calculate summary
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.item.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.item.amount, 0);
    const netAmount = totalIncome - totalExpenses;
    
    html += `
      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Total Income</div>
          <div class="summary-value income">+$${totalIncome.toFixed(2)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Expenses</div>
          <div class="summary-value expense">-$${totalExpenses.toFixed(2)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Net Amount</div>
          <div class="summary-value ${netAmount >= 0 ? 'income' : 'expense'}">${netAmount >= 0 ? '+' : ''}$${netAmount.toFixed(2)}</div>
        </div>
      </div>
      <table>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Category</th>
          <th>Description</th>
          <th>Amount</th>
        </tr>`;
    
    transactions.forEach(transaction => {
      const item = transaction.item;
      const type = transaction.type;
      const date = new Date(item.date).toLocaleDateString();
      const amount = formatCurrency(item.amount, type);
      const className = type === 'expense' ? 'expense' : 'income';
      
      html += `
        <tr>
          <td>${date}</td>
          <td>${type.charAt(0).toUpperCase() + type.slice(1)}</td>
          <td>${item.category}</td>
          <td>${item.description}</td>
          <td class="amount-cell ${className}">${amount}</td>
        </tr>`;
    });
    
    html += '</table></body></html>';
    
    try {
      const { uri } = await Print.printToFileAsync({ html });
      
      // Save to app's document directory (always writable)
      const fileName = `transaction_report_${new Date().toISOString().split('T')[0]}.pdf`;
      const localUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.copyAsync({ from: uri, to: localUri });
      console.log('PDF saved to app directory:', localUri);
      
      Alert.alert(
        'PDF Generated Successfully! 📄', 
        `Your transaction report has been saved to device storage as ${fileName}. Would you like to share it?`,
        [
          { text: 'Just Save', style: 'cancel' },
          { 
            text: 'Share', 
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(localUri, {
                  mimeType: 'application/pdf',
                  dialogTitle: 'Share Transaction Report'
                });
              } else {
                Alert.alert('Sharing not available', 'PDF saved to device storage.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    Alert.alert('Export Started', 'Generating PDF report...');
    try {
      const filteredTransactions = getFilteredTransactions();
      if (filteredTransactions.length === 0) {
        Alert.alert('No Data', 'No transactions to export. Please add some transactions first.');
        return;
      }
      await generatePDF(filteredTransactions, 'Transaction Report');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportFiltered = async () => {
    setIsExporting(true);
    Alert.alert('Export Started', 'Generating filtered PDF report...');
    try {
      const filteredTransactions = getFilteredTransactions();
      if (filteredTransactions.length === 0) {
        Alert.alert('No Data', 'No transactions match your filters. Please adjust your filters and try again.');
        return;
      }
      const filters = {
        search: searchText,
        category: selectedCategory,
        startDate: dateRange.start,
        endDate: dateRange.end,
        type: filter
      };
      await generatePDF(filteredTransactions, 'Filtered Transaction Report', filters);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Failed to export filtered PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setDateRange({ start: '', end: '' });
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Transactions</Text>
            <Text style={styles.headerSubtitle}>Track your income and expenses</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowFilters(true)}>
              <Ionicons name="filter" size={20} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, isExporting && styles.actionButtonDisabled]} 
              onPress={handleExportPDF}
              disabled={isExporting}
            >
              <Ionicons name="download" size={20} color={isExporting ? '#9CA3AF' : '#F59E0B'} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={16} color="#6B7280" />
            </TouchableOpacity>
          ) : null}
        </View>
        
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
      
      {/* Advanced Filters Modal */}
      <Modal
        isVisible={showFilters}
        onBackdropPress={() => setShowFilters(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Advanced Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {/* Category Filter */}
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              <TouchableOpacity
                style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                onPress={() => setSelectedCategory('')}
              >
                <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>All</Text>
              </TouchableOpacity>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[styles.categoryChipText, selectedCategory === category && styles.categoryChipTextActive]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Date Range Filter */}
            <Text style={styles.filterLabel}>Date Range</Text>
            <View style={styles.dateRangeContainer}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>From</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  value={dateRange.start}
                  onChangeText={(text) => setDateRange(prev => ({ ...prev, start: text }))}
                />
              </View>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>To</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  value={dateRange.end}
                  onChangeText={(text) => setDateRange(prev => ({ ...prev, end: text }))}
                />
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.exportButton, isExporting && styles.exportButtonDisabled]} 
              onPress={handleExportFiltered}
              disabled={isExporting}
            >
              <Text style={styles.exportButtonText}>
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={() => setShowFilters(false)}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 100,
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#1F2937',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 16,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  dateInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  applyButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
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
    zIndex: 1,
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