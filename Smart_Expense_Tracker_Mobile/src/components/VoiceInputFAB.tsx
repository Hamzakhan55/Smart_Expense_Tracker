import React, { useState, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Alert, View, Text, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { processVoiceDryRun } from '../services/apiService';
import { parseVoiceText, validateAudioFile } from '../services/speechService';
import { AiResponse } from '../types';
import AiConfirmationModal from './AiConfirmationModal';

interface VoiceInputFABProps {
  onPress?: () => void;
}

export const VoiceInputFAB: React.FC<VoiceInputFABProps> = ({ onPress }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [aiData, setAiData] = useState<AiResponse | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const recordingStartTime = useRef<number>(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setShowRecordingModal(true);
      recordingStartTime.current = Date.now();
      
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    const recordingDuration = Date.now() - recordingStartTime.current;
    if (recordingDuration < 500) {
      Alert.alert('Recording Too Short', 'Please hold longer to record your expense.');
      await recording.stopAndUnloadAsync();
      setIsRecording(false);
      setRecording(null);
      setShowRecordingModal(false);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setRecording(null);
      setIsProcessing(true);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);

      if (uri) {
        console.log('Audio file URI:', uri);
        
        // Validate audio file
        const isValid = await validateAudioFile(uri);
        if (!isValid) {
          setIsProcessing(false);
          setShowRecordingModal(false);
          Alert.alert('Invalid Audio', 'Please try recording again.');
          return;
        }
        
        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log('File info:', fileInfo);
        
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
          setIsProcessing(false);
          setShowRecordingModal(false);
          
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
          setIsProcessing(false);
          setShowRecordingModal(false);
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
      setIsProcessing(false);
      setShowRecordingModal(false);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
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

  const cancelRecording = () => {
    if (recording) {
      recording.stopAndUnloadAsync();
      setRecording(null);
    }
    setIsRecording(false);
    setIsProcessing(false);
    setShowRecordingModal(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
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
      
      {/* Recording/Processing Modal */}
      <Modal
        visible={showRecordingModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {isRecording ? (
              <>
                <Animated.View style={[styles.recordingIndicator, { transform: [{ scale: pulseAnim }] }]}>
                  <Ionicons name="mic" size={40} color="#EF4444" />
                </Animated.View>
                <Text style={styles.modalTitle}>Recording...</Text>
                <Text style={styles.modalSubtitle}>Speak your expense details</Text>
                <TouchableOpacity style={styles.cancelButton} onPress={cancelRecording}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : isProcessing ? (
              <>
                <View style={styles.processingIndicator}>
                  <Ionicons name="sparkles" size={40} color="#3B82F6" />
                </View>
                <Text style={styles.modalTitle}>Processing...</Text>
                <Text style={styles.modalSubtitle}>AI is analyzing your voice</Text>
                <TouchableOpacity style={styles.cancelButton} onPress={cancelRecording}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
      
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 280,
  },
  recordingIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  processingIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default VoiceInputFAB;