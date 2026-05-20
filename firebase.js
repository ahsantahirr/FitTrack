// firebase.js
// ─────────────────────────────────────────────────────────────
// SETUP: Replace the config below with YOUR Firebase project values.
// Go to: Firebase Console → Project Settings → Your Apps → SDK Setup
// ─────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBtbCRF8x9PAxWvXF2Kh_PboVVdAHg8iPE",
  authDomain: "fittrack-d2dff.firebaseapp.com",
  projectId: "fittrack-d2dff",
  storageBucket: "fittrack-d2dff.firebasestorage.app",
  messagingSenderId: "550306230771",
  appId: "1:550306230771:web:eda74b420b6fa8f259a286",
  measurementId: "G-QXLMC2SV23"
};


const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

// ─────────────────────────────────────────────────────────────
// Firestore Collections Structure:
//
// users/{uid}
//   - displayName: string
//   - email: string
//   - weight: number (kg)
//   - height: number (cm)
//   - goal: string
//   - createdAt: timestamp
//
// users/{uid}/workouts/{workoutId}
//   - name: string
//   - category: string
//   - duration: number (minutes)
//   - notes: string
//   - exercises: [{ name, sets, reps, weight }]
//   - completed: boolean
//   - createdAt: timestamp
//
// users/{uid}/logs/{logId}
//   - workoutId: string
//   - workoutName: string
//   - duration: number
//   - caloriesBurned: number
//   - date: timestamp
// ─────────────────────────────────────────────────────────────
