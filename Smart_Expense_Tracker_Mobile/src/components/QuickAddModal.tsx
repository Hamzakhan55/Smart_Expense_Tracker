import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { createExpense, createIncome } from '../services/apiService';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

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
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const dropdownAnim = React.useRef(new Animated.Value(0)).current;

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  React.useEffect(() => {
    setCategory(categories[0]);
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
      
      Alert.alert('Success', `${type === 'expense' ? 'Expense' : 'Income'} added successfully!`);
      onSuccess?.();
      onClose();
      
      // Reset form
      setAmount('');
      setDescription('');
      setCategory(categories[0]);
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

          {/* Category Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
            <TouchableOpacity
              style={[styles.dropdownButton, { 
                backgroundColor: theme.colors.surface, 
                borderColor: showCategoryDropdown ? theme.colors.primary : theme.colors.border 
              }]}
              onPress={() => {
                const toValue = showCategoryDropdown ? 0 : 1;
                setShowCategoryDropdown(!showCategoryDropdown);
                Animated.spring(dropdownAnim, {
                  toValue,
                  tension: 300,
                  friction: 20,
                  useNativeDriver: false,
                }).start();
              }}
            >
              <View style={styles.dropdownButtonContent}>
                <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(category) }]}>
                  <Ionicons name={getCategoryIcon(category)} size={16} color="#FFFFFF" />
                </View>
                <Text style={[styles.dropdownText, { color: theme.colors.text }]}>{category}</Text>
              </View>
              <Animated.View style={{
                transform: [{
                  rotate: dropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  })
                }]
              }}>
                <Ionicons name="chevron-down" size={20} color={theme.colors.primary} />
              </Animated.View>
            </TouchableOpacity>
            
            {showCategoryDropdown && (
              <Animated.View style={[
                styles.dropdown, 
                { 
                  backgroundColor: theme.colors.surface, 
                  borderColor: theme.colors.border,
                  opacity: dropdownAnim,
                  transform: [{
                    scaleY: dropdownAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    })
                  }]
                }
              ]}>
                <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
                  {categories.map((item, index) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.dropdownItem, 
                        item === category && styles.dropdownItemActive,
                        index === categories.length - 1 && styles.dropdownItemLast
                      ]}
                      onPress={() => {
                        setCategory(item);
                        Animated.spring(dropdownAnim, {
                          toValue: 0,
                          tension: 300,
                          friction: 20,
                          useNativeDriver: false,
                        }).start(() => setShowCategoryDropdown(false));
                      }}
                    >
                      <View style={styles.dropdownItemContent}>
                        <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(item) }]}>
                          <Ionicons name={getCategoryIcon(item)} size={14} color="#FFFFFF" />
                        </View>
                        <Text style={[
                          styles.dropdownItemText,
                          { color: item === category ? '#FFFFFF' : theme.colors.text }
                        ]}>
                          {item}
                        </Text>
                      </View>
                      {item === category && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
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
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    top: 84,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1000,
    maxHeight: 240,
    overflow: 'hidden',
  },
  dropdownList: {
    maxHeight: 240,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemActive: {
    backgroundColor: '#3B82F6',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 4,
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

const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    'Food & Drinks': 'restaurant',
    'Transport': 'car',
    'Shopping': 'bag',
    'Entertainment': 'game-controller',
    'Bills & Fees': 'receipt',
    'Healthcare': 'medical',
    'Education': 'school',
    'Salary': 'briefcase',
    'Freelance': 'laptop',
    'Investment': 'trending-up',
    'Business': 'business',
    'Gift': 'gift',
    'Other': 'ellipsis-horizontal',
  };
  return iconMap[category] || 'ellipsis-horizontal';
};

const getCategoryColor = (category: string) => {
  const colorMap: { [key: string]: string } = {
    'Food & Drinks': '#F59E0B',
    'Transport': '#3B82F6',
    'Shopping': '#EC4899',
    'Entertainment': '#8B5CF6',
    'Bills & Fees': '#EF4444',
    'Healthcare': '#10B981',
    'Education': '#06B6D4',
    'Salary': '#059669',
    'Freelance': '#7C3AED',
    'Investment': '#DC2626',
    'Business': '#1F2937',
    'Gift': '#F97316',
    'Other': '#6B7280',
  };
  return colorMap[category] || '#6B7280';
};

export default QuickAddModal;