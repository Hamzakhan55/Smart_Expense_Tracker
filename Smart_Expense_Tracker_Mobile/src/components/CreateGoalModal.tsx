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
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [isCreating, setIsCreating] = useState(false);
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
      Alert.alert('Success', 'Goal created successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create goal:', error);
      Alert.alert('Error', 'Failed to create goal. Please try again.');
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
      Alert.alert('Success', `Funds ${isAdd ? 'added' : 'withdrawn'} successfully!`);
      setContributionAmount('');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to update goal:', error);
      Alert.alert('Error', 'Failed to update goal. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = () => {
    if (!goal) return;
    
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoal(goal.id);
              Alert.alert('Success', 'Goal deleted successfully!');
              onSuccess?.();
              onClose();
            } catch (error) {
              console.error('Failed to delete goal:', error);
              Alert.alert('Error', 'Failed to delete goal.');
            }
          },
        },
      ]
    );
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
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="trophy" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.title}>{isEditMode ? 'Manage Goal' : 'Create New Goal'}</Text>
              <Text style={styles.subtitle}>{isEditMode ? 'Add funds or manage your goal' : 'Set a new savings target'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {!isEditMode ? (
            <>
              {/* Goal Name Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Goal Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Emergency Fund, Vacation"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Target Amount Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Target Amount</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={targetAmount}
                    onChangeText={setTargetAmount}
                    placeholder="0.00"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.currency}>{selectedCurrency.code}</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Goal Progress */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Progress</Text>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    {selectedCurrency.symbol}{goal?.current_amount.toFixed(2)} / {selectedCurrency.symbol}{goal?.target_amount.toFixed(2)}
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {((goal?.current_amount || 0) / (goal?.target_amount || 1) * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>

              {/* Add/Withdraw Funds */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Add/Withdraw Funds</Text>
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
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
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
    backgroundColor: '#8B5CF6',
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
});

export default CreateGoalModal;