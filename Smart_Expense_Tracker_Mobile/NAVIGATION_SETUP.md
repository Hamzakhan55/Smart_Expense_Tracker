# Bottom Navigation Setup Guide

## Required Dependencies

Add these dependencies to your project:

```bash
npx expo install expo-haptics expo-blur
```

## Navigation Components Created

### 1. BottomNavigation.tsx
- Standard bottom navigation with theme support
- Haptic feedback and smooth animations
- Gradient backgrounds and active indicators

### 2. FloatingBottomNav.tsx
- Modern floating navigation with blur effects
- Enhanced animations and visual effects
- Glassmorphism design

### 3. NavigationWrapper.tsx
- Wrapper to switch between navigation styles
- Easy configuration

## Usage

In your AppNavigator.tsx, you can switch between styles:

```tsx
<NavigationWrapper 
  activeTab={activeTab} 
  onTabPress={setActiveTab}
  style="floating" // or "default"
/>
```

## Features

### Dark/Light Mode Support
- Automatically adapts to your theme context
- Uses your existing theme colors and gradients

### Animations
- Haptic feedback on tab press
- Scale animations for active tabs
- Smooth transitions

### Accessibility
- Proper touch targets
- Clear visual feedback
- Theme-aware colors

## Customization

### Colors
Edit the theme colors in `src/utils/theme.ts`

### Icons
Modify the `tabs` array in either navigation component to change icons

### Animations
Adjust animation values in the `handleTabPress` functions

## Performance
- Uses native driver for animations
- Optimized re-renders
- Efficient blur effects