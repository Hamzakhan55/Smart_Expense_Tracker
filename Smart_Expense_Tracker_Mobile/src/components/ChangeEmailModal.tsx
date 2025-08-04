import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface ChangeEmailModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: (email: string) => Promise<void>;
  currentEmail: string;
}

const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({
  visible,
  onClose,
  onUpdate,
  currentEmail,
}) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState(currentEmail);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleUpdate = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (email === currentEmail) {
      Alert.alert('Info', 'This is already your current email address.');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(email);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Change Email</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>New Email Address</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter new email"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.updateButton, loading && styles.disabledButton]}
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text style={styles.updateText}>{loading ? 'Updating...' : 'Update'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  updateButton: {
    backgroundColor: '#3B82F6',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  updateText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ChangeEmailModal;