import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { Expense, Income } from '../types';
import CategoryPicker from './CategoryPicker';

interface EditTransactionModalProps {
  transaction: { item: Expense | Income; type: 'expense' | 'income' };
  onClose: () => void;
  onUpdate: (data: { amount: number; category: string; description: string }) => void;
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

const { width } = Dimensions.get('window');

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  onClose,
  onUpdate,
}) => {
  const { selectedCurrency } = useCurrency();
  const { theme } = useTheme();
  const [amount, setAmount] = useState(transaction.item.amount.toString());
  const [category, setCategory] = useState(transaction.item.category);
  const [description, setDescription] = useState(transaction.item.description);
  const [isUpdating, setIsUpdating] = useState(false);



  const handleUpdate = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;
    
    setIsUpdating(true);
    try {
      await onUpdate({
        amount: numericAmount,
        category,
        description,
      });
    } finally {
      setIsUpdating(false);
    }
  };



  return (
    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: transaction.type === 'expense' ? '#EF4444' : '#10B981' 
      }]}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={transaction.type === 'expense' ? 'remove-circle' : 'add-circle'} 
              size={24} 
              color="#FFFFFF" 
            />
          </View>
          <View>
            <Text style={styles.title}>Edit {transaction.type === 'expense' ? 'Expense' : 'Income'}</Text>
            <Text style={styles.subtitle}>Update transaction details</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Amount Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Amount</Text>
          <View style={[styles.inputContainer, { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border 
          }]}>
            <Ionicons name="cash" size={20} color={theme.colors.primary} style={styles.fieldIcon} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <Text style={[styles.currency, { color: theme.colors.primary }]}>
              {selectedCurrency.code}
            </Text>
          </View>
        </View>

        {/* Category Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
          <CategoryPicker
            selectedCategory={category}
            onCategorySelect={setCategory}
          />
        </View>

        {/* Description Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
          <View style={[styles.descriptionContainer, { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border 
          }]}>
            <Ionicons name="document-text" size={20} color={theme.colors.primary} style={styles.fieldIcon} />
            <TextInput
              style={[styles.descriptionInput, { color: theme.colors.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
          onPress={handleUpdate}
          disabled={isUpdating}
        >
          <View style={styles.loadingContainer}>
            <Ionicons name={isUpdating ? "hourglass" : "checkmark"} size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {isUpdating ? 'Updating...' : 'Update'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    borderRadius: 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  form: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  fieldContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  currency: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    top: 88,
    left: 0,
    right: 0,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownList: {
    maxHeight: 250,
    flex: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    minHeight: 50,
  },
  dropdownItemActive: {
    borderLeftWidth: 4,
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 4,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 60,
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

export default EditTransactionModal;