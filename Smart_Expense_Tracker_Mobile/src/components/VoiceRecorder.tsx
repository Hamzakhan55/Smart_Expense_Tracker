import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { processVoiceDryRun } from '../services/apiService';
import { AiResponse } from '../types';

interface VoiceRecorderProps {
  onRecordingComplete: (aiData: AiResponse) => void;
  isProcessing?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete, 
  isProcessing = false 
}) => {
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isProcessing) {
      setStatus('processing');
    } else if (status === 'processing' && !isProcessing) {
      setStatus('idle');
    }
  }, [isProcessing, status]);

  React.useEffect(() => {
    if (status === 'recording') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [status, pulseAnim]);

  const startRecording = async () => {
    if (status !== 'idle') return;

    try {
      // Test backend connectivity first
      console.log('Testing backend connection...');
      const testResponse = await fetch('http://192.168.1.17:8000/health');
      if (!testResponse.ok) {
        Alert.alert('Backend Error', 'Cannot connect to backend server. Please check if the backend is running.');
        return;
      }
      console.log('Backend is accessible');

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Required', 'Please allow microphone access to record voice expenses.');
        return;
      }

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      await newRecording.startAsync();
      setRecording(newRecording);
      setStatus('recording');
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (status !== 'recording' || !recording) return;

    try {
      setStatus('processing');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        console.log('Audio URI:', uri);
        const formData = new FormData();
        formData.append('file', {
          uri,
          type: 'audio/m4a',
          name: 'voice-expense.m4a',
        } as any);

        console.log('Sending to backend...');
        const aiData = await processVoiceDryRun(formData);
        console.log('AI Response:', aiData);
        onRecordingComplete(aiData);
      }
    } catch (error: any) {
      console.error('Failed to process recording:', error);
      Alert.alert('Voice Processing Error', error.message || 'Failed to process voice recording. Please try again.');
    } finally {
      setRecording(null);
      setStatus('idle');
    }
  };

  const getButtonStyle = () => {
    switch (status) {
      case 'recording':
        return [styles.button, styles.recordingButton];
      case 'processing':
        return [styles.button, styles.processingButton];
      default:
        return [styles.button, styles.idleButton];
    }
  };

  const getIconName = () => {
    switch (status) {
      case 'recording':
        return 'stop' as const;
      case 'processing':
        return 'hourglass' as const;
      default:
        return 'mic' as const;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'recording':
        return 'Recording...';
      case 'processing':
        return 'Processing...';
      default:
        return 'Hold to record';
    }
  };

  return (
    <View style={styles.container}>
      {status === 'recording' && (
        <>
          <Animated.View style={[styles.pulseRing, styles.pulseRing1, { transform: [{ scale: pulseAnim }] }]} />
          <Animated.View style={[styles.pulseRing, styles.pulseRing2, { transform: [{ scale: pulseAnim }] }]} />
        </>
      )}
      
      <TouchableOpacity
        style={getButtonStyle()}
        onPressIn={startRecording}
        onPressOut={stopRecording}
        disabled={status === 'processing'}
        activeOpacity={0.8}
      >
        {status === 'processing' ? (
          <View style={styles.processingContainer}>
            <Ionicons name="sparkles" size={24} color="#FFFFFF" />
          </View>
        ) : (
          <Ionicons name={getIconName()} size={32} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      <View style={styles.statusContainer}>
        <Text style={[
          styles.statusText,
          status === 'recording' && styles.recordingText,
          status === 'processing' && styles.processingText,
        ]}>
          {getStatusText()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  idleButton: {
    backgroundColor: '#3B82F6',
  },
  recordingButton: {
    backgroundColor: '#EF4444',
  },
  processingButton: {
    backgroundColor: '#F59E0B',
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  pulseRing1: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    transform: [{ scale: 1.5 }],
  },
  pulseRing2: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
    transform: [{ scale: 1.25 }],
  },
  statusContainer: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  recordingText: {
    color: '#EF4444',
  },
  processingText: {
    color: '#F59E0B',
  },
});

export default VoiceRecorder;