import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { Exercise, Set, Workout } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '@/services/storage';

export default function ActiveWorkoutScreen() {
    const { id } = useLocalSearchParams();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [duration, setDuration] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWorkout();
    }, [id]);

    const loadWorkout = async () => {
        if (typeof id !== 'string') return;
        const workout = await StorageService.getWorkoutById(id);
        if (workout) {
            setExercises(workout.exercises);
        }
        setLoading(false);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(d => d + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleSetComplete = (exerciseId: string, setId: string) => {
        setExercises(exercises.map(ex => {
            if (ex.id === exerciseId) {
                return {
                    ...ex,
                    sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
                };
            }
            return ex;
        }));
    };

    const updateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
        setExercises(exercises.map(ex => {
            if (ex.id === exerciseId) {
                return {
                    ...ex,
                    sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: Number(value) || 0 } : s)
                };
            }
            return ex;
        }));
    };

    const addSet = (exerciseId: string) => {
        setExercises(exercises.map(ex => {
            if (ex.id === exerciseId) {
                const lastSet = ex.sets[ex.sets.length - 1];
                const newSet: Set = {
                    id: Date.now().toString(),
                    reps: lastSet ? lastSet.reps : 10,
                    weight: lastSet ? lastSet.weight : 0,
                    completed: false,
                };
                return { ...ex, sets: [...ex.sets, newSet] };
            }
            return ex;
        }));
    };

    const handleFinish = async () => {
        if (typeof id !== 'string') return;

        const workout = await StorageService.getWorkoutById(id);
        if (workout) {
            const completedWorkout: Workout = {
                ...workout,
                exercises: exercises,
                durationSeconds: duration,
                completed: true,
                status: 'completed',
                date: new Date().toISOString() // Update date to finish time
            };
            await StorageService.saveWorkout(completedWorkout);
        }
        router.replace('/(tabs)/history');
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Active Workout</Text>
                    <Text style={styles.timer}>{formatTime(duration)}</Text>
                </View>
                <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
                    <Text style={styles.finishButtonText}>Finish</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {exercises.map((exercise, index) => (
                    <View key={exercise.id} style={styles.exerciseCard}>
                        <View style={styles.exerciseHeader}>
                            <Text style={styles.exerciseName}>{exercise.name}</Text>
                            <Ionicons name="ellipsis-horizontal" size={24} color={Colors.dark.gray} />
                        </View>

                        <View style={styles.tableHeader}>
                            <Text style={[styles.col, styles.colSet]}>Set</Text>
                            <Text style={[styles.col, styles.colInput]}>kg</Text>
                            <Text style={[styles.col, styles.colInput]}>Reps</Text>
                            <Text style={[styles.col, styles.colCheck]}>Done</Text>
                        </View>

                        {exercise.sets.map((set, setIndex) => (
                            <View key={set.id} style={[styles.setRow, set.completed && styles.setRowCompleted]}>
                                <Text style={[styles.col, styles.colSet]}>{setIndex + 1}</Text>
                                <TextInput
                                    style={[styles.input, styles.colInput]}
                                    value={set.weight.toString()}
                                    onChangeText={(v) => updateSet(exercise.id, set.id, 'weight', v)}
                                    keyboardType="numeric"
                                    selectTextOnFocus
                                />
                                <TextInput
                                    style={[styles.input, styles.colInput]}
                                    value={set.reps.toString()}
                                    onChangeText={(v) => updateSet(exercise.id, set.id, 'reps', v)}
                                    keyboardType="numeric"
                                    selectTextOnFocus
                                />
                                <TouchableOpacity
                                    style={[styles.checkButton, styles.colCheck, set.completed && styles.checkButtonActive]}
                                    onPress={() => toggleSetComplete(exercise.id, set.id)}
                                >
                                    <Ionicons
                                        name="checkmark"
                                        size={20}
                                        color={set.completed ? Colors.dark.background : Colors.dark.gray}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(exercise.id)}>
                            <Text style={styles.addSetText}>+ Add Set</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.dark.secondary,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.dark.text,
    },
    timer: {
        fontSize: 16,
        color: Colors.dark.primary,
        fontVariant: ['tabular-nums'],
    },
    finishButton: {
        backgroundColor: Colors.dark.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    finishButtonText: {
        color: Colors.dark.background,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    exerciseCard: {
        marginBottom: 24,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.dark.text,
    },
    tableHeader: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingHorizontal: 8,
    },
    col: {
        color: Colors.dark.gray,
        fontSize: 12,
        textAlign: 'center',
    },
    colSet: { width: 40 },
    colInput: { flex: 1 },
    colCheck: { width: 50 },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.dark.secondary,
        borderRadius: 8,
        marginBottom: 8,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    setRowCompleted: {
        backgroundColor: '#1E3A2F', // Dark green tint
    },
    input: {
        backgroundColor: '#252525',
        color: Colors.dark.text,
        borderRadius: 6,
        padding: 8,
        textAlign: 'center',
        marginHorizontal: 4,
        fontSize: 16,
    },
    checkButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#252525',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    checkButtonActive: {
        backgroundColor: Colors.dark.primary,
    },
    addSetButton: {
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#252525',
        borderRadius: 8,
        marginTop: 4,
    },
    addSetText: {
        color: Colors.dark.primary,
        fontWeight: '600',
    },
});
