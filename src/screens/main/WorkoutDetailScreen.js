// src/screens/main/WorkoutDetailScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import {
  doc, getDoc, deleteDoc, updateDoc, serverTimestamp,
  addDoc, collection,
} from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Button, Badge, Card, Divider } from '../../components/UIComponents';

export default function WorkoutDetailScreen({ navigation, route }) {
  const { workoutId } = route.params;
  const { user }      = useAuth();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'workouts', workoutId));
        if (snap.exists()) setWorkout({ id: snap.id, ...snap.data() });
      } catch { Alert.alert('Error', 'Failed to load workout.'); }
      finally  { setLoading(false); }
    })();
  }, [workoutId]);

  const handleDelete = () => {
    Alert.alert('Delete Workout', 'Are you sure? This is permanent.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'users', user.uid, 'workouts', workoutId));
          navigation.goBack();
        },
      },
    ]);
  };

  const handleComplete = async () => {
    const next = !workout.completed;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'workouts', workoutId), {
        completed:   next,
        completedAt: next ? serverTimestamp() : null,
      });
      // Log it
      if (next) {
        await addDoc(collection(db, 'users', user.uid, 'logs'), {
          workoutId,
          workoutName:    workout.name,
          duration:       workout.duration,
          caloriesBurned: Math.round(workout.duration * 7),
          date:           serverTimestamp(),
        });
      }
      setWorkout(p => ({ ...p, completed: next }));
    } catch { Alert.alert('Error', 'Update failed.'); }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }
  if (!workout) {
    return <View style={styles.center}><Text style={{ color: colors.textSub }}>Workout not found.</Text></View>;
  }

  const catColor = colors.categories[workout.category] || colors.primary;
  const totalSets = workout.exercises?.reduce((s, e) => s + (e.sets || 0), 0) || 0;
  const totalVol  = workout.exercises?.reduce((s, e) => s + ((e.sets || 0) * (e.reps || 0) * (e.weight || 0)), 0) || 0;

  return (
    <View style={styles.root}>
      {/* Hero */}
      <LinearGradient
        colors={[catColor + '30', colors.bg]}
        style={styles.hero}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <Badge label={workout.category} color={catColor} />
          <Text style={styles.heroTitle}>{workout.name}</Text>
          {workout.completed && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatItem icon="time-outline"    label="Duration"   value={`${workout.duration} min`}  color={catColor} />
          <StatItem icon="barbell-outline" label="Exercises"  value={workout.exercises?.length ?? 0} color={colors.secondary} />
          <StatItem icon="layers-outline"  label="Total Sets" value={totalSets}                   color={colors.accent} />
          {totalVol > 0 && <StatItem icon="trending-up-outline" label="Volume" value={`${totalVol}kg`} color={colors.success} />}
        </View>

        {/* Notes */}
        {workout.notes ? (
          <Card style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Ionicons name="document-text-outline" size={16} color={colors.textSub} />
              <Text style={styles.notesLabel}>Notes</Text>
            </View>
            <Text style={styles.notesText}>{workout.notes}</Text>
          </Card>
        ) : null}

        <Divider />

        {/* Exercises */}
        <Text style={styles.sectionTitle}>Exercises</Text>
        {workout.exercises?.length ? (
          workout.exercises.map((ex, idx) => (
            <View key={idx} style={styles.exRow}>
              <View style={[styles.exIndex, { backgroundColor: catColor + '20' }]}>
                <Text style={[styles.exIndexText, { color: catColor }]}>{idx + 1}</Text>
              </View>
              <View style={styles.exInfo}>
                <Text style={styles.exName}>{ex.name}</Text>
                <View style={styles.exStats}>
                  <ExStat label="Sets" val={ex.sets} />
                  <ExStat label="Reps" val={ex.reps} />
                  {ex.weight > 0 && <ExStat label="Weight" val={`${ex.weight}kg`} />}
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginBottom: 20 }}>No exercises added.</Text>
        )}

        <Divider />

        {/* Actions */}
        <Button
          title={workout.completed ? 'Mark as Incomplete' : '✓ Mark as Complete'}
          onPress={handleComplete}
          variant={workout.completed ? 'outline' : 'primary'}
          style={{ marginBottom: 12 }}
        />
        <Button
          title="✏️  Edit Workout"
          onPress={() => navigation.navigate('AddWorkout', { workoutId: workout.id })}
          variant="outline"
          style={{ marginBottom: 12 }}
        />
        <Button
          title="Delete Workout"
          onPress={handleDelete}
          variant="ghost"
          textStyle={{ color: colors.error }}
        />
      </ScrollView>
    </View>
  );
}

const StatItem = ({ icon, label, value, color }) => (
  <View style={[styles.statItem, { borderColor: color + '30' }]}>
    <Ionicons name={icon} size={18} color={color} />
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ExStat = ({ label, val }) => (
  <View style={styles.exStatItem}>
    <Text style={styles.exStatVal}>{val}</Text>
    <Text style={styles.exStatLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: colors.bg },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },

  hero:           { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  backBtn:        { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.card + 'AA', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  heroContent:    { gap: 10 },
  heroTitle:      { fontSize: 28, fontWeight: '800', color: colors.text, lineHeight: 34 },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  completedText:  { fontSize: 13, color: colors.success, fontWeight: '600' },

  scroll:         { paddingHorizontal: 20, paddingBottom: 40 },

  statsRow:       { flexDirection: 'row', gap: 8, marginVertical: 20, flexWrap: 'wrap' },
  statItem:       { flex: 1, minWidth: 70, backgroundColor: colors.card, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, borderWidth: 1 },
  statValue:      { fontSize: 18, fontWeight: '800' },
  statLabel:      { fontSize: 10, color: colors.textSub, fontWeight: '600', textAlign: 'center' },

  notesCard:      { marginBottom: 4 },
  notesHeader:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  notesLabel:     { fontSize: 12, fontWeight: '700', color: colors.textSub, textTransform: 'uppercase', letterSpacing: 0.5 },
  notesText:      { fontSize: 14, color: colors.textSub, lineHeight: 22 },

  sectionTitle:   { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 14 },

  exRow:          { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  exIndex:        { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  exIndexText:    { fontSize: 13, fontWeight: '700' },
  exInfo:         { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border },
  exName:         { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 8 },
  exStats:        { flexDirection: 'row', gap: 12 },
  exStatItem:     { alignItems: 'center' },
  exStatVal:      { fontSize: 16, fontWeight: '800', color: colors.primary },
  exStatLabel:    { fontSize: 10, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase' },
});
