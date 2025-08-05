import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { createExpense, createIncome } from '../services/apiService';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import CategoryPicker from './CategoryPicker';
import SourcePicker from './SourcePicker';
import SuccessModal from './SuccessModal';

interface QuickAddModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialType?: 'expense' | 'income';
  hideTypeSelector?: boolean;
}

const EXPENSE_CATEGORIES = [
  'Food & Drinks',
  'Transport',
  'Utilities',
  'Shopping',
  'Electronics & Gadgets',
  'Healthcare',
  'Education',
  'Rent',
  'Bills',
  'Entertainment',
  'Investments',
  'Personal Care',
  'Family & Kids',
  'Charity & Donations',
  'Miscellaneous'
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance', 
  'Investment',
  'Business',
  'Gift',
  'Other'
];

const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isVisible,
  onClose,
  onSuccess,
  initialType = 'expense',
  hideTypeSelector = false
}) => {
  const { selectedCurrency } = useCurrency();
  const { theme, isDarkMode } = useTheme();
  const [type, setType] = useState<'expense' | 'income'>(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  React.useEffect(() => {
    if (type === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setCategory('Salary'); // Default income source
    }
  }, [type]);

  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (!category) {
      Alert.alert('Missing Category', 'Please select a category.');
      return;
    }

    setIsCreating(true);
    try {
      if (type === 'expense') {
        await createExpense({
          amount: numericAmount,
          category,
          description,
        });
      } else {
        await createIncome({
          amount: numericAmount,
          category,
          description,
        });
      }
      
      // Show success modal
      setShowSuccessModal(true);
      onSuccess?.();
      
      // Reset form
      setAmount('');
      setDescription('');
      setCategory(type === 'expense' ? EXPENSE_CATEGORIES[0] : 'Salary');
      
      // Close main modal after a short delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error(`Failed to create ${type}:`, error);
      Alert.alert('Error', `Failed to add ${type}. Please try again.`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropOpacity={0.5}
    >
      <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
        {/* Header */}
        <View style={[styles.header, { 
          backgroundColor: isDarkMode ? '#1F2937' : '#3B82F6',
          borderBottomColor: theme.colors.border 
        }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, type === 'expense' ? styles.expenseIcon : styles.incomeIcon]}>
              <Ionicons name={type === 'expense' ? 'remove-circle' : 'add-circle'} size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={[styles.title, { color: '#FFFFFF' }]}>Add {type === 'expense' ? 'Expense' : 'Income'}</Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#D1D5DB' : '#E0E7FF' }]}>Track your {type}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Type Selector */}
          {!hideTypeSelector && (
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
                  onPress={() => setType('expense')}
                >
                  <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
                  onPress={() => setType('income')}
                >
                  <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
                    Income
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Amount Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Amount</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor={theme.colors.textSecondary}
              />
              <Text style={styles.currency}>{selectedCurrency.code}</Text>
            </View>
          </View>

          {/* Category/Source Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {type === 'expense' ? 'Category' : 'Source'}
            </Text>
            {type === 'expense' ? (
              <CategoryPicker
                selectedCategory={category}
                onCategorySelect={setCategory}
              />
            ) : (
              <SourcePicker
                selectedSource={category}
                onSourceSelect={setCategory}
              />
            )}
          </View>

          {/* Description Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 48 }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
            />
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.saveButton, isCreating && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={isCreating}
          >
            {isCreating ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="hourglass" size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Adding...</Text>
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Add {type === 'expense' ? 'Expense' : 'Income'}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Success Modal */}
      <SuccessModal
        isVisible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type={type}
        amount={parseFloat(amount) || 0}
        category={category}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 20,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  expenseIcon: {
    backgroundColor: '#EF4444',
  },
  incomeIcon: {
    backgroundColor: '#10B981',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1F2937',
  },
  currency: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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
    backgroundColor: '#FFFFFF',
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
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});



export default QuickAddModal;