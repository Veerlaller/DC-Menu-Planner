# Ories.ai - Mobile App

A React Native mobile application for UC Davis students to track their nutrition using dining hall menus.

## 🚀 Features

### ✅ Completed Features

#### Onboarding Flow
- **Welcome Screen**: Beautiful introduction to the app
- **Basic Info**: Collect height, weight, age, and sex
- **Goals Setup**: Choose fitness goal (cut, bulk, maintain) and activity level
- **Preferences**: Set dietary restrictions, allergies, and food preferences
- **Completion**: Auto-calculate macro targets based on user data

#### Today Screen
- Daily calorie and macro tracking
- Visual progress bars for protein, carbs, and fat
- Meal logging history
- Real-time progress updates

#### Menus Screen
- Browse menus by dining hall (Latitude, Cuarto, Segundo, Tercero)
- Filter by meal type (Breakfast, Lunch, Dinner)
- View nutrition facts for each item
- See dietary flags (vegan, vegetarian, gluten-free)
- Log meals with a tap

#### Hungry Now Screen
- Get personalized meal recommendations
- Based on your goals and remaining macros
- Shows which dining hall is best right now
- Respects dietary restrictions

#### Profile Screen
- View personal info and stats
- See macro targets
- Manage dietary preferences
- Edit profile settings
- Reset app data

## 🛠 Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **Forms**: React Hook Form (ready to integrate)

## 📦 Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## 🏗 Project Structure

```
mobile/
├── src/
│   ├── api/                  # API client and endpoints
│   │   ├── client.ts         # Axios configuration
│   │   └── index.ts          # API methods
│   ├── components/           # Reusable components
│   │   └── MacroProgressBar.tsx
│   ├── constants/            # App constants
│   │   └── theme.ts          # Colors, spacing, typography
│   ├── navigation/           # Navigation setup
│   │   ├── RootNavigator.tsx
│   │   ├── OnboardingNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── screens/              # All app screens
│   │   ├── onboarding/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── BasicInfoScreen.tsx
│   │   │   ├── GoalsScreen.tsx
│   │   │   ├── PreferencesScreen.tsx
│   │   │   └── CompleteScreen.tsx
│   │   └── main/
│   │       ├── HomeScreen.tsx
│   │       ├── MenusScreen.tsx
│   │       ├── HungryNowScreen.tsx
│   │       └── ProfileScreen.tsx
│   ├── store/                # Zustand state management
│   │   └── useStore.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   └── utils/                # Utility functions
├── App.tsx                   # Root component
└── package.json
```

## 🔧 Configuration

### Backend API

Update the API base URL in `src/api/client.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';
```

### Environment Variables

Create a `.env` file (optional):

```
API_URL=http://localhost:3000/api
```

## 📱 Running the App

### Development Mode

```bash
npm start
```

This will open Expo DevTools in your browser. You can then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan the QR code with Expo Go app on your phone

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

## 🧪 Testing

Currently using mock data for development. To connect to the real backend:

1. Start the backend server (see `/server/README.md`)
2. Update API URL in `src/api/client.ts`
3. Replace mock API calls with real endpoints

## 🎨 Design System

### Colors
- **Primary**: Blue (`#2563eb`)
- **Secondary**: Green (`#10b981`)
- **Accent**: Amber (`#f59e0b`)
- **Macros**: 
  - Protein: Red
  - Carbs: Orange
  - Fat: Purple

### Typography
- Font sizes: `xs` (12), `sm` (14), `base` (16), `lg` (18), `xl` (20), `2xl` (24), `3xl` (30), `4xl` (36)
- Font weights: normal, medium, semibold, bold

### Spacing
- `xs`: 4, `sm`: 8, `md`: 16, `lg`: 24, `xl`: 32, `xxl`: 48

## 📝 Next Steps

### Immediate
- [ ] Connect to real backend API
- [ ] Implement actual meal logging
- [ ] Add authentication (Supabase Auth)
- [ ] Fetch real menu data from scraper

### Future Features
- [ ] Weekly/monthly statistics
- [ ] Custom meal creation
- [ ] Meal plan suggestions
- [ ] Friends & social features
- [ ] Push notifications for meal recommendations
- [ ] Barcode scanner for packaged foods
- [ ] Water intake tracking
- [ ] Weight tracking over time

## 🐛 Known Issues

- Mock data is used for development
- No backend integration yet
- Meal logging doesn't persist to database
- No authentication flow

## 📄 License

This project is for educational purposes.

## 👥 Contributing

This is a student project for UC Davis. Contributions welcome!

## 🙏 Acknowledgments

- Built for UC Davis students
- Uses dining hall menu data from housing.ucdavis.edu
- Inspired by MyFitnessPal and Cronometer

