import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { createExpense, createIncome } from '../services/apiService';

interface QuickAddModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: 'expense' | 'income';
  hideTypeSelector?: boolean;
}

const categories = [
  'Food & Drinks', 'Transport', 'Shopping', 'Entertainment', 
  'Bills & Fees', 'Healthcare', 'Education', 'Other'
];

const incomeSources = [
  'Salary', 'Freelance', 'Business', 'Investment', 
  'Rental', 'Gift', 'Bonus', 'Other'
];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isVisible, onClose, onSuccess, initialType = 'expense', hideTypeSelector = false }) => {
  const [type, setType] = useState<'expense' | 'income'>(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    setShowCategories(false);
  };

  // Reset type when modal opens
  React.useEffect(() => {
    if (isVisible) {
      setType(initialType);
    }
  }, [isVisible, initialType]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!amount || !description || !category) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const data = {
        amount: parseFloat(amount),
        description,
        category,
      };

      if (type === 'expense') {
        await createExpense(data);
      } else {
        await createIncome(data);
      }

      Alert.alert('Success', `${type === 'expense' ? 'Expense' : 'Income'} added successfully`);
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      style={styles.modal}
      backdropOpacity={0.7}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.title}>
              {type === 'expense' ? 'Add Expense' : 'Add Income'}
            </Text>
            <Text style={styles.subtitle}>Add transactions instantly</Text>
          </View>
        </View>

        {!hideTypeSelector && (
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
              onPress={() => setType('expense')}
            >
              <Ionicons name="remove-circle" size={20} color="#FFFFFF" />
              <Text style={styles.typeButtonText}>Expense</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.typeButton, type === 'income' && styles.typeButtonIncome]}
              onPress={() => setType('income')}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.typeButtonText}>Income</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.amountContainer}>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor="#6B7280"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Text style={styles.currencyText}>PKR</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Description"
          placeholderTextColor="#6B7280"
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => setShowCategories(!showCategories)}
        >
          <Ionicons name="pricetag" size={20} color="#6B7280" />
          <Text style={[styles.categoryButtonText, category && styles.categorySelected]}>
            {category || (type === 'income' ? 'Select a source' : 'Select a category')}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>

        {showCategories && (
          <View style={styles.categoriesContainer}>
            {(type === 'income' ? incomeSources : categories).map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.categoryItem}
                onPress={() => {
                  setCategory(item);
                  setShowCategories(false);
                }}
              >
                <Text style={styles.categoryItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient colors={['#3B82F6', '#1E40AF']} style={styles.submitGradient}>
            <Text style={styles.submitButtonText}>
              {loading ? 'Adding...' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    margin: 20,
  },
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#EF4444',
  },
  typeButtonIncome: {
    backgroundColor: '#10B981',
  },
  typeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  amountInput: {
    flex: 1,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  categoryButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#6B7280',
  },
  categorySelected: {
    color: '#FFFFFF',
  },
  categoriesContainer: {
    backgroundColor: '#374151',
    borderRadius: 12,
    marginBottom: 16,
    maxHeight: 200,
  },
  categoryItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuickAddModal;