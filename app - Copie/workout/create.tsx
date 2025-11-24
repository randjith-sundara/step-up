import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { Exercise, Set, Workout } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '@/services/storage';

export default function CreateWorkoutScreen() {
    const [name, setName] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);

    const handleAddExercise = () => {
        const newExercise: Exercise = {
            id: Date.now().toString(),
            name: '',
            sets: [
                { id: Date.now().toString() + '_1', reps: 10, weight: 0, completed: false }
            ],
            restTimeSeconds: 60,
        };
        setExercises([...exercises, newExercise]);
    };

    const handleRemoveExercise = (index: number) => {
        const newExercises = [...exercises];
        newExercises.splice(index, 1);
        setExercises(newExercises);
    };

    const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === exercises.length - 1) return;

        const newExercises = [...exercises];
        const temp = newExercises[index];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        newExercises[index] = newExercises[targetIndex];
        newExercises[targetIndex] = temp;
        setExercises(newExercises);
    };

    const updateExercise = (index: number, field: keyof Exercise, value: any) => {
        const newExercises = [...exercises];
        newExercises[index] = { ...newExercises[index], [field]: value };
        setExercises(newExercises);
    };

    const handleAddSet = (exerciseIndex: number) => {
        const newExercises = [...exercises];
        const exercise = newExercises[exerciseIndex];
        const lastSet = exercise.sets[exercise.sets.length - 1];

        const newSet: Set = {
            id: Date.now().toString(),
            reps: lastSet ? lastSet.reps : 10,
            weight: lastSet ? lastSet.weight : 0,
            completed: false
        };

        exercise.sets.push(newSet);
        setExercises(newExercises);
    };

    const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets.splice(setIndex, 1);
        setExercises(newExercises);
    };

    const updateSet = (exerciseIndex: number, setIndex: number, field: keyof Set, value: string) => {
        const newExercises = [...exercises];
        const numValue = Number(value);
        const set = newExercises[exerciseIndex].sets[setIndex];
        (set as any)[field] = numValue;
        setExercises(newExercises);
    };

    const handleStartWorkout = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a workout name');
            return;
        }
        if (exercises.length === 0) {
            Alert.alert('Error', 'Please add at least one exercise');
            return;
        }

        const invalidExercise = exercises.find(ex => !ex.name.trim());
        if (invalidExercise) {
            Alert.alert('Error', 'All exercises must have a name');
            return;
        }

        const newWorkout: Workout = {
            id: Date.now().toString(),
            name: name.trim(),
            exercises: exercises,
            durationSeconds: 0,
            completed: false,
            date: new Date().toISOString(),
            status: 'template'
        };

        try {
            await StorageService.saveWorkout(newWorkout);
            Alert.alert('Success', 'Workout saved to dashboard');
            router.push('/(tabs)');
        } catch (error) {
            Alert.alert('Error', 'Failed to save workout');
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Workout</Text>
                    <View style={{ width: 24 }} />
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.section}>
                        <Text style={styles.label}>Workout Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Chest Day"
                            placeholderTextColor={Colors.dark.gray}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.exercisesHeader}>
                        <Text style={styles.sectionTitle}>Exercises</Text>
                    </View>

                    {exercises.map((exercise, index) => (
                        <View key={exercise.id} style={styles.exerciseCard}>
                            <View style={styles.exerciseHeader}>
                                <View style={styles.exerciseTitleRow}>
                                    <TextInput
                                        style={styles.exerciseNameInput}
                                        placeholder="Exercise Name"
                                        placeholderTextColor={Colors.dark.gray}
                                        value={exercise.name}
                                        onChangeText={(v) => updateExercise(index, 'name', v)}
                                    />
                                </View>
                                <View style={styles.exerciseActions}>
                                    <TouchableOpacity
                                        onPress={() => handleMoveExercise(index, 'up')}
                                        disabled={index === 0}
                                        style={[styles.actionButton, index === 0 && styles.disabledAction]}
                                    >
                                        <Ionicons name="arrow-up" size={20} color={Colors.dark.text} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleMoveExercise(index, 'down')}
                                        disabled={index === exercises.length - 1}
                                        style={[styles.actionButton, index === exercises.length - 1 && styles.disabledAction]}
                                    >
                                        <Ionicons name="arrow-down" size={20} color={Colors.dark.text} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleRemoveExercise(index)}
                                        style={styles.deleteButton}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#FF453A" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.setsContainer}>
                                <View style={styles.setsHeader}>
                                    <Text style={[styles.colLabel, { flex: 1 }]}>kg</Text>
                                    <Text style={[styles.colLabel, { flex: 1 }]}>Reps</Text>
                                    <View style={{ width: 30 }} />
                                </View>

                                {exercise.sets.map((set, setIndex) => (
                                    <View key={set.id} style={styles.setRow}>
                                        <TextInput
                                            style={[styles.setInput, { flex: 1 }]}
                                            value={set.weight.toString()}
                                            onChangeText={(v) => updateSet(index, setIndex, 'weight', v)}
                                            keyboardType="numeric"
                                            selectTextOnFocus
                                        />
                                        <TextInput
                                            style={[styles.setInput, { flex: 1 }]}
                                            value={set.reps.toString()}
                                            onChangeText={(v) => updateSet(index, setIndex, 'reps', v)}
                                            keyboardType="numeric"
                                            selectTextOnFocus
                                        />
                                        <TouchableOpacity
                                            onPress={() => handleRemoveSet(index, setIndex)}
                                            style={styles.removeSetButton}
                                        >
                                            <Ionicons name="close-circle" size={20} color={Colors.dark.gray} />
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                <TouchableOpacity
                                    style={styles.addSetButton}
                                    onPress={() => handleAddSet(index)}
                                >
                                    <Text style={styles.addSetText}>+ Add Set</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addExerciseButton} onPress={handleAddExercise}>
                        <Text style={styles.addExerciseText}>+ Add Exercise</Text>
                    </TouchableOpacity>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.startButton, (!name || exercises.length === 0) && styles.disabledButton]}
                    onPress={handleStartWorkout}
                >
                    <Text style={styles.startButtonText}>Save Workout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    safeArea: {
        backgroundColor: Colors.dark.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.dark.text,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        color: Colors.dark.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.dark.secondary,
        borderRadius: 12,
        padding: 16,
        color: Colors.dark.text,
        fontSize: 16,
    },
    exercisesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.dark.text,
    },
    exerciseCard: {
        backgroundColor: Colors.dark.secondary,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    exerciseTitleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    exerciseNameInput: {
        flex: 1,
        color: Colors.dark.text,
        fontSize: 18,
        fontWeight: 'bold',
        padding: 0,
    },
    exerciseActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        padding: 4,
        backgroundColor: '#333',
        borderRadius: 8,
    },
    disabledAction: {
        opacity: 0.3,
    },
    deleteButton: {
        padding: 4,
        backgroundColor: '#3A2020',
        borderRadius: 8,
    },
    setsContainer: {
        backgroundColor: '#252525',
        borderRadius: 12,
        padding: 12,
    },
    setsHeader: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    colLabel: {
        color: Colors.dark.gray,
        fontSize: 12,
        textAlign: 'center',
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    setInput: {
        backgroundColor: '#1A1A1A',
        color: Colors.dark.text,
        borderRadius: 8,
        padding: 8,
        textAlign: 'center',
        fontSize: 16,
    },
    removeSetButton: {
        width: 30,
        alignItems: 'center',
    },
    addSetButton: {
        alignItems: 'center',
        paddingVertical: 8,
        marginTop: 4,
        backgroundColor: '#333',
        borderRadius: 8,
    },
    addSetText: {
        color: Colors.dark.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    addExerciseButton: {
        backgroundColor: Colors.dark.secondary,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.dark.primary,
        borderStyle: 'dashed',
    },
    addExerciseText: {
        color: Colors.dark.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: Colors.dark.background,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    startButton: {
        backgroundColor: Colors.dark.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    startButtonText: {
        color: Colors.dark.background,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
