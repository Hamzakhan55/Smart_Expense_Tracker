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
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

interface TabItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  label: string;
}

interface FloatingBottomNavProps {
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
    icon: 'receipt-outline',
    iconFocused: 'receipt',
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
    icon: 'bar-chart-outline',
    iconFocused: 'bar-chart',
    label: 'Stats',
  },
  {
    name: 'Settings',
    icon: 'person-outline',
    iconFocused: 'person',
    label: 'Profile',
  },
];

const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  activeTab,
  onTabPress,
}) => {
  const { theme, isDarkMode } = useTheme();
  const scaleAnims = React.useRef(
    tabs.reduce((acc, tab) => {
      acc[tab.name] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;

  const handleTabPress = (tabName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate the pressed tab
    Animated.sequence([
      Animated.timing(scaleAnims[tabName], {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[tabName], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    onTabPress(tabName);
  };

  return (
    <View style={styles.container}>
      <BlurView
        intensity={isDarkMode ? 80 : 100}
        tint={isDarkMode ? 'dark' : 'light'}
        style={styles.blurContainer}
      >
        <LinearGradient
          colors={isDarkMode 
            ? ['rgba(30, 41, 59, 0.9)', 'rgba(15, 23, 42, 0.95)'] 
            : ['rgba(255, 255, 255, 0.9)', 'rgba(248, 250, 252, 0.95)']
          }
          style={styles.gradient}
        />
        
        <View style={styles.tabContainer}>
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.name;
            
            return (
              <Animated.View
                key={tab.name}
                style={[
                  styles.tabWrapper,
                  { transform: [{ scale: scaleAnims[tab.name] }] }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.tabItem,
                    isActive && styles.activeTabItem,
                  ]}
                  onPress={() => handleTabPress(tab.name)}
                  activeOpacity={0.8}
                >
                  {/* Active tab background with gradient */}
                  {isActive && (
                    <LinearGradient
                      colors={theme.gradients.primary}
                      style={styles.activeBackground}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  )}
                  
                  {/* Icon with glow effect */}
                  <View style={[
                    styles.iconContainer,
                    isActive && styles.activeIconContainer
                  ]}>
                    <Ionicons
                      name={isActive ? tab.iconFocused : tab.icon}
                      size={isActive ? 26 : 24}
                      color={isActive ? '#FFFFFF' : theme.colors.textSecondary}
                      style={isActive && styles.iconShadow}
                    />
                  </View>

                  {/* Label with smooth transition */}
                  <Text style={[
                    styles.tabLabel,
                    {
                      color: isActive ? '#FFFFFF' : theme.colors.textSecondary,
                      fontWeight: isActive ? '700' : '500',
                      fontSize: isActive ? 11 : 10,
                    }
                  ]}>
                    {tab.label}
                  </Text>

                  {/* Active indicator pulse */}
                  {isActive && (
                    <View style={[
                      styles.activePulse,
                      { backgroundColor: theme.colors.primary }
                    ]} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 80,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  blurContainer: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 12,
    flex: 1,
  },
  tabWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    minWidth: 75,
    position: 'relative',
  },
  activeTabItem: {
    transform: [{ scale: 1.05 }],
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activeIconContainer: {
    transform: [{ scale: 1.1 }],
  },
  iconShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tabLabel: {
    textAlign: 'center',
    fontSize: 9,
    marginTop: 2,
    numberOfLines: 1,
    minWidth: 60,
  },
  activePulse: {
    position: 'absolute',
    top: -2,
    alignSelf: 'center',
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
});

export default FloatingBottomNav;