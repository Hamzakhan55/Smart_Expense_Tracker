import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const gradientColors = isExpense ? ['#EF4444', '#DC2626'] : ['#10B981', '#059669'];
  const title = isExpense ? '💸 Expense Added!' : '💰 Income Added!';
  const subtitle = isExpense ? 'Successfully recorded your expense' : 'Successfully recorded your income';
  const icon = isExpense ? 'checkmark-circle' : 'checkmark-circle';

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
        <LinearGradient
          colors={gradientColors}
          style={styles.iconContainer}
        >
          <Animated.View style={{ transform: [{ scale: checkAnim }] }}>
            <Ionicons name="checkmark" size={40} color="#FFFFFF" />
          </Animated.View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
          
          {category && (
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Ionicons 
                  name="pricetag" 
                  size={18} 
                  color="#FFFFFF" 
                />
                <Text style={styles.detailText}>
                  {category}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Success indicator */}
        <LinearGradient
          colors={gradientColors}
          style={styles.successBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
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
    width: width * 0.9,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 40,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  content: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  detailsContainer: {
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  successBar: {
    height: 6,
    width: '100%',
  },
});

export default SuccessModal;