import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
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
    icon: 'list-outline',
    iconFocused: 'list',
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onTabPress(tabName);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Gradient overlay for visual depth */}
      <LinearGradient
        colors={isDarkMode ? ['rgba(30, 41, 59, 0.95)', 'rgba(15, 23, 42, 0.98)'] : ['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.98)']}
        style={styles.gradient}
      />
      
      {/* Top border with gradient */}
      <LinearGradient
        colors={isDarkMode ? ['#334155', '#475569'] : ['#E5E7EB', '#D1D5DB']}
        style={styles.topBorder}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

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
                activeOpacity={0.7}
              >
                {/* Active tab background */}
                {isActive && (
                  <LinearGradient
                    colors={['#3B82F6', '#1E40AF']}
                    style={styles.activeBackground}
                  />
                )}
                
                {/* Icon container with glow effect for active tab */}
                <View style={[
                  styles.iconContainer,
                  isActive && styles.activeIconContainer
                ]}>
                  <Ionicons
                    name={isActive ? tab.iconFocused : tab.icon}
                    size={24}
                    color={isActive ? '#FFFFFF' : theme.colors.textSecondary}
                  />
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <View style={[
                      styles.activeDot,
                      { backgroundColor: '#FFFFFF' }
                    ]} />
                  )}
                </View>

                {/* Label */}
                <Text 
                  numberOfLines={1}
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? theme.colors.primary : theme.colors.textSecondary,
                      fontWeight: isActive ? '600' : '500',
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
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
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
    height: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  tabItem: {
    flex: 1,
    position: 'relative',
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 65,
  },
  activeBackground: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    bottom: 4,
    borderRadius: 16,
    opacity: 0.15,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 32,
    marginBottom: 4,
    position: 'relative',
  },
  activeIconContainer: {
    transform: [{ scale: 1.1 }],
  },
  activeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default BottomNavigation;