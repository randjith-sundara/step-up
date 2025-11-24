import React from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Colors from '@/constants/Colors';
import WorkoutCard from '@/components/WorkoutCard';
import { Workout } from '@/types';
import { StorageService } from '@/services/storage';

export default function DashboardScreen() {
  const [workouts, setWorkouts] = React.useState<Workout[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    const data = await StorageService.getWorkouts();
    // Filter for templates
    const templates = data.filter(w => w.status === 'template');
    // Sort by date desc
    const sorted = templates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setWorkouts(sorted);
  };

  const handleCreateWorkout = () => {
    router.push('/workout/create');
  };

  const handleWorkoutPress = async (id: string) => {
    const template = workouts.find(w => w.id === id);
    if (!template) return;

    // Create new active workout from template
    const newWorkout: Workout = {
      ...template,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      status: 'active',
      durationSeconds: 0,
      exercises: template.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({ ...s, completed: false }))
      }))
    };

    await StorageService.saveWorkout(newWorkout);
    router.push(`/workout/active/${newWorkout.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateWorkout}>
          <Text style={styles.createButtonText}>+ New Workout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My Templates</Text>

      {workouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No templates yet. Create one!</Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WorkoutCard
              workout={item}
              onPress={() => handleWorkoutPress(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  createButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: Colors.dark.background,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    color: Colors.dark.gray,
    fontSize: 16,
  },
});
