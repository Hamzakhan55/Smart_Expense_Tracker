import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { createGoal, updateGoalProgress, deleteGoal } from '../services/apiService';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { GoalCreate, Goal } from '../types';

interface CreateGoalModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  goal?: Goal | null;
}

const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isVisible,
  onClose,
  onSuccess,
  goal
}) => {
  const { selectedCurrency } = useCurrency();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isEditMode = !!goal;

  useEffect(() => {
    if (isVisible) {
      if (goal) {
        setName(goal.name);
        setTargetAmount(String(goal.target_amount));
      } else {
        setName('');
        setTargetAmount('');
      }
      setContributionAmount('');
    }
  }, [isVisible, goal]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a goal name.');
      return;
    }

    const numericAmount = parseFloat(targetAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid target amount.');
      return;
    }

    setIsCreating(true);
    try {
      const goalData: GoalCreate = {
        name: name.trim(),
        target_amount: numericAmount,
      };

      await createGoal(goalData);
      Alert.alert('🎯 Success', 'Goal created successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create goal:', error);
      Alert.alert('❌ Error', 'Failed to create goal. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleContribution = async (isAdd: boolean) => {
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (!goal) return;

    setIsCreating(true);
    try {
      await updateGoalProgress({ 
        id: goal.id, 
        amount: isAdd ? amount : -amount 
      });
      Alert.alert(
        isAdd ? '💰 Funds Added' : '💸 Funds Withdrawn', 
        `${selectedCurrency.symbol}${amount} ${isAdd ? 'added to' : 'withdrawn from'} ${goal.name}`,
        [{ text: 'OK', style: 'default' }]
      );
      setContributionAmount('');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update goal:', error);
      Alert.alert('❌ Error', 'Failed to update goal. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!goal) return;
    try {
      await deleteGoal(goal.id);
      Alert.alert('✅ Success', 'Goal deleted successfully!');
      onSuccess?.();
      onClose();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete goal:', error);
      Alert.alert('❌ Error', 'Failed to delete goal.');
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
        <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="trophy" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>{isEditMode ? 'Manage Goal' : 'Create New Goal'}</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{isEditMode ? 'Add funds or manage your goal' : 'Set a new savings target'}</Text>
            </View>
          </View>

        </View>

        <View style={styles.form}>
          {!isEditMode ? (
            <>
              {/* Goal Name Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Goal Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Emergency Fund, Vacation"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              {/* Target Amount Field */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Target Amount</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                    value={targetAmount}
                    onChangeText={setTargetAmount}
                    placeholder="0.00"
                    keyboardType="numeric"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  <Text style={styles.currency}>{selectedCurrency.code}</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Goal Progress */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Progress</Text>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    {selectedCurrency.symbol}{Math.round(goal?.current_amount || 0)} / {selectedCurrency.symbol}{Math.round(goal?.target_amount || 0)}
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round((goal?.current_amount || 0) / (goal?.target_amount || 1) * 100)}%
                  </Text>
                </View>
              </View>

              {/* Add/Withdraw Funds */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Add/Withdraw Funds</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={contributionAmount}
                    onChangeText={setContributionAmount}
                    placeholder="0.00"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.currency}>{selectedCurrency.code}</Text>
                </View>
                <View style={styles.contributionButtons}>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleContribution(true)}
                    disabled={!contributionAmount || parseFloat(contributionAmount) <= 0}
                  >
                    <Text style={styles.addButtonText}>Add Funds</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.withdrawButton}
                    onPress={() => handleContribution(false)}
                    disabled={!contributionAmount || parseFloat(contributionAmount) <= 0}
                  >
                    <Text style={styles.withdrawButtonText}>Withdraw</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isEditMode ? (
            <>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
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
                    <Text style={styles.saveButtonText}>Creating...</Text>
                  </View>
                ) : (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Create Goal</Text>
                  </View>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        isVisible={showDeleteModal}
        onBackdropPress={() => setShowDeleteModal(false)}
        style={styles.deleteModal}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropOpacity={0.6}
      >
        <View style={[styles.deleteModalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.deleteHeader}>
            <View style={styles.deleteIconContainer}>
              <Ionicons name="warning" size={32} color="#EF4444" />
            </View>
            <Text style={[styles.deleteTitle, { color: theme.colors.text }]}>Delete Goal</Text>
            <Text style={[styles.deleteSubtitle, { color: theme.colors.textSecondary }]}>This action cannot be undone</Text>
          </View>

          <View style={[styles.deleteGoalInfo, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.deleteGoalIcon}>
              <Ionicons name="trophy" size={20} color="#3B82F6" />
            </View>
            <View style={styles.deleteGoalDetails}>
              <Text style={[styles.deleteGoalName, { color: theme.colors.text }]}>{goal?.name}</Text>
              <Text style={[styles.deleteGoalAmount, { color: '#3B82F6' }]}>
                {selectedCurrency.symbol}{Math.round(goal?.current_amount || 0)} / {selectedCurrency.symbol}{Math.round(goal?.target_amount || 0)}
              </Text>
            </View>
          </View>

          <View style={styles.deleteButtons}>
            <TouchableOpacity 
              style={[styles.deleteCancelButton, { borderColor: theme.colors.border }]} 
              onPress={() => setShowDeleteModal(false)}
            >
              <Text style={[styles.deleteCancelText, { color: theme.colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteConfirmButton} 
              onPress={confirmDelete}
            >
              <View style={styles.deleteLoadingContainer}>
                <Ionicons name="trash" size={18} color="#FFFFFF" />
                <Text style={styles.deleteConfirmText}>Delete</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingRight: 16,
  },
  input: {
    height: 48,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
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
    backgroundColor: '#8B5CF6',
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  contributionButtons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  addButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  withdrawButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteModal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
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
  deleteGoalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  deleteGoalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deleteGoalDetails: {
    flex: 1,
  },
  deleteGoalName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deleteGoalAmount: {
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

export default CreateGoalModal;