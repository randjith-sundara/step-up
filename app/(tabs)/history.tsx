import React from 'react';
import { StyleSheet, FlatList, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Colors from '@/constants/Colors';
import WorkoutCard from '@/components/WorkoutCard';
import { Workout } from '@/types';
import { StorageService } from '@/services/storage';

export default function HistoryScreen() {
  const [workouts, setWorkouts] = React.useState<Workout[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const loadWorkouts = async () => {
    const data = await StorageService.getWorkouts();
    // Filter for completed workouts
    const completed = data.filter(w => w.status === 'completed');
    // Sort by date desc
    const sorted = completed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setWorkouts(sorted);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      {workouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No completed workouts yet.</Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WorkoutCard
              workout={item}
              onPress={() => { }} // Maybe show details later
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
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
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
