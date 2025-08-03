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
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getBudgets, createOrUpdateBudget, getExpenses, deleteBudget } from '../services/apiService';
import { Budget, BudgetCreate, Expense } from '../types';
import BudgetProgressCard from '../components/BudgetProgressCard';
import BudgetSummary from '../components/BudgetSummary';
import CategoryPicker from '../components/CategoryPicker';

const { width } = Dimensions.get('window');



const BudgetsScreen = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({ category: '', amount: '' });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [budgetData, expenseData] = await Promise.all([
        getBudgets(currentYear, currentMonth),
        getExpenses()
      ]);
      setBudgets(budgetData);
      setExpenses(expenseData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getSpentAmount = (category: string) => {
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === currentMonth && 
             expenseDate.getFullYear() === currentYear &&
             expense.category === category;
    });
    return currentMonthExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const handleCreateBudget = () => {
    setEditingBudget(null);
    setFormData({ category: '', amount: '' });
    setShowCreateModal(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({ category: budget.category, amount: budget.amount.toString() });
    setShowCreateModal(true);
  };

  const handleSaveBudget = async () => {
    if (!formData.category.trim() || !formData.amount.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const budgetData: BudgetCreate = {
        category: formData.category.trim(),
        amount,
        year: currentYear,
        month: currentMonth,
      };

      await createOrUpdateBudget(budgetData);
      setShowCreateModal(false);
      await loadData();
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget');
    }
  };

  const handleDeleteBudget = (budget: Budget) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete the ${budget.category} budget?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget(budget.id);
              await loadData();
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Budgets...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#E2E8F0']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Budgets</Text>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity style={styles.setNewBudgetButton} onPress={handleCreateBudget}>
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.setNewBudgetText}>Set New Budget</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <BudgetSummary budgets={budgets} getSpentAmount={getSpentAmount} />
        
        {budgets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No budgets set</Text>
            <Text style={styles.emptySubtext}>Create your first budget to start tracking</Text>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateBudget}>
              <LinearGradient colors={['#3B82F6', '#1E40AF']} style={styles.createButtonGradient}>
                <Text style={styles.createButtonText}>Create Budget</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.budgetsList}>
            {budgets.map((budget) => (
              <BudgetProgressCard
                key={budget.id}
                budget={budget}
                spent={getSpentAmount(budget.category)}
                onPress={() => handleEditBudget(budget)}
                onLongPress={() => handleDeleteBudget(budget)}
              />
            ))}
          </View>
        )}
      </ScrollView>



      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingBudget ? 'Edit Budget' : 'Create Budget'}
            </Text>
            <TouchableOpacity onPress={handleSaveBudget}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <CategoryPicker
                selectedCategory={formData.category}
                onCategorySelect={(category) => setFormData({ ...formData, category })}
                disabled={!!editingBudget}
              />
              {editingBudget && (
                <Text style={styles.helperText}>Category cannot be changed when editing</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Budget Amount</Text>
              <TextInput
                style={styles.textInput}
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                placeholder="Enter budget amount"
                keyboardType="numeric"
              />
            </View>
          </View>
        </SafeAreaView>
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
  },
  content: {
    flex: 1,
    paddingBottom: 100,
  },
  budgetsList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    marginBottom: 24,
  },
  createButton: {
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
  createButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setNewBudgetButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  setNewBudgetText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default BudgetsScreen;