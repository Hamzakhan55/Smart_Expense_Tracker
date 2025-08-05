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
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

interface TabItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}

interface PremiumBottomNavProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

const tabs: TabItem[] = [
  {
    name: 'Dashboard',
    icon: 'home-outline',
    iconFocused: 'home',
    label: 'Home',
    color: '#3B82F6',
  },
  {
    name: 'Transactions',
    icon: 'card-outline',
    iconFocused: 'card',
    label: 'History',
    color: '#10B981',
  },
  {
    name: 'Budgets',
    icon: 'wallet-outline',
    iconFocused: 'wallet',
    label: 'Budget',
    color: '#F59E0B',
  },
  {
    name: 'Goals',
    icon: 'trophy-outline',
    iconFocused: 'trophy',
    label: 'Goals',
    color: '#8B5CF6',
  },
  {
    name: 'Analytics',
    icon: 'analytics-outline',
    iconFocused: 'analytics',
    label: 'Stats',
    color: '#EF4444',
  },
  {
    name: 'Settings',
    icon: 'settings-outline',
    iconFocused: 'settings',
    label: 'Settings',
    color: '#6B7280',
  },
];

const PremiumBottomNav: React.FC<PremiumBottomNavProps> = ({
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

  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.name === activeTab);
    Animated.spring(slideAnim, {
      toValue: activeIndex,
      tension: 300,
      friction: 30,
      useNativeDriver: true,
    }).start();
  }, [activeTab, slideAnim]);

  const handleTabPress = (tabName: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Enhanced animation with bounce effect
    Animated.sequence([
      Animated.timing(scaleAnims[tabName], {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[tabName], {
        toValue: 1,
        tension: 400,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    
    onTabPress(tabName);
  };

  const tabWidth = (width - 40) / tabs.length;

  return (
    <View style={styles.container}>
      {/* Enhanced shadow container */}
      <View style={[
        styles.shadowContainer,
        {
          shadowColor: isDarkMode ? '#000000' : '#1F2937',
          shadowOpacity: isDarkMode ? 0.5 : 0.2,
        }
      ]}>
        <BlurView
          intensity={isDarkMode ? 100 : 95}
          tint={isDarkMode ? 'dark' : 'light'}
          style={styles.blurContainer}
        >
          {/* Premium gradient overlay */}
          <LinearGradient
            colors={isDarkMode 
              ? ['rgba(30, 41, 59, 0.98)', 'rgba(15, 23, 42, 1)'] 
              : ['rgba(255, 255, 255, 0.98)', 'rgba(248, 250, 252, 1)']
            }
            style={styles.gradient}
          />
          
          {/* Animated active indicator */}
          <Animated.View
            style={[
              styles.activeSlider,
              {
                width: tabWidth - 16,
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, tabs.length - 1],
                      outputRange: [8, (tabs.length - 1) * tabWidth + 8],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={tabs.find(tab => tab.name === activeTab)?.color 
                ? [tabs.find(tab => tab.name === activeTab)!.color, `${tabs.find(tab => tab.name === activeTab)!.color}80`]
                : [theme.colors.primary, `${theme.colors.primary}80`]
              }
              style={styles.sliderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
          
          {/* Subtle top accent */}
          <LinearGradient
            colors={isDarkMode 
              ? ['rgba(59, 130, 246, 0.3)', 'transparent'] 
              : ['rgba(59, 130, 246, 0.2)', 'transparent']
            }
            style={styles.topAccent}
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
                    activeOpacity={0.7}
                  >
                    {/* Icon container with enhanced styling */}
                    <View style={[
                      styles.iconContainer,
                      isActive && styles.activeIconContainer
                    ]}>
                      <Ionicons
                        name={isActive ? tab.iconFocused : tab.icon}
                        size={isActive ? 26 : 22}
                        color={isActive ? '#FFFFFF' : theme.colors.textSecondary}
                        style={isActive ? styles.iconShadow : null}
                      />
                    </View>

                    {/* Premium label styling */}
                    <Text style={[
                      styles.tabLabel,
                      {
                        color: isActive ? '#FFFFFF' : theme.colors.textSecondary,
                        fontWeight: isActive ? '700' : '500',
                        opacity: isActive ? 1 : 0.7,
                        transform: [{ scale: isActive ? 1.05 : 1 }],
                      }
                    ]}>
                      {tab.label}
                    </Text>

                    {/* Premium active indicator */}
                    {isActive && (
                      <View style={[
                        styles.activeIndicator,
                        { backgroundColor: '#FFFFFF' }
                      ]} />
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 25,
    left: 20,
    right: 20,
    height: 80,
  },
  shadowContainer: {
    flex: 1,
    borderRadius: 32,
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowRadius: 32,
    elevation: 20,
  },
  blurContainer: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  activeSlider: {
    position: 'absolute',
    top: 12,
    height: 56,
    borderRadius: 24,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  sliderGradient: {
    flex: 1,
    borderRadius: 24,
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
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 24,
    minWidth: 70,
    position: 'relative',
    zIndex: 2,
  },
  activeTabItem: {
    transform: [{ scale: 1.02 }],
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    width: 32,
    height: 32,
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
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default PremiumBottomNav;