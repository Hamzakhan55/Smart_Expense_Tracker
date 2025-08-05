import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

interface TabItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  label: string;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

const tabs: TabItem[] = [
  {
    name: 'Dashboard',
    icon: 'home-outline',
    iconFocused: 'home',
    label: 'Home',
  },
  {
    name: 'Transactions',
    icon: 'card-outline',
    iconFocused: 'card',
    label: 'History',
  },
  {
    name: 'Budgets',
    icon: 'wallet-outline',
    iconFocused: 'wallet',
    label: 'Budget',
  },
  {
    name: 'Goals',
    icon: 'trophy-outline',
    iconFocused: 'trophy',
    label: 'Goals',
  },
  {
    name: 'Analytics',
    icon: 'analytics-outline',
    iconFocused: 'analytics',
    label: 'Stats',
  },
  {
    name: 'Settings',
    icon: 'settings-outline',
    iconFocused: 'settings',
    label: 'Settings',
  },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  const { theme, isDarkMode } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleTabPress = (tabName: string) => {
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Enhanced scale animation with spring
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
    
    onTabPress(tabName);
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.colors.surface,
        borderTopColor: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(107, 114, 128, 0.1)',
      }
    ]}>
      {/* Enhanced gradient overlay */}
      <LinearGradient
        colors={isDarkMode 
          ? ['rgba(30, 41, 59, 0.98)', 'rgba(15, 23, 42, 1)'] 
          : ['rgba(255, 255, 255, 0.98)', 'rgba(248, 250, 252, 1)']
        }
        style={styles.gradient}
      />
      
      {/* Refined top border */}
      <View style={[
        styles.topBorder,
        { backgroundColor: isDarkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(107, 114, 128, 0.15)' }
      ]} />

      <View style={styles.tabContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          
          return (
            <Animated.View
              key={tab.name}
              style={[styles.tabItem, { transform: [{ scale: isActive ? scaleAnim : 1 }] }]}
            >
              <TouchableOpacity
                style={styles.touchable}
                onPress={() => handleTabPress(tab.name)}
                activeOpacity={0.6}
              >
                {/* Enhanced active tab background */}
                {isActive && (
                  <LinearGradient
                    colors={[
                      theme.colors.primary,
                      isDarkMode ? '#1E40AF' : '#2563EB'
                    ]}
                    style={styles.activeBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                
                {/* Enhanced icon container */}
                <View style={[
                  styles.iconContainer,
                  isActive && styles.activeIconContainer
                ]}>
                  <Ionicons
                    name={isActive ? tab.iconFocused : tab.icon}
                    size={isActive ? 24 : 22}
                    color={isActive ? '#FFFFFF' : theme.colors.textSecondary}
                    style={isActive ? styles.iconShadow : null}
                  />
                  
                  {/* Refined active indicator */}
                  {isActive && (
                    <View style={[
                      styles.activeIndicator,
                      { backgroundColor: '#FFFFFF' }
                    ]} />
                  )}
                </View>

                {/* Enhanced label styling */}
                <Text 
                  numberOfLines={1}
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? theme.colors.primary : theme.colors.textSecondary,
                      fontWeight: isActive ? '600' : '500',
                      opacity: isActive ? 1 : 0.8,
                    }
                  ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingBottom: Platform.OS === 'ios' ? 25 : 20,
    paddingTop: 10,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    position: 'relative',
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 18,
    minWidth: 70,
  },
  activeBackground: {
    position: 'absolute',
    top: 2,
    left: 6,
    right: 6,
    bottom: 2,
    borderRadius: 18,
    opacity: 0.12,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    marginBottom: 4,
    position: 'relative',
  },
  activeIconContainer: {
    transform: [{ scale: 1.05 }],
  },
  iconShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  activeIndicator: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  tabLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: 0.2,
    marginTop: 2,
    minWidth: 65,
  },
});

export default BottomNavigation;