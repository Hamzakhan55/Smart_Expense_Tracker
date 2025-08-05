import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { connectionManager } from '../services/connectionManager';

export const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentURL, setCurrentURL] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await connectionManager.testConnection();
      setIsConnected(connected);
      if (connected) {
        const url = await connectionManager.getBackendURL();
        setCurrentURL(url);
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isChecking) return '#FFA500';
    return isConnected ? '#10B981' : '#EF4444';
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    return isConnected ? 'Connected' : 'Offline';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={checkConnection}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.text}>
        {getStatusText()}
        {isConnected && currentURL && (
          <Text style={styles.url}> • {currentURL.replace('http://', '')}</Text>
        )}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  text: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  url: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});