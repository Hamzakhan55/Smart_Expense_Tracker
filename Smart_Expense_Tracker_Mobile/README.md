# Smart Expense Tracker Mobile

A React Native mobile application that mirrors the functionality and aesthetic of the Smart Expense Tracker web application.

## Features

- **Authentication**: Secure login and signup with JWT tokens
- **Dashboard**: Financial overview with interactive stat cards and quick actions
- **Transactions**: Income and expense tracking with filtering and search
- **Budgets**: Monthly budget management with progress tracking
- **Goals**: Financial goal setting and progress monitoring
- **Analytics**: Visual charts and spending insights
- **Settings**: User preferences and account management

## Tech Stack

- **React Native** with TypeScript
- **Expo** for development and deployment
- **React Navigation** for navigation
- **React Query** for data fetching and caching
- **AsyncStorage** for local data persistence
- **Expo Linear Gradient** for beautiful UI gradients
- **React Native Chart Kit** for data visualization
- **Expo Vector Icons** for consistent iconography

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── services/          # API services and data fetching
├── context/           # React context providers
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. Navigate to the mobile app directory:
```bash
cd Smart_Expense_Tracker_Mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Backend Connection

The mobile app connects to the same FastAPI backend as the web application. Make sure the backend server is running on `http://127.0.0.1:8000` before using the app.

If the backend is not available, the app will fall back to mock data for demonstration purposes.

## Key Features

### Dashboard
- Real-time financial overview
- Net worth, income, and expense tracking
- Savings rate calculation
- Quick action buttons for common tasks

### Transactions
- Add, edit, and delete income/expense entries
- Category-based filtering
- Search functionality
- Transaction history with detailed views

### Budgets
- Monthly budget creation and management
- Progress tracking with visual indicators
- Budget alerts and notifications
- Category-wise budget allocation

### Goals
- Financial goal setting
- Progress tracking with percentage completion
- Visual progress indicators
- Goal achievement celebrations

### Analytics
- Spending trend charts
- Category breakdown pie charts
- Monthly comparison views
- Quick statistics overview

### Settings
- User profile management
- App preferences (currency, notifications, theme)
- Data export and backup options
- Account management

## Design Philosophy

The mobile app maintains the same modern, clean aesthetic as the web application while adapting to mobile-first design principles:

- **Touch-friendly interfaces** with appropriate button sizes
- **Gesture-based navigation** for intuitive user experience
- **Responsive layouts** that work across different screen sizes
- **Native mobile patterns** like pull-to-refresh and floating action buttons
- **Consistent color scheme** and typography matching the web app

## Development

### Adding New Features

1. Create new screens in `src/screens/`
2. Add navigation routes in `src/navigation/AppNavigator.tsx`
3. Create reusable components in `src/components/`
4. Add API services in `src/services/apiService.ts`
5. Update TypeScript types in `src/types/index.ts`

### Testing

The app includes mock data fallbacks for testing without a backend connection. This allows for:
- UI/UX testing
- Feature demonstration
- Offline development

### Deployment

#### Development Build
```bash
expo build:android
expo build:ios
```

#### Production Build
```bash
expo build:android --type app-bundle
expo build:ios --type archive
```

## Physical Device Testing

The app is designed to work seamlessly on physical devices:

1. **Install Expo Go** on your mobile device
2. **Scan the QR code** from the Expo development server
3. **Test all features** including touch interactions and gestures
4. **Verify performance** on different device specifications

## Future Enhancements

- **Voice input** for expense tracking (using device microphone)
- **Camera integration** for receipt scanning
- **Biometric authentication** (fingerprint/face recognition)
- **Offline mode** with data synchronization
- **Push notifications** for budget alerts and reminders
- **Widget support** for quick expense entry
- **Apple Watch/Wear OS** companion apps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android
5. Submit a pull request

## License

This project is part of the Smart Expense Tracker suite and follows the same licensing terms as the main project.