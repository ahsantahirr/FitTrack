// src/navigation/AppNavigator.js
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

// Auth screens
import LoginScreen          from '../screens/auth/LoginScreen';
import RegisterScreen       from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main screens
import HomeScreen           from '../screens/main/HomeScreen';
import WorkoutsScreen       from '../screens/main/WorkoutsScreen';
import WorkoutDetailScreen  from '../screens/main/WorkoutDetailScreen';
import AddWorkoutScreen     from '../screens/main/AddWorkoutScreen';
import ProgressScreen       from '../screens/main/ProgressScreen';
import ProfileScreen        from '../screens/main/ProfileScreen';

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const Tab       = createBottomTabNavigator();

// ── Bottom Tab Navigator ────────────────────────────────────
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown:   false,
        tabBarStyle:   styles.tabBar,
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home:     focused ? 'home'          : 'home-outline',
            Workouts: focused ? 'barbell'       : 'barbell-outline',
            Progress: focused ? 'stats-chart'   : 'stats-chart-outline',
            Profile:  focused ? 'person'        : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile"  component={ProfileScreen}  />
    </Tab.Navigator>
  );
}

// ── Main Stack (with tabs + modals) ─────────────────────────
function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Tabs"          component={TabNavigator} />
      <MainStack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <MainStack.Screen
        name="AddWorkout"
        component={AddWorkoutScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />
    </MainStack.Navigator>
  );
}

// ── Auth Stack ───────────────────────────────────────────────
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login"          component={LoginScreen}          />
      <AuthStack.Screen name="Register"       component={RegisterScreen}       />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// ── Root Navigator ───────────────────────────────────────────
export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <LinearGradient colors={[colors.primary, '#00B4D8']} style={styles.splashLogo}>
          <Ionicons name="fitness" size={36} color={colors.bg} />
        </LinearGradient>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex:            1,
    backgroundColor: colors.bg,
    alignItems:      'center',
    justifyContent:  'center',
  },
  splashLogo: {
    width:         80,
    height:        80,
    borderRadius:  22,
    alignItems:    'center',
    justifyContent:'center',
  },
  tabBar: {
    backgroundColor:  colors.surface,
    borderTopColor:   colors.border,
    borderTopWidth:   1,
    paddingTop:       8,
    height:           72,
    elevation:        0,
    shadowOpacity:    0,
  },
});
