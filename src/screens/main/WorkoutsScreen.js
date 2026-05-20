// src/screens/main/WorkoutsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, TextInput,
} from 'react-native';
import {
  collection, query, orderBy, onSnapshot,
  deleteDoc, doc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { WorkoutCard } from '../../components/WorkoutCard';
import { EmptyState } from '../../components/UIComponents';

const CATEGORIES = ['All', 'Strength', 'Cardio', 'Flexibility', 'HIIT', 'Yoga', 'Other'];

export default function WorkoutsScreen({ navigation, route }) {
  const { user } = useAuth();
  const [workouts, setWorkouts]     = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const col = collection(db, 'users', user.uid, 'workouts');
    const q   = query(col, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setWorkouts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  // Open add modal if triggered from Home
  useEffect(() => {
    if (route.params?.openAdd) {
      navigation.navigate('AddWorkout');
      navigation.setParams({ openAdd: false });
    }
  }, [route.params?.openAdd]);

  // Filter
  useEffect(() => {
    let result = workouts;
    if (category !== 'All') result = result.filter(w => w.category === category);
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(w =>
        w.name.toLowerCase().includes(s) || w.notes?.toLowerCase().includes(s)
      );
    }
    setFiltered(result);
  }, [workouts, category, search]);

  const handleDelete = (id) => {
    Alert.alert('Delete Workout', 'This cannot be undone. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try { await deleteDoc(doc(db, 'users', user.uid, 'workouts', id)); }
          catch { Alert.alert('Error', 'Could not delete. Try again.'); }
        },
      },
    ]);
  };

  const handleComplete = async (workout) => {
    try {
      await updateDoc(doc(db, 'users', user.uid, 'workouts', workout.id), {
        completed:   !workout.completed,
        completedAt: workout.completed ? null : serverTimestamp(),
      });
    } catch { Alert.alert('Error', 'Could not update workout.'); }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const header = () => (
    <View>
      {/* Page title */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>My Workouts</Text>
          <Text style={styles.pageSub}>{workouts.length} total</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddWorkout')}
        >
          <Ionicons name="add" size={24} color={colors.bg} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search workouts..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          selectionColor={colors.primary}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={{ padding: 4 }}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter chips */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        style={styles.chipList}
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, category === item && styles.chipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.chipText, category === item && styles.chipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🏋️"
            title={search ? 'No results found' : 'No workouts yet'}
            subtitle={search ? 'Try a different search term' : 'Tap the + button to create your first workout'}
            action={!search ? 'Add Workout' : undefined}
            onAction={() => navigation.navigate('AddWorkout')}
          />
        }
        renderItem={({ item }) => (
          <WorkoutCard
            workout={item}
            onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item.id })}
            onDelete={() => handleDelete(item.id)}
            onComplete={() => handleComplete(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: colors.bg },
  list:         { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 32 },

  pageHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pageTitle:    { fontSize: 28, fontWeight: '800', color: colors.text },
  pageSub:      { fontSize: 13, color: colors.textSub, marginTop: 2 },
  addBtn:       { width: 48, height: 48, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },

  searchRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 14, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  searchIcon:   { marginRight: 8 },
  searchInput:  { flex: 1, height: 48, fontSize: 14, color: colors.text },

  chipList:     { marginBottom: 20 },
  chip:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipActive:   { backgroundColor: colors.primaryDim, borderColor: colors.primary },
  chipText:     { fontSize: 13, color: colors.textSub, fontWeight: '600' },
  chipTextActive:{ color: colors.primary },
});
