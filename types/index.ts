export interface Set {
    id: string;
    reps: number;
    weight: number;
    completed: boolean;
}

export interface Exercise {
    id: string;
    name: string;
    sets: Set[];
    restTimeSeconds: number;
    notes?: string;
    feeling?: number; // 1-10
}

export interface Workout {
    id: string;
    name: string; // e.g., "Leg Day"
    date: string; // ISO string
    exercises: Exercise[];
    durationSeconds: number;
    feeling?: number; // 1-10
    notes?: string;
    status: 'active' | 'completed' | 'template';
}

export interface User {
    id: string;
    name: string;
    email: string;
}
