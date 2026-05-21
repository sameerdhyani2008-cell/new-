export interface UserProfile {
  id: string;
  name: string;
  age: number;
  weight_kg: number;
  height_cm: number;
  goal: "Build Muscle" | "Lose Fat" | "Recomposition" | "Improve Strength" | "General Fitness";
  experienceLevel: "Beginner" | "Intermediate" | "Advanced";
  weightUnit: "kg" | "lbs";
  heightUnit: "cm" | "in";
  restDuration: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  instructions?: string;
}

export interface CompletedSet {
  setNumber: number;
  weight_kg: number;
  reps: number;
  restSeconds: number;
  completedAt: string;
}

export interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: CompletedSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  startedAt: string;
  endedAt: string;
  notes?: string;
  exercises: SessionExercise[];
  totalVolume: number;
  duration: number;
}

export interface BodyStat {
  id: string;
  weight_kg: number;
  bodyFatPercent?: number;
  recordedAt: string;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight_kg: number;
  reps: number;
  achievedAt: string;
}

export interface ActiveSet {
  weight: string;
  reps: string;
  completed: boolean;
}

export interface ActiveExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: ActiveSet[];
  notes: string;
  previousBest?: { weight_kg: number; reps: number } | null;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  createdByAI: boolean;
  createdAt: string;
  workouts: PlannedWorkout[];
}

export interface PlannedWorkout {
  day: string;
  name: string;
  exercises: PlannedExercise[];
}

export interface PlannedExercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
