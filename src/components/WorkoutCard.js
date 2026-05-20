// src/components/WorkoutCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Badge } from './UIComponents';

export const WorkoutCard = ({ workout, onPress, onDelete, onComplete }) => {
  const catColor = colors.categories[workout.category] || colors.textSub;

  return (
    <TouchableOpacity
      style={[styles.card, workout.completed && styles.cardCompleted]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: catColor }]} />

      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>{workout.name}</Text>
            {workout.completed && (
              <Ionicons name="checkmark-circle" size={16} color={colors.success} style={{ marginLeft: 6 }} />
            )}
          </View>
          <Badge label={workout.category} color={catColor} />
        </View>

        {/* Stats row */}
        <View style={styles.stats}>
          <Stat icon="time-outline" value={`${workout.duration} min`} />
          <Stat icon="barbell-outline" value={`${workout.exercises?.length ?? 0} exercises`} />
        </View>

        {/* Notes */}
        {workout.notes ? (
          <Text style={styles.notes} numberOfLines={2}>{workout.notes}</Text>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.success + '20' }]}
            onPress={onComplete}
          >
            <Ionicons
              name={workout.completed ? 'refresh-outline' : 'checkmark-outline'}
              size={14}
              color={colors.success}
            />
            <Text style={[styles.actionText, { color: colors.success }]}>
              {workout.completed ? 'Redo' : 'Complete'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.error + '20' }]}
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={14} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Stat = ({ icon, value }) => (
  <View style={styles.stat}>
    <Ionicons name={icon} size={13} color={colors.textSub} />
    <Text style={styles.statText}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardCompleted: {
    opacity: 0.8,
    borderColor: colors.success + '40',
  },
  accentBar: {
    width: 4,
    borderRadius: 4,
    margin: 12,
    marginRight: 0,
    minHeight: 60,
  },
  content:    { flex: 1, padding: 14 },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  titleRow:   { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  name:       { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  stats:      { flexDirection: 'row', gap: 16, marginBottom: 8 },
  stat:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText:   { fontSize: 12, color: colors.textSub, fontWeight: '500' },
  notes:      { fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: 10 },
  actions:    { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  actionText: { fontSize: 12, fontWeight: '600' },
});
