// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../../firebase';
import { colors } from '../../theme/colors';
import { Button, Input } from '../../components/UIComponents';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim())   e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password)       e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      let msg = 'Login failed. Please try again.';
      if (err.code === 'auth/user-not-found')    msg = 'No account with this email.';
      if (err.code === 'auth/wrong-password')    msg = 'Incorrect password.';
      if (err.code === 'auth/invalid-credential')msg = 'Invalid email or password.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Background gradient blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoArea}>
            <LinearGradient
              colors={[colors.primary, '#00B4D8']}
              style={styles.logoCircle}
            >
              <Ionicons name="fitness" size={32} color={colors.bg} />
            </LinearGradient>
            <Text style={styles.appName}>FitTrack</Text>
            <Text style={styles.tagline}>Your personal fitness companion</Text>
          </View>

          {/* Form card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome back</Text>
            <Text style={styles.formSub}>Sign in to continue your journey</Text>

            <Input
              label="Email"
              value={email}
              onChangeText={t => { setEmail(t); setErrors(p => ({ ...p, email: '' })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email}
              containerStyle={{ marginTop: 24 }}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: '' })); }}
              secureTextEntry={!showPw}
              placeholder="••••••••"
              error={errors.password}
              style={{ paddingRight: 48 }}
            />
            {/* Show/hide pw toggle */}
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPw(v => !v)}
            >
              <Ionicons
                name={showPw ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textSub}
              />
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: 8 }}
            />

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: colors.bg },
  blob1:       { position: 'absolute', top: -80,  left: -80,  width: 280, height: 280, borderRadius: 140, backgroundColor: colors.primary + '10' },
  blob2:       { position: 'absolute', bottom: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: colors.secondary + '15' },
  scroll:      { flexGrow: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },

  logoArea:    { alignItems: 'center', marginBottom: 40 },
  logoCircle:  { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  appName:     { fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  tagline:     { fontSize: 14, color: colors.textSub, marginTop: 4 },

  formCard:    { backgroundColor: colors.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.border, position: 'relative' },
  formTitle:   { fontSize: 24, fontWeight: '800', color: colors.text },
  formSub:     { fontSize: 14, color: colors.textSub, marginTop: 4 },

  eyeBtn:      { position: 'absolute', right: 40, bottom: 108, padding: 4 },

  forgotBtn:   { alignItems: 'center', marginTop: 16 },
  forgotText:  { fontSize: 14, color: colors.primary, fontWeight: '600' },

  footer:      { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  footerText:  { fontSize: 14, color: colors.textSub },
  footerLink:  { fontSize: 14, color: colors.primary, fontWeight: '700' },
});
