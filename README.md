# 🏋️ FitTrack — React Native Fitness App

A production-ready, full-featured fitness tracking app built with **Expo** and **Firebase**.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 **Authentication** | Register, Login, Forgot Password (Firebase Auth) |
| 🏠 **Home Dashboard** | Greeting, stats, quick actions, recent workouts, daily quote |
| 🏋️ **Workout CRUD** | Create, Read, Update, Delete workouts with exercises |
| 💪 **Exercise Tracking** | Add exercises with sets, reps, and weight per workout |
| ✅ **Completion Tracking** | Mark workouts complete, auto-log sessions |
| 📊 **Progress Screen** | Completion rate, 7-day bar chart, category breakdown, BMI |
| 👤 **Profile** | Edit name/weight/height/goal, change password |
| 🔍 **Search & Filter** | Search workouts by name; filter by category |
| 🎨 **Modern Dark UI** | Electric mint + dark luxury theme |

---

## 🚀 Quick Start

### 1. Clone and install

```bash
cd FitTrack
npm install
```

Also install AsyncStorage (needed for Firebase auth persistence):

```bash
npx expo install @react-native-async-storage/async-storage
```

### 2. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → follow steps
3. Add a **Web app** (the SDK is compatible with React Native via Expo)
4. Enable **Authentication → Email/Password** sign-in method
5. Enable **Firestore Database** (start in test mode for development)

### 3. Add your Firebase config

Open `firebase.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_AUTH_DOMAIN",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
```

### 4. Run the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `i` for iOS simulator / `a` for Android emulator.

---

## 📁 Project Structure

```
FitTrack/
├── App.js                          # Root entry point
├── firebase.js                     # Firebase init & config
├── babel.config.js
├── app.json
├── package.json
└── src/
    ├── theme/
    │   └── colors.js               # Design tokens
    ├── context/
    │   └── AuthContext.js          # Global auth state
    ├── navigation/
    │   └── AppNavigator.js         # Auth + Tab + Stack navigation
    ├── components/
    │   ├── UIComponents.js         # Button, Input, Card, Badge, etc.
    │   └── WorkoutCard.js          # Reusable workout card
    └── screens/
        ├── auth/
        │   ├── LoginScreen.js
        │   ├── RegisterScreen.js
        │   └── ForgotPasswordScreen.js
        └── main/
            ├── HomeScreen.js
            ├── WorkoutsScreen.js
            ├── WorkoutDetailScreen.js
            ├── AddWorkoutScreen.js     # Also used for Edit
            ├── ProgressScreen.js
            └── ProfileScreen.js
```

---

## 🗄️ Firestore Data Model

```
users/{uid}
  displayName, email, weight, height, goal, createdAt

users/{uid}/workouts/{workoutId}
  name, category, duration, notes, completed, completedAt, createdAt, updatedAt
  exercises: [{ name, sets, reps, weight }]

users/{uid}/logs/{logId}
  workoutId, workoutName, duration, caloriesBurned, date
```

---

## 🔒 Firestore Security Rules (recommended)

Paste these into Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `expo` ~51 | Managed workflow runtime |
| `firebase` ^10 | Auth + Firestore |
| `@react-navigation/*` | Navigation |
| `expo-linear-gradient` | Gradient UI elements |
| `@expo/vector-icons` | Ionicons icon set |
| `react-native-reanimated` | Smooth animations |

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `colors.bg` | `#0A0A0F` | Screen backgrounds |
| `colors.card` | `#1C1C27` | Card surfaces |
| `colors.primary` | `#00E5A0` | CTAs, accents |
| `colors.secondary` | `#7C3AED` | Secondary accents |
| `colors.accent` | `#FF6B35` | Highlights |

---

## 🛣️ Roadmap (future features)

- [ ] Workout templates / presets
- [ ] Rest timer between sets
- [ ] Photo progress tracking
- [ ] Social sharing
- [ ] Apple Health / Google Fit integration
- [ ] Push notification reminders

---

Built with ❤️ using Expo + Firebase
