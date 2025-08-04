import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { testConnection, getConnectionStatus } from '../services/apiService';

export const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    const connected = await testConnection();
    setIsConnected(connected);
    setIsChecking(false);
  };

  if (isChecking) {
    return (
      <View style={styles.container}>
        <Text style={styles.checking}>🔍 Connecting...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isConnected ? styles.connected : styles.disconnected]}>
      <Text style={styles.text}>
        {isConnected ? '✅ Backend Connected' : '📱 Offline Mode'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: 'center',
  },
  connected: {
    backgroundColor: '#d4edda',
  },
  disconnected: {
    backgroundColor: '#f8d7da',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  checking: {
    fontSize: 12,
    color: '#666',
  },
});