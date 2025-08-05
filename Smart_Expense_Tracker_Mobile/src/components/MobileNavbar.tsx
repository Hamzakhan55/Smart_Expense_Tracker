import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { connectionManager } from '../services/connectionManager';

const MobileNavbar = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentURL, setCurrentURL] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
      setCurrentDate(now.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      }));
    };
    
    const checkConnection = async () => {
      try {
        const connected = await connectionManager.testConnection();
        setIsConnected(connected);
        if (connected) {
          const url = await connectionManager.getBackendURL();
          setCurrentURL(url);
        }
      } catch (error) {
        setIsConnected(false);
      }
    };
    
    updateDateTime();
    checkConnection();
    const interval = setInterval(() => {
      updateDateTime();
      checkConnection();
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);





  return (
    <View style={[styles.navbar, isDarkMode && styles.navbarDark]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Left Section - App Branding */}
        <View style={styles.leftSection}>
          <TouchableOpacity 
            style={styles.logoContainer}
            onPress={() => {
              const statusText = isConnected ? 'Connected' : 'Offline';
              const urlText = isConnected && currentURL ? `\n• ${currentURL.replace('http://', '')}` : '';
              Alert.alert(
                'Connection Status',
                `Status: ${statusText}${urlText}`,
                [{ text: 'OK' }]
              );
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#3B82F6', '#6366F1', '#8B5CF6']}
              style={styles.logo}
            >
              <Ionicons name="wallet" size={20} color="#FFFFFF" />
            </LinearGradient>
            <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10B981' : '#EF4444' }]} />
          </TouchableOpacity>
          
          <View style={styles.appInfo}>
            <Text style={[styles.appName, isDarkMode && styles.textDark]}>
              Smart Expense Tracker
            </Text>
            <Text style={[styles.appSubtitle, isDarkMode && styles.textSecondaryDark]}>
              Advanced Finance Manager
            </Text>
          </View>
        </View>

        {/* Right Section - Actions */}
        <View style={styles.rightSection}>
          {/* Date/Time */}
          <View style={[styles.dateTimeContainer, isDarkMode && styles.dateTimeContainerDark]}>
            <Ionicons 
              name="calendar-outline" 
              size={12} 
              color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
            />
            <View style={styles.dateTimeText}>
              <Text style={[styles.dateText, isDarkMode && styles.textSecondaryDark]}>
                {currentDate}
              </Text>
              <Text style={[styles.timeText, isDarkMode && styles.textDark]}>
                {currentTime}
              </Text>
            </View>
          </View>


        </View>
      </View>


    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navbarDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderBottomColor: 'rgba(71, 85, 105, 0.5)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    marginTop: 14
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 30,
  },
  appSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    gap: 6,
  },
  dateTimeContainerDark: {
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
    borderColor: 'rgba(71, 85, 105, 0.6)',
  },
  dateTimeText: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 12,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 13,
  },

  textDark: {
    color: '#FFFFFF',
  },
  textSecondaryDark: {
    color: '#9CA3AF',
  },
});

export default MobileNavbar;