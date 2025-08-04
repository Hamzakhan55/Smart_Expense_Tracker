import React, { useState, useEffect } from 'react';
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
import { AiResponse } from '../types';
import { createExpense } from '../services/apiService';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

interface AiConfirmationModalProps {
  aiData: AiResponse | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const EXPENSE_CATEGORIES = [
  'Food & Drinks',
  'Transport', 
  'Shopping',
  'Entertainment',
  'Bills & Fees',
  'Healthcare',
  'Education',
  'Other'
];

const AiConfirmationModal: React.FC<AiConfirmationModalProps> = ({
  aiData,
  onClose,
  onSuccess
}) => {
  const { selectedCurrency } = useCurrency();
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (aiData) {
      // Better amount handling
      setAmount(aiData.amount > 0 ? String(aiData.amount) : '');
      setDescription(aiData.description || '');
      
      // Enhanced category matching
      const matchedCategory = EXPENSE_CATEGORIES.find(cat => 
        cat.toLowerCase() === aiData.category.toLowerCase() ||
        cat.toLowerCase().includes(aiData.category.toLowerCase()) ||
        aiData.category.toLowerCase().includes(cat.toLowerCase())
      );
      setCategory(matchedCategory || aiData.category || '');
    }
  }, [aiData]);

  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setIsCreating(true);
    try {
      await createExpense({
        amount: numericAmount,
        category,
        description,
      });
      
      Alert.alert('Success', 'Expense saved successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create expense:', error);
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      isVisible={!!aiData}
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropOpacity={0.5}
    >
      <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="sparkles" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {aiData?.description === 'Voice recorded - please verify details' ? 'Voice Recorded' : 'AI Expense Detected'}
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {aiData?.description === 'Voice recorded - please verify details' 
                  ? 'Please enter your expense details'
                  : 'Review and confirm the details'
                }
              </Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* AI Detection Warning */}
          {aiData && (aiData.amount === 0 || !aiData.amount) && (
            <View style={[styles.warningContainer, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
              <Ionicons name="warning" size={16} color="#F59E0B" />
              <Text style={[styles.warningText, { color: '#92400E' }]}>
                {aiData.description === 'Voice recorded - please verify details' 
                  ? 'Voice recorded successfully - please enter the expense details manually'
                  : 'Please verify the amount - AI couldn\'t detect it clearly'
                }
              </Text>
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

          {/* Category Field */}
          <View style={[styles.fieldContainer, { position: 'relative' }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
            <TouchableOpacity 
              style={[styles.dropdownContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text style={[styles.dropdownText, { color: category ? theme.colors.text : theme.colors.textSecondary }]}>
                {category || 'Select category'}
              </Text>
              <Ionicons name={showCategoryDropdown ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {showCategoryDropdown && (
              <ScrollView style={[styles.dropdownOptions, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} nestedScrollEnabled>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownOptionText, { color: theme.colors.text }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Description Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
            <TextInput
              style={[styles.descriptionInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="What was this expense for?"
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
                <Text style={styles.saveButtonText}>Saving...</Text>
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Expense</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    flexShrink: 0,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingRight: 16,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1F2937',
    paddingHorizontal: 16,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
  },
  descriptionInput: {
    height: 80,
    fontSize: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  currency: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  dropdownOptions: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 160,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
    minHeight: 44,
    justifyContent: 'center',
  },
  dropdownOptionText: {
    fontSize: 16,
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
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    flex: 1,
  },
});

export default AiConfirmationModal;