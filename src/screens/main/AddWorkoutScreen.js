// src/screens/main/AddWorkoutScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import {
  addDoc, updateDoc, doc, getDoc,
  collection, serverTimestamp,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Button, Input, Divider } from '../../components/UIComponents';

const CATEGORIES = ['Strength', 'Cardio', 'Flexibility', 'HIIT', 'Yoga', 'Other'];
const DURATIONS  = [15, 30, 45, 60, 75, 90, 120];

const emptyExercise = () => ({ id: Date.now().toString(), name: '', sets: '3', reps: '10', weight: '' });

export default function AddWorkoutScreen({ navigation, route }) {
  const { user } = useAuth();
  const editId = route.params?.workoutId;  // if editing

  const [form, setForm] = useState({
    name: '', category: 'Strength', duration: 45, notes: '',
  });
  const [exercises, setExercises] = useState([emptyExercise()]);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});

  // If editing, load existing workout
  useEffect(() => {
    if (!editId) return;
    (async () => {
      const snap = await getDoc(doc(db, 'users', user.uid, 'workouts', editId));
      if (snap.exists()) {
        const d = snap.data();
        setForm({ name: d.name, category: d.category, duration: d.duration, notes: d.notes || '' });
        setExercises(d.exercises?.length ? d.exercises.map((e, i) => ({ ...e, id: i.toString() })) : [emptyExercise()]);
      }
    })();
  }, [editId]);

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  // Exercise helpers
  const setExercise = (id, key, val) => {
    setExercises(prev => prev.map(e => e.id === id ? { ...e, [key]: val } : e));
  };
  const addExercise = () => {
    if (exercises.length >= 20) return;
    setExercises(p => [...p, emptyExercise()]);
  };
  const removeExercise = (id) => {
    if (exercises.length === 1) return;
    setExercises(p => p.filter(e => e.id !== id));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Workout name is required';
    const invalid = exercises.find(ex => !ex.name.trim());
    if (invalid) e.exercises = 'All exercises must have a name';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name:      form.name.trim(),
        category:  form.category,
        duration:  form.duration,
        notes:     form.notes.trim(),
        exercises: exercises.map(({ name, sets, reps, weight }) => ({
          name, sets: parseInt(sets) || 0, reps: parseInt(reps) || 0, weight: parseFloat(weight) || 0,
        })),
        completed: false,
      };

      if (editId) {
        await updateDoc(doc(db, 'users', user.uid, 'workouts', editId), { ...payload, updatedAt: serverTimestamp() });
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'users', user.uid, 'workouts'), payload);
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save workout. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editId ? 'Edit Workout' : 'New Workout'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Basic info */}
          <Text style={styles.sectionLabel}>Workout Details</Text>
          <Input
            label="Workout Name *"
            value={form.name}
            onChangeText={v => set('name', v)}
            placeholder="e.g. Upper Body Blast"
            error={errors.name}
          />

          {/* Category */}
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, form.category === c && { backgroundColor: (colors.categories[c] || colors.primary) + '25', borderColor: colors.categories[c] || colors.primary }]}
                onPress={() => set('category', c)}
              >
                <Text style={[styles.chipText, form.category === c && { color: colors.categories[c] || colors.primary }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Duration */}
          <Text style={styles.fieldLabel}>Duration (minutes)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
            {DURATIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.durationChip, form.duration === d && styles.durationChipActive]}
                onPress={() => set('duration', d)}
              >
                <Text style={[styles.durationText, form.duration === d && { color: colors.primary }]}>{d}m</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input
            label="Notes (optional)"
            value={form.notes}
            onChangeText={v => set('notes', v)}
            placeholder="Any tips or reminders..."
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: 'top', paddingTop: 12 }}
          />

          <Divider />

          {/* Exercises */}
          <View style={styles.exHeader}>
            <Text style={styles.sectionLabel}>Exercises</Text>
            {errors.exercises && <Text style={styles.errorText}>{errors.exercises}</Text>}
          </View>

          {exercises.map((ex, idx) => (
            <View key={ex.id} style={styles.exerciseCard}>
              <View style={styles.exHeaderRow}>
                <Text style={styles.exNum}>#{idx + 1}</Text>
                {exercises.length > 1 && (
                  <TouchableOpacity onPress={() => removeExercise(ex.id)}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
              <Input
                label="Exercise Name *"
                value={ex.name}
                onChangeText={v => setExercise(ex.id, 'name', v)}
                placeholder="e.g. Bench Press"
                containerStyle={{ marginBottom: 10 }}
              />
              <View style={styles.exRow}>
                <Input
                  label="Sets"
                  value={ex.sets}
                  onChangeText={v => setExercise(ex.id, 'sets', v)}
                  keyboardType="numeric"
                  placeholder="3"
                  containerStyle={{ flex: 1, marginRight: 8 }}
                />
                <Input
                  label="Reps"
                  value={ex.reps}
                  onChangeText={v => setExercise(ex.id, 'reps', v)}
                  keyboardType="numeric"
                  placeholder="10"
                  containerStyle={{ flex: 1, marginRight: 8 }}
                />
                <Input
                  label="kg"
                  value={ex.weight}
                  onChangeText={v => setExercise(ex.id, 'weight', v)}
                  keyboardType="numeric"
                  placeholder="0"
                  containerStyle={{ flex: 1 }}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addExBtn} onPress={addExercise}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.addExText}>Add Exercise</Text>
          </TouchableOpacity>

          <Button
            title={editId ? 'Save Changes' : 'Create Workout'}
            onPress={handleSave}
            loading={loading}
            style={{ marginTop: 24 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: colors.bg },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  backBtn:        { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  headerTitle:    { fontSize: 18, fontWeight: '700', color: colors.text },

  scroll:         { paddingHorizontal: 20, paddingBottom: 40 },
  sectionLabel:   { fontSize: 12, fontWeight: '700', color: colors.primary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 },
  fieldLabel:     { fontSize: 13, fontWeight: '600', color: colors.textSub, marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },

  chipGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipText:       { fontSize: 13, color: colors.textSub, fontWeight: '600' },

  durationChip:   { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  durationChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryDim },
  durationText:   { fontSize: 14, color: colors.textSub, fontWeight: '600' },

  exHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  errorText:      { fontSize: 12, color: colors.error },
  exerciseCard:   { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  exHeaderRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  exNum:          { fontSize: 13, fontWeight: '700', color: colors.primary },
  exRow:          { flexDirection: 'row' },

  addExBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primary + '60' },
  addExText:      { fontSize: 14, color: colors.primary, fontWeight: '600' },
});
