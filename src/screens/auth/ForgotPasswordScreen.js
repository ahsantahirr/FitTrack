// src/screens/auth/ForgotPasswordScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../../firebase';
import { colors } from '../../theme/colors';
import { Button, Input } from '../../components/UIComponents';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  const handleReset = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch {
      Alert.alert('Error', 'Could not send reset email. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.blob} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.icon}>
          <Ionicons name="lock-open-outline" size={40} color={colors.primary} />
        </View>

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.sub}>
          {sent
            ? 'Check your inbox! We sent a reset link to your email.'
            : 'Enter the email linked to your account and we\'ll send a reset link.'}
        </Text>

        {!sent ? (
          <>
            <Input
              label="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
              containerStyle={{ marginTop: 24 }}
            />
            <Button title="Send Reset Link" onPress={handleReset} loading={loading} style={{ marginTop: 8 }} />
          </>
        ) : (
          <Button title="Back to Login" onPress={() => navigation.navigate('Login')} style={{ marginTop: 32 }} />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: colors.bg },
  blob:  { position: 'absolute', top: -80, left: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: colors.primary + '10' },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 70 },
  back:  { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: 32 },
  icon:  { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.primaryDim, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: colors.primary + '40' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  sub:   { fontSize: 14, color: colors.textSub, marginTop: 8, lineHeight: 22 },
});
