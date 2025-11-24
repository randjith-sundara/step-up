import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import { Workout } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';

interface WorkoutCardProps {
    workout: Workout;
    onPress: () => void;
}

export default function WorkoutCard({ workout, onPress }: WorkoutCardProps) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <LinearGradient
                colors={[Colors.dark.secondary, '#252525']}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <Text style={styles.name}>{workout.name}</Text>
                    <Text style={styles.date}>{new Date(workout.date).toLocaleDateString()}</Text>
                </View>

                <View style={styles.details}>
                    <Text style={styles.detailText}>{workout.exercises.length} Exercises</Text>
                    <Text style={styles.detailText}>{Math.floor(workout.durationSeconds / 60)} min</Text>
                </View>

                {workout.status === 'active' && (
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeText}>In Progress</Text>
                    </View>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    gradient: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.dark.text,
    },
    date: {
        fontSize: 14,
        color: Colors.dark.gray,
    },
    details: {
        flexDirection: 'row',
        gap: 16,
    },
    detailText: {
        color: Colors.dark.gray,
        fontSize: 14,
    },
    activeBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: Colors.dark.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    activeText: {
        color: Colors.dark.background,
        fontSize: 12,
        fontWeight: 'bold',
    },
});
