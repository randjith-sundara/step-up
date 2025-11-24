import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout } from '@/types';

const WORKOUTS_KEY = 'stepup_workouts';

export const StorageService = {
    async saveWorkout(workout: Workout): Promise<void> {
        try {
            const existingWorkoutsJson = await AsyncStorage.getItem(WORKOUTS_KEY);
            const workouts: Workout[] = existingWorkoutsJson ? JSON.parse(existingWorkoutsJson) : [];

            // Check if workout already exists and update it, otherwise add new
            const index = workouts.findIndex(w => w.id === workout.id);
            if (index >= 0) {
                workouts[index] = workout;
            } else {
                workouts.push(workout);
            }

            await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
        } catch (error) {
            console.error('Error saving workout:', error);
            throw error;
        }
    },

    async getWorkouts(): Promise<Workout[]> {
        try {
            const json = await AsyncStorage.getItem(WORKOUTS_KEY);
            return json ? JSON.parse(json) : [];
        } catch (error) {
            console.error('Error getting workouts:', error);
            return [];
        }
    },

    async getWorkoutById(id: string): Promise<Workout | undefined> {
        try {
            const workouts = await this.getWorkouts();
            return workouts.find(w => w.id === id);
        } catch (error) {
            console.error('Error getting workout by id:', error);
            return undefined;
        }
    },

    async deleteWorkout(id: string): Promise<void> {
        try {
            const workouts = await this.getWorkouts();
            const newWorkouts = workouts.filter(w => w.id !== id);
            await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(newWorkouts));
        } catch (error) {
            console.error('Error deleting workout:', error);
            throw error;
        }
    }
};
