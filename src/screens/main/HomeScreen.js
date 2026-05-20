// src/screens/main/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { SectionHeader, Card } from '../../components/UIComponents';
import { WorkoutCard } from '../../components/WorkoutCard';

const QUOTES = [
  "Push past your limits — the body achieves what the mind believes.",
  "Every rep brings you closer to your best self.",
  "Consistency beats perfection every single time.",
  "Rest is part of the plan. Show up tomorrow.",
  "Small daily progress leads to extraordinary results.",
];

export default function HomeScreen({ navigation }) {
  const { user, profile } = useAuth();
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [stats, setStats]                   = useState({ total: 0, week: 0, completed: 0 });
  const [refreshing, setRefreshing]         = useState(false);
  const quote = QUOTES[new Date().getDay() % QUOTES.length];

  // greeting by time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (profile?.displayName || user?.displayName || 'Champ').split(' ')[0];

  useEffect(() => {
    if (!user) return;
    const col = collection(db, 'users', user.uid, 'workouts');

    // Recent workouts
    const q = query(col, orderBy('createdAt', 'desc'), limit(3));
    const unsubRecent = onSnapshot(q, snap => {
      setRecentWorkouts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Stats: total, completed
    const qAll = query(col, orderBy('createdAt', 'desc'));
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const unsubStats = onSnapshot(qAll, snap => {
      const all = snap.docs.map(d => d.data());
      const weekStart = Timestamp.fromDate(startOfWeek);
      const weekCount = all.filter(w => w.createdAt > weekStart).length;
      setStats({
        total:     all.length,
        week:      weekCount,
        completed: all.filter(w => w.completed).length,
      });
    });

    return () => { unsubRecent(); unsubStats(); };
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Top header */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <LinearGradient colors={[colors.primary, '#00B4D8']} style={styles.avatar}>
              <Text style={styles.avatarText}>{firstName[0].toUpperCase()}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Hero Quote card */}
        <LinearGradient
          colors={['#1A2744', '#0F1929']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.quoteCard}
        >
          <View style={styles.quoteDot} />
          <Ionicons name="flame" size={22} color={colors.primary} style={{ marginBottom: 10 }} />
          <Text style={styles.quoteText}>"{quote}"</Text>
          <Text style={styles.quoteLabel}>Daily Motivation</Text>
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBox icon="barbell-outline" value={stats.total}     label="Workouts" color={colors.primary} />
          <StatBox icon="calendar-outline" value={stats.week}     label="This Week" color={colors.secondary} />
          <StatBox icon="checkmark-circle-outline" value={stats.completed} label="Completed" color={colors.success} />
        </View>

        {/* Quick actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsGrid}>
          <QuickAction icon="add-circle" label="New Workout" color={colors.primary}   onPress={() => navigation.navigate('Workouts', { openAdd: true })} />
          <QuickAction icon="list"        label="My Workouts" color={colors.secondary} onPress={() => navigation.navigate('Workouts')} />
          <QuickAction icon="stats-chart" label="Progress"    color={colors.accent}   onPress={() => navigation.navigate('Progress')} />
          <QuickAction icon="person"      label="Profile"     color={colors.warning}  onPress={() => navigation.navigate('Profile')} />
        </View>

        {/* Recent workouts */}
        <SectionHeader
          title="Recent Workouts"
          action="See All"
          onAction={() => navigation.navigate('Workouts')}
        />
        {recentWorkouts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="barbell-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No workouts yet</Text>
            <Text style={styles.emptySub}>Tap "New Workout" to get started</Text>
          </Card>
        ) : (
          recentWorkouts.map(w => (
            <WorkoutCard
              key={w.id}
              workout={w}
              onPress={() => navigation.navigate('WorkoutDetail', { workoutId: w.id })}
            />
          ))
        )}

        {/* Today tip */}
        {profile?.goal && (
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={18} color={colors.warning} />
            <Text style={styles.tipText}>
              Goal: <Text style={{ color: colors.warning, fontWeight: '700' }}>{profile.goal}</Text>{' '}
              — Stay consistent and track every session!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const StatBox = ({ icon, value, label, color }) => (
  <View style={[styles.statBox, { borderColor: color + '30' }]}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={[styles.statVal, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const QuickAction = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.qaBtn} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.qaIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.qaLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: colors.bg },
  scroll:      { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 32 },

  topRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting:    { fontSize: 14, color: colors.textSub },
  name:        { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 2 },
  notifBtn:    { alignItems: 'center' },
  avatar:      { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 18, fontWeight: '800', color: colors.bg },

  quoteCard:   { borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border, position: 'relative', overflow: 'hidden' },
  quoteDot:    { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: colors.primary + '08' },
  quoteText:   { fontSize: 15, color: colors.text, lineHeight: 24, fontStyle: 'italic', marginBottom: 8 },
  quoteLabel:  { fontSize: 11, color: colors.primary, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },

  statsRow:    { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox:     { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1 },
  statVal:     { fontSize: 22, fontWeight: '800' },
  statLabel:   { fontSize: 11, color: colors.textSub, fontWeight: '600' },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  qaBtn:       { width: '47%', backgroundColor: colors.card, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  qaIcon:      { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  qaLabel:     { fontSize: 13, fontWeight: '600', color: colors.text },

  emptyCard:   { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyTitle:  { fontSize: 16, fontWeight: '700', color: colors.textSub },
  emptySub:    { fontSize: 13, color: colors.textMuted, textAlign: 'center' },

  tipCard:     { flexDirection: 'row', gap: 10, backgroundColor: colors.warning + '15', borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, borderColor: colors.warning + '30', alignItems: 'flex-start' },
  tipText:     { fontSize: 13, color: colors.textSub, flex: 1, lineHeight: 20 },
});
