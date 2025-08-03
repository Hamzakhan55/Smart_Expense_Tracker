import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface VoiceInputFABProps {
  onPress?: () => void;
}

export const VoiceInputFAB: React.FC<VoiceInputFABProps> = ({ onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      Alert.alert('Voice Input', 'Voice input feature coming soon!');
    }
  };

  return (
    <TouchableOpacity style={styles.fab} onPress={handlePress}>
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.fabGradient}>
        <Ionicons name="mic" size={24} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VoiceInputFAB;