import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { useTheme } from '../context/ThemeContext';

interface SuccessModalProps {
  isVisible: boolean;
  onClose: () => void;
  type: 'expense' | 'income';
  amount?: number;
  category?: string;
}

const { width } = Dimensions.get('window');

const SuccessModal: React.FC<SuccessModalProps> = ({
  isVisible,
  onClose,
  type,
  amount,
  category
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Start animations
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(checkAnim, {
          toValue: 1,
          tension: 200,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close after 2 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      checkAnim.setValue(0);
    }
  }, [isVisible]);

  const isExpense = type === 'expense';
  const backgroundColor = isExpense ? '#EF4444' : '#10B981';
  const title = isExpense ? 'Expense Added!' : 'Income Added!';
  const icon = isExpense ? 'remove-circle' : 'add-circle';

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.4}
      useNativeDriver={true}
    >
      <Animated.View 
        style={[
          styles.container,
          { 
            backgroundColor: theme.colors.card,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Success Icon */}
        <View style={[styles.iconContainer, { backgroundColor }]}>
          <Animated.View style={{ transform: [{ scale: checkAnim }] }}>
            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
          </Animated.View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Successfully recorded
          </Text>
          
          {category && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Ionicons 
                  name={icon} 
                  size={16} 
                  color={backgroundColor} 
                />
                <Text style={[styles.detailText, { color: theme.colors.text }]}>
                  {category}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Success indicator */}
        <View style={[styles.successBar, { backgroundColor }]} />
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  container: {
    width: width * 0.85,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  detailsContainer: {
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
  },
  successBar: {
    height: 4,
    width: '100%',
  },
});

export default SuccessModal;