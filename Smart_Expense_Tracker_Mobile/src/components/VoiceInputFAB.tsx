import React, { useState, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Alert, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { processVoiceDryRun } from '../services/apiService';
import { parseVoiceText } from '../services/speechService';
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
  const recordingStartTime = useRef<number>(0);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Required', 'Please allow microphone access.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000, // Optimal for speech recognition
          numberOfChannels: 1,
          bitRate: 128000, // Balanced quality and size
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000, // Optimal for speech recognition
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      setRecording(newRecording);
      setIsRecording(true);
      recordingStartTime.current = Date.now();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    const recordingDuration = Date.now() - recordingStartTime.current;
    if (recordingDuration < 500) { // Reduced minimum time
      Alert.alert('Recording Too Short', 'Please hold longer to record your expense.');
      await recording.stopAndUnloadAsync();
      setIsRecording(false);
      setRecording(null);
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setRecording(null);

      if (uri) {
        console.log('Audio file URI:', uri);
        
        // Check if file exists and get file info
        try {
          const fileInfo = await FileSystem.getInfoAsync(uri);
          console.log('File info:', fileInfo);
          
          if (!fileInfo.exists) {
            throw new Error('Audio file does not exist');
          }
        } catch (fileError) {
          console.log('File check failed, proceeding anyway:', fileError);
        }
        
        const formData = new FormData();
        formData.append('file', {
          uri,
          type: 'audio/wav',
          name: `voice-${Date.now()}.wav`,
        } as any);
        console.log('FormData created, file size:', fileInfo.size, 'bytes');

        try {
          const aiResponse = await processVoiceDryRun(formData);
          console.log('Processed AI response:', aiResponse);
          
          // Handle different types of failures
          if (aiResponse.description.includes('Voice recorded - please verify details') || 
              aiResponse.description.includes('Voice transcription failed')) {
            Alert.prompt(
              'Voice Processing Issue',
              aiResponse.description.includes('transcription failed') 
                ? 'Speech recognition failed. Please type what you said:'
                : 'Backend unavailable. Please type what you said:',
              (text) => {
                if (text && text.trim()) {
                  const parsed = parseVoiceText(text);
                  setAiData(parsed);
                } else {
                  setAiData(aiResponse);
                }
              },
              'plain-text',
              'e.g., buy bags for 3000 rupees',
              'default'
            );
          } else {
            setAiData(aiResponse);
          }
        } catch (processingError) {
          console.error('AI processing failed:', processingError);
          Alert.prompt(
            'Voice Recording Failed',
            'Please type your expense details:',
            (text) => {
              if (text && text.trim()) {
                const parsed = parseVoiceText(text);
                setAiData(parsed);
              }
            },
            'plain-text',
            'e.g., bought bags for 3000 rupees',
            'default'
          );
        }
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
      startRecording();
    }, 50); // Even faster response for better UX
  };

  const handlePressOut = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    
    if (onPress) return;
    
    if (isLongPress.current && isRecording) {
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
    bottom: 110,
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