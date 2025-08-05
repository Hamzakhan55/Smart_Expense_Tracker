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
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { Budget, BudgetCreate, Expense } from '../types';
import BudgetProgressCard from '../components/BudgetProgressCard';
import BudgetSummary from '../components/BudgetSummary';
import CategoryPicker from '../components/CategoryPicker';

const { width } = Dimensions.get('window');



const BudgetsScreen = () => {
  const { formatCurrency } = useCurrency();
  const { theme } = useTheme();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({ category: '', amount: '' });
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setSelectedBudget(budget);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedBudget) return;
    
    setIsDeleting(true);
    try {
      await deleteBudget(selectedBudget.id);
      Alert.alert('Success', 'Budget deleted successfully!');
      setShowDeleteModal(false);
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete budget. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBudgetPress = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowOptionsModal(true);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading Budgets...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.gradients.background}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Budgets</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
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
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>No budgets set</Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>Create your first budget to start tracking</Text>
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
                onPress={() => handleBudgetPress(budget)}
              />
            ))}
          </View>
        )}
      </ScrollView>



      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalPopup, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.headerLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="wallet" size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                    {editingBudget ? 'Edit Budget' : 'Create Budget'}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>Set your spending limit</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Category</Text>
              <CategoryPicker
                selectedCategory={formData.category}
                onCategorySelect={(category) => setFormData({ ...formData, category })}
                disabled={!!editingBudget}
              />
              {editingBudget && (
                <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>Category cannot be changed when editing</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Budget Amount</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                placeholder="Enter budget amount"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCreateModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveBudget}>
                <Text style={styles.saveButtonText}>Save Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Budget Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <View style={styles.optionsOverlay}>
          <View style={[styles.optionsModalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.optionsHeader}>
              <View style={[styles.optionsIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="wallet" size={24} color="#F59E0B" />
              </View>
              <View style={styles.optionsInfo}>
                <Text style={[styles.optionsTitle, { color: theme.colors.text }]}>Budget Options</Text>
                <Text style={[styles.optionsSubtitle, { color: theme.colors.textSecondary }]}>
                  {selectedBudget?.category}
                </Text>
              </View>
            </View>
            
            <View style={styles.optionsButtons}>
              <TouchableOpacity 
                style={[styles.optionButton, styles.editButton]}
                onPress={() => {
                  setShowOptionsModal(false);
                  if (selectedBudget) {
                    handleEditBudget(selectedBudget);
                  }
                }}
              >
                <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                <Text style={styles.optionButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.optionButton, styles.deleteButton]}
                onPress={() => {
                  setShowOptionsModal(false);
                  setTimeout(() => {
                    if (selectedBudget) {
                      handleDeleteBudget(selectedBudget);
                    }
                  }, 200);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                <Text style={styles.optionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.cancelOptionButton, { borderColor: theme.colors.border }]}
              onPress={() => setShowOptionsModal(false)}
            >
              <Text style={[styles.cancelOptionText, { color: theme.colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setShowDeleteModal(false)}
      >
        <View style={styles.deleteOverlay}>
          <View style={[styles.deleteModalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.deleteHeader}>
              <View style={styles.deleteIconContainer}>
                <Ionicons name="warning" size={32} color="#EF4444" />
              </View>
              <Text style={[styles.deleteTitle, { color: theme.colors.text }]}>Delete Budget</Text>
              <Text style={[styles.deleteSubtitle, { color: theme.colors.textSecondary }]}>
                This action cannot be undone
              </Text>
            </View>

            <View style={[styles.deleteBudgetInfo, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[styles.deleteBudgetIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="wallet" size={20} color="#F59E0B" />
              </View>
              <View style={styles.deleteBudgetDetails}>
                <Text style={[styles.deleteBudgetCategory, { color: theme.colors.text }]}>
                  {selectedBudget?.category}
                </Text>
                <Text style={[styles.deleteBudgetAmount, { color: '#F59E0B' }]}>
                  {formatCurrency(selectedBudget?.amount || 0)}
                </Text>
              </View>
            </View>

            <View style={styles.deleteButtons}>
              <TouchableOpacity 
                style={[styles.deleteCancelButton, { borderColor: theme.colors.border }]} 
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                <Text style={[styles.deleteCancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.deleteConfirmButton, isDeleting && styles.deleteConfirmButtonDisabled]} 
                onPress={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <View style={styles.deleteLoadingContainer}>
                    <Ionicons name="hourglass" size={18} color="#FFFFFF" />
                    <Text style={styles.deleteConfirmText}>Deleting...</Text>
                  </View>
                ) : (
                  <View style={styles.deleteLoadingContainer}>
                    <Ionicons name="trash" size={18} color="#FFFFFF" />
                    <Text style={styles.deleteConfirmText}>Delete</Text>
                  </View>
                )}
              </TouchableOpacity>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalPopup: {
    width: '100%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  modalContent: {
    padding: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  optionsModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  optionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  optionsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionsInfo: {
    flex: 1,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionsSubtitle: {
    fontSize: 14,
  },
  optionsButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  optionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelOptionButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  deleteHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  deleteIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  deleteSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  deleteBudgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  deleteBudgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deleteBudgetDetails: {
    flex: 1,
  },
  deleteBudgetCategory: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deleteBudgetAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteConfirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteConfirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  deleteConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  deleteLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default BudgetsScreen;