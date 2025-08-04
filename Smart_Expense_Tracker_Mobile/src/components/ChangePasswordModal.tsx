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

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: (password: string) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
  onUpdate,
}) => {
  const { theme } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdate = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter a password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(password);
      setPassword('');
      setConfirmPassword('');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Change Password</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>New Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="Enter new password"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Confirm Password</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            placeholder="Confirm new password"
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
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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

export default ChangePasswordModal;