// src/screens/main/ProgressScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Card, SectionHeader } from '../../components/UIComponents';

const { width } = Dimensions.get('window');
const BAR_MAX_H = 100;

export default function ProgressScreen() {
  const { user, profile } = useAuth();
  const [workouts, setWorkouts]   = useState([]);
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!user) return;
    let done1 = false, done2 = false;
    const finish = () => { if (done1 && done2) setLoading(false); };

    const unsubW = onSnapshot(
      query(collection(db, 'users', user.uid, 'workouts'), orderBy('createdAt', 'desc')),
      snap => { setWorkouts(snap.docs.map(d => ({ id: d.id, ...d.data() }))); done1 = true; finish(); }
    );
    const unsubL = onSnapshot(
      query(collection(db, 'users', user.uid, 'logs'), orderBy('date', 'desc')),
      snap => { setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() }))); done2 = true; finish(); }
    );
    return () => { unsubW(); unsubL(); };
  }, [user]);

  // Stats
  const completed    = workouts.filter(w => w.completed).length;
  const totalMinutes = logs.reduce((s, l) => s + (l.duration || 0), 0);
  const totalCal     = logs.reduce((s, l) => s + (l.caloriesBurned || 0), 0);
  const completionRate = workouts.length ? Math.round((completed / workouts.length) * 100) : 0;

  // Category breakdown
  const catCounts = {};
  workouts.forEach(w => { catCounts[w.category] = (catCounts[w.category] || 0) + 1; });
  const catData = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  const maxCat  = Math.max(...Object.values(catCounts), 1);

  // Last 7 days activity
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const next = new Date(d); next.setDate(d.getDate() + 1);
    const count = logs.filter(l => {
      const ld = l.date?.toDate?.();
      return ld && ld >= d && ld < next;
    }).length;
    return { day: ['S','M','T','W','T','F','S'][d.getDay()], count };
  });
  const maxDay = Math.max(...last7.map(d => d.count), 1);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.pageTitle}>Progress</Text>
        <Text style={styles.pageSub}>Track your fitness journey</Text>

        {/* Summary cards */}
        <View style={styles.statsGrid}>
          <BigStat icon="barbell-outline"  label="Total Workouts"   value={workouts.length}              color={colors.primary} />
          <BigStat icon="checkmark-circle-outline" label="Completed" value={completed}                   color={colors.success} />
          <BigStat icon="flame-outline"    label="Calories Burned"  value={`${totalCal.toLocaleString()} kcal`} color={colors.accent} />
          <BigStat icon="time-outline"     label="Total Minutes"    value={`${totalMinutes} min`}         color={colors.secondary} />
        </View>

        {/* Completion ring */}
        <Card style={styles.ringCard}>
          <View style={styles.ringRow}>
            <View>
              <Text style={styles.ringLabel}>Completion Rate</Text>
              <Text style={styles.ringValue}>{completionRate}%</Text>
              <Text style={styles.ringSub}>{completed} of {workouts.length} workouts done</Text>
            </View>
            <View style={styles.ring}>
              <View style={[styles.ringFill, {
                borderColor: completionRate > 60 ? colors.success : completionRate > 30 ? colors.warning : colors.error,
              }]}>
                <Text style={styles.ringPct}>{completionRate}%</Text>
              </View>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {
              width: `${completionRate}%`,
              backgroundColor: completionRate > 60 ? colors.success : completionRate > 30 ? colors.warning : colors.error,
            }]} />
          </View>
        </Card>

        {/* 7-day bar chart */}
        <SectionHeader title="Last 7 Days" />
        <Card style={styles.chartCard}>
          <View style={styles.barChart}>
            {last7.map((d, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barTrack}>
                  {d.count > 0 && (
                    <LinearGradient
                      colors={[colors.primary, '#00B4D8']}
                      style={[styles.bar, { height: (d.count / maxDay) * BAR_MAX_H }]}
                    />
                  )}
                </View>
                <Text style={styles.barLabel}>{d.day}</Text>
                {d.count > 0 && <Text style={styles.barCount}>{d.count}</Text>}
              </View>
            ))}
          </View>
          <Text style={styles.chartNote}>Sessions logged per day</Text>
        </Card>

        {/* Category breakdown */}
        {catData.length > 0 && (
          <>
            <SectionHeader title="By Category" />
            <Card>
              {catData.map(([cat, count]) => {
                const color = colors.categories[cat] || colors.textSub;
                return (
                  <View key={cat} style={styles.catRow}>
                    <View style={[styles.catDot, { backgroundColor: color }]} />
                    <Text style={styles.catName}>{cat}</Text>
                    <View style={styles.catBarTrack}>
                      <View style={[styles.catBar, { width: `${(count / maxCat) * 100}%`, backgroundColor: color }]} />
                    </View>
                    <Text style={[styles.catCount, { color }]}>{count}</Text>
                  </View>
                );
              })}
            </Card>
          </>
        )}

        {/* Profile summary */}
        {profile && (profile.weight || profile.height || profile.goal) && (
          <>
            <SectionHeader title="My Profile" style={{ marginTop: 8 }} />
            <Card>
              {profile.goal && <InfoRow icon="flag-outline"   label="Goal"   value={profile.goal} />}
              {profile.weight > 0 && <InfoRow icon="scale-outline"  label="Weight" value={`${profile.weight} kg`} />}
              {profile.height > 0 && <InfoRow icon="resize-outline" label="Height" value={`${profile.height} cm`} />}
              {profile.weight > 0 && profile.height > 0 && (() => {
                const bmi  = profile.weight / ((profile.height / 100) ** 2);
                const cat  = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
                const col  = bmi < 18.5 ? colors.warning : bmi < 25 ? colors.success : colors.error;
                return <InfoRow icon="body-outline" label="BMI" value={`${bmi.toFixed(1)} (${cat})`} valueColor={col} />;
              })()}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const BigStat = ({ icon, label, value, color }) => (
  <View style={[styles.bigStat, { borderColor: color + '30' }]}>
    <View style={[styles.bigStatIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={[styles.bigStatVal, { color }]}>{value}</Text>
    <Text style={styles.bigStatLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ icon, label, value, valueColor }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={16} color={colors.textSub} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoVal, valueColor && { color: valueColor }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.bg },
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  scroll:     { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },

  pageTitle:  { fontSize: 28, fontWeight: '800', color: colors.text },
  pageSub:    { fontSize: 14, color: colors.textSub, marginTop: 4, marginBottom: 24 },

  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  bigStat:    { width: (width - 50) / 2, backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1 },
  bigStatIcon:{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  bigStatVal: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  bigStatLabel:{ fontSize: 11, color: colors.textSub, fontWeight: '600' },

  ringCard:   { marginBottom: 24 },
  ringRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  ringLabel:  { fontSize: 12, color: colors.textSub, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  ringValue:  { fontSize: 36, fontWeight: '800', color: colors.text },
  ringSub:    { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  ring:       { width: 70, height: 70 },
  ringFill:   { width: 70, height: 70, borderRadius: 35, borderWidth: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  ringPct:    { fontSize: 14, fontWeight: '800', color: colors.text },
  progressTrack:{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  chartCard:  { marginBottom: 24 },
  barChart:   { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: BAR_MAX_H + 40 },
  barCol:     { alignItems: 'center', flex: 1 },
  barTrack:   { height: BAR_MAX_H, justifyContent: 'flex-end', width: 24, borderRadius: 6, overflow: 'hidden', backgroundColor: colors.border },
  bar:        { width: '100%', borderRadius: 6, minHeight: 4 },
  barLabel:   { fontSize: 11, color: colors.textSub, marginTop: 6, fontWeight: '600' },
  barCount:   { fontSize: 10, color: colors.primary, fontWeight: '700', marginTop: 2 },
  chartNote:  { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 12 },

  catRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  catDot:     { width: 8, height: 8, borderRadius: 4 },
  catName:    { fontSize: 13, color: colors.text, width: 84, fontWeight: '600' },
  catBarTrack:{ flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  catBar:     { height: '100%', borderRadius: 3 },
  catCount:   { fontSize: 13, fontWeight: '700', width: 24, textAlign: 'right' },

  infoRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel:  { fontSize: 14, color: colors.textSub, flex: 1 },
  infoVal:    { fontSize: 14, fontWeight: '700', color: colors.text },
});
