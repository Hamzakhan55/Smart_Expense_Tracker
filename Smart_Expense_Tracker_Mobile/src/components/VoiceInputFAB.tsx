import React, { useState, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Alert, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { processVoiceDryRun } from '../services/apiService';
import { AiResponse } from '../types';
import AiConfirmationModal from './AiConfirmationModal';

interface VoiceInputFABProps {
  onPress?: () => void;
}

export const VoiceInputFAB: React.FC<VoiceInputFABProps> = ({ onPress }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [aiData, setAiData] = useState<AiResponse | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Required', 'Please allow microphone access.');
        return;
      }

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      // Recording already started with createAsync
      setRecording(newRecording);
      setIsRecording(true);
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setRecording(null);
      console.log('Recording stopped, processing audio...');

      if (uri) {
        const formData = new FormData();
        formData.append('file', {
          uri,
          type: 'audio/m4a',
          name: 'voice-expense.m4a',
        } as any);

        const aiResponse = await processVoiceDryRun(formData);
        setAiData(aiResponse);
      }
    } catch (error) {
      console.error('Failed to process recording:', error);
      Alert.alert('Error', 'Failed to process voice recording.');
      setIsRecording(false);
      setRecording(null);
    }
  };

  const handlePressIn = () => {
    if (onPress) return;
    
    isLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      console.log('Starting recording...');
      startRecording();
    }, 200); // 200ms delay for long press detection
  };

  const handlePressOut = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    
    if (onPress) return;
    
    if (isLongPress.current && isRecording) {
      console.log('Stopping recording...');
      stopRecording();
    }
    
    isLongPress.current = false;
  };

  return (
    <View>
      <TouchableOpacity 
        style={styles.fab} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <LinearGradient colors={isRecording ? ['#EF4444', '#DC2626'] : ['#3B82F6', '#1E40AF']} style={styles.fabGradient}>
          <Ionicons name={isRecording ? "stop" : "mic"} size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
      
      <AiConfirmationModal 
        aiData={aiData}
        onClose={() => setAiData(null)}
      />
    </View>
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
    width: 65,
    height: 65,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VoiceInputFAB;