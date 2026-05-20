// src/screens/main/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Button, Input, Card, Divider } from '../../components/UIComponents';

const GOALS = ['Lose Weight', 'Build Muscle', 'Stay Fit', 'Improve Endurance'];

export default function ProfileScreen() {
  const { user, profile, logout, refreshProfile } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [pwMode, setPwMode]     = useState(false);

  const [form, setForm] = useState({
    displayName: '', weight: '', height: '', goal: 'Stay Fit',
  });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    if (profile || user) {
      setForm({
        displayName: profile?.displayName || user?.displayName || '',
        weight:      profile?.weight?.toString() || '',
        height:      profile?.height?.toString() || '',
        goal:        profile?.goal || 'Stay Fit',
      });
    }
  }, [profile, user]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSaveProfile = async () => {
    if (!form.displayName.trim()) {
      Alert.alert('Validation', 'Name cannot be empty.'); return;
    }
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: form.displayName.trim() });
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: form.displayName.trim(),
        weight:      parseFloat(form.weight) || 0,
        height:      parseFloat(form.height) || 0,
        goal:        form.goal,
      });
      await refreshProfile();
      setEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch {
      Alert.alert('Error', 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.current)           { Alert.alert('Error', 'Enter your current password.'); return; }
    if (pwForm.next.length < 6)    { Alert.alert('Error', 'New password must be 6+ characters.'); return; }
    if (pwForm.next !== pwForm.confirm) { Alert.alert('Error', 'Passwords do not match.'); return; }
    setLoading(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, pwForm.current);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, pwForm.next);
      setPwMode(false);
      setPwForm({ current: '', next: '', confirm: '' });
      Alert.alert('Success', 'Password updated successfully!');
    } catch (err) {
      if (err.code === 'auth/wrong-password') Alert.alert('Error', 'Current password is incorrect.');
      else Alert.alert('Error', 'Could not update password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const firstName = (profile?.displayName || user?.displayName || 'User').split(' ')[0];
  const initial   = firstName[0]?.toUpperCase() || 'U';

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Avatar hero */}
          <View style={styles.heroSection}>
            <LinearGradient colors={[colors.primary, '#00B4D8']} style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </LinearGradient>
            <Text style={styles.name}>{profile?.displayName || user?.displayName || 'User'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            {profile?.goal && (
              <View style={styles.goalBadge}>
                <Ionicons name="flag-outline" size={12} color={colors.primary} />
                <Text style={styles.goalText}>{profile.goal}</Text>
              </View>
            )}
          </View>

          {/* Edit / View profile */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Info</Text>
            <TouchableOpacity onPress={() => setEditing(e => !e)}>
              <Text style={styles.editLink}>{editing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <Card>
              <Input label="Full Name" value={form.displayName} onChangeText={v => set('displayName', v)} placeholder="Your name" />
              <View style={styles.row}>
                <Input label="Weight (kg)" value={form.weight} onChangeText={v => set('weight', v)} keyboardType="numeric" placeholder="70" containerStyle={{ flex: 1, marginRight: 8 }} />
                <Input label="Height (cm)" value={form.height} onChangeText={v => set('height', v)} keyboardType="numeric" placeholder="175" containerStyle={{ flex: 1 }} />
              </View>
              <Text style={styles.fieldLabel}>Fitness Goal</Text>
              <View style={styles.goalGrid}>
                {GOALS.map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.goalChip, form.goal === g && styles.goalChipActive]}
                    onPress={() => set('goal', g)}
                  >
                    <Text style={[styles.goalChipText, form.goal === g && { color: colors.primary }]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button title="Save Changes" onPress={handleSaveProfile} loading={loading} style={{ marginTop: 4 }} />
            </Card>
          ) : (
            <Card>
              <InfoRow icon="person-outline"   label="Name"   value={profile?.displayName || user?.displayName || '—'} />
              <InfoRow icon="mail-outline"     label="Email"  value={user?.email} />
              {profile?.weight > 0 && <InfoRow icon="scale-outline" label="Weight" value={`${profile.weight} kg`} />}
              {profile?.height > 0 && <InfoRow icon="resize-outline" label="Height" value={`${profile.height} cm`} />}
              {profile?.goal && <InfoRow icon="flag-outline"  label="Goal"   value={profile.goal} last />}
            </Card>
          )}

          <Divider />

          {/* Change password */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Security</Text>
            <TouchableOpacity onPress={() => setPwMode(e => !e)}>
              <Text style={styles.editLink}>{pwMode ? 'Cancel' : 'Change'}</Text>
            </TouchableOpacity>
          </View>

          {pwMode ? (
            <Card>
              <Input label="Current Password" value={pwForm.current} onChangeText={v => setPwForm(p => ({ ...p, current: v }))} secureTextEntry placeholder="••••••••" />
              <Input label="New Password"     value={pwForm.next}    onChangeText={v => setPwForm(p => ({ ...p, next: v }))}    secureTextEntry placeholder="Min 6 characters" />
              <Input label="Confirm Password" value={pwForm.confirm} onChangeText={v => setPwForm(p => ({ ...p, confirm: v }))} secureTextEntry placeholder="Repeat new password" />
              <Button title="Update Password" onPress={handleChangePassword} loading={loading} />
            </Card>
          ) : (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textSub} />
                <Text style={{ color: colors.textSub, fontSize: 14 }}>Password is set</Text>
                <View style={{ flex: 1 }} />
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>••••••••</Text>
              </View>
            </Card>
          )}

          <Divider />

          {/* App info */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={styles.appInfoTitle}>FitTrack</Text>
            <Text style={styles.appInfoSub}>Version 1.0.0 · Built with Expo & Firebase</Text>
          </Card>

          {/* Logout */}
          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            textStyle={{ color: colors.error }}
            style={{ borderColor: colors.error }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const InfoRow = ({ icon, label, value, last }) => (
  <View style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
    <Ionicons name={icon} size={16} color={colors.textSub} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoVal} numberOfLines={1}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: colors.bg },
  scroll:       { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },

  heroSection:  { alignItems: 'center', marginBottom: 32 },
  avatar:       { width: 88, height: 88, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText:   { fontSize: 36, fontWeight: '800', color: colors.bg },
  name:         { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 },
  email:        { fontSize: 14, color: colors.textSub, marginBottom: 10 },
  goalBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.primaryDim, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: colors.primary + '40' },
  goalText:     { fontSize: 12, color: colors.primary, fontWeight: '700' },

  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  editLink:     { fontSize: 14, color: colors.primary, fontWeight: '600' },

  row:          { flexDirection: 'row' },
  fieldLabel:   { fontSize: 13, fontWeight: '600', color: colors.textSub, marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  goalGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  goalChip:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  goalChipActive:{ borderColor: colors.primary, backgroundColor: colors.primaryDim },
  goalChipText: { fontSize: 12, color: colors.textSub, fontWeight: '600' },

  infoRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  infoLabel:    { fontSize: 14, color: colors.textSub, width: 70 },
  infoVal:      { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text, textAlign: 'right' },

  appInfoTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 },
  appInfoSub:   { fontSize: 13, color: colors.textMuted },
});
