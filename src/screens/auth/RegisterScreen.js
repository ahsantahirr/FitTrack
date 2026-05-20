// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../../firebase';
import { colors } from '../../theme/colors';
import { Button, Input } from '../../components/UIComponents';

const GOALS = ['Lose Weight', 'Build Muscle', 'Stay Fit', 'Improve Endurance'];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPw: '',
    weight: '', height: '', goal: 'Stay Fit',
  });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name     = 'Name is required';
    if (!form.email.trim())  e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)      e.password  = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirmPw) e.confirmPw = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      await updateProfile(cred.user, { displayName: form.name.trim() });
      await setDoc(doc(db, 'users', cred.user.uid), {
        displayName: form.name.trim(),
        email:       form.email.trim(),
        weight:      parseFloat(form.weight) || 0,
        height:      parseFloat(form.height) || 0,
        goal:        form.goal,
        createdAt:   serverTimestamp(),
      });
    } catch (err) {
      let msg = 'Registration failed. Try again.';
      if (err.code === 'auth/email-already-in-use') msg = 'An account with this email already exists.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.blob1} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <LinearGradient colors={[colors.primary, '#00B4D8']} style={styles.logoCircle}>
              <Ionicons name="fitness" size={24} color={colors.bg} />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.sub}>Start your fitness journey today</Text>

          {/* Personal Info */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Personal Info</Text>
            <Input label="Full Name" value={form.name} onChangeText={v => set('name', v)} placeholder="John Doe" error={errors.name} />
            <Input label="Email" value={form.email} onChangeText={v => set('email', v)} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" error={errors.email} />
          </View>

          {/* Body Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Body Stats (optional)</Text>
            <View style={styles.row}>
              <Input label="Weight (kg)" value={form.weight} onChangeText={v => set('weight', v)} keyboardType="numeric" placeholder="70" containerStyle={{ flex: 1, marginRight: 8 }} />
              <Input label="Height (cm)" value={form.height} onChangeText={v => set('height', v)} keyboardType="numeric" placeholder="175" containerStyle={{ flex: 1 }} />
            </View>
          </View>

          {/* Goal */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Fitness Goal</Text>
            <View style={styles.goalGrid}>
              {GOALS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.goalChip, form.goal === g && styles.goalChipActive]}
                  onPress={() => set('goal', g)}
                >
                  <Text style={[styles.goalText, form.goal === g && styles.goalTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Password */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Security</Text>
            <View style={{ position: 'relative' }}>
              <Input label="Password" value={form.password} onChangeText={v => set('password', v)} secureTextEntry={!showPw} placeholder="Min 6 characters" error={errors.password} />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSub} />
              </TouchableOpacity>
            </View>
            <Input label="Confirm Password" value={form.confirmPw} onChangeText={v => set('confirmPw', v)} secureTextEntry={!showPw} placeholder="Repeat password" error={errors.confirmPw} />
          </View>

          <Button title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:            { flex: 1, backgroundColor: colors.bg },
  blob1:           { position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: colors.secondary + '15' },
  scroll:          { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },

  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  backBtn:         { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  logoCircle:      { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  title:           { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  sub:             { fontSize: 14, color: colors.textSub, marginTop: 4, marginBottom: 28 },

  section:         { marginBottom: 24 },
  sectionLabel:    { fontSize: 12, fontWeight: '700', color: colors.primary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 },
  row:             { flexDirection: 'row' },

  goalGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalChip:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  goalChipActive:  { backgroundColor: colors.primaryDim, borderColor: colors.primary },
  goalText:        { fontSize: 13, color: colors.textSub, fontWeight: '600' },
  goalTextActive:  { color: colors.primary },

  eyeBtn:          { position: 'absolute', right: 14, top: 42 },

  footer:          { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText:      { fontSize: 14, color: colors.textSub },
  footerLink:      { fontSize: 14, color: colors.primary, fontWeight: '700' },
});
