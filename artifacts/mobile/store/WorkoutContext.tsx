import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ActiveExercise, ActiveSet } from "@/types";

interface ActiveSession {
  id: string;
  name: string;
  startTime: Date;
  exercises: ActiveExercise[];
}

interface RestTimerState {
  isRunning: boolean;
  seconds: number;
  maxSeconds: number;
  exerciseIndex: number;
}

interface WorkoutContextValue {
  activeSession: ActiveSession | null;
  elapsedSeconds: number;
  restTimer: RestTimerState;
  startWorkout: (name: string, exercises: ActiveExercise[]) => void;
  addExercise: (exercise: ActiveExercise) => void;
  removeExercise: (index: number) => void;
  updateSet: (
    exerciseIndex: number,
    setIndex: number,
    weight: string,
    reps: string
  ) => void;
  completeSet: (exerciseIndex: number, setIndex: number) => void;
  addSet: (exerciseIndex: number) => void;
  updateNotes: (exerciseIndex: number, notes: string) => void;
  startRestTimer: (exerciseIndex: number, duration?: number) => void;
  stopRestTimer: () => void;
  cancelWorkout: () => void;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    isRunning: false,
    seconds: 0,
    maxSeconds: 90,
    exerciseIndex: -1,
  });

  const workoutIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (activeSession) {
      workoutIntervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (workoutIntervalRef.current) clearInterval(workoutIntervalRef.current);
      setElapsedSeconds(0);
    }
    return () => {
      if (workoutIntervalRef.current) clearInterval(workoutIntervalRef.current);
    };
  }, [activeSession]);

  useEffect(() => {
    if (restTimer.isRunning) {
      restIntervalRef.current = setInterval(() => {
        setRestTimer((prev) => {
          if (prev.seconds <= 1) {
            void Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
            return { ...prev, isRunning: false, seconds: 0 };
          }
          return { ...prev, seconds: prev.seconds - 1 };
        });
      }, 1000);
    } else {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    }
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [restTimer.isRunning]);

  const startWorkout = useCallback(
    (name: string, exercises: ActiveExercise[]) => {
      setActiveSession({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name,
        startTime: new Date(),
        exercises,
      });
    },
    []
  );

  const addExercise = useCallback((exercise: ActiveExercise) => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      return { ...prev, exercises: [...prev.exercises, exercise] };
    });
  }, []);

  const removeExercise = useCallback((index: number) => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      const exercises = [...prev.exercises];
      exercises.splice(index, 1);
      return { ...prev, exercises };
    });
  }, []);

  const updateSet = useCallback(
    (exerciseIndex: number, setIndex: number, weight: string, reps: string) => {
      setActiveSession((prev) => {
        if (!prev) return prev;
        const exercises = prev.exercises.map((ex, ei) => {
          if (ei !== exerciseIndex) return ex;
          const sets = ex.sets.map((s, si): ActiveSet => {
            if (si !== setIndex) return s;
            return { ...s, weight, reps };
          });
          return { ...ex, sets };
        });
        return { ...prev, exercises };
      });
    },
    []
  );

  const completeSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setActiveSession((prev) => {
        if (!prev) return prev;
        const exercises = prev.exercises.map((ex, ei) => {
          if (ei !== exerciseIndex) return ex;
          const sets = ex.sets.map((s, si): ActiveSet => {
            if (si !== setIndex) return s;
            return { ...s, completed: !s.completed };
          });
          return { ...ex, sets };
        });
        return { ...prev, exercises };
      });
    },
    []
  );

  const addSet = useCallback((exerciseIndex: number) => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) => {
        if (ei !== exerciseIndex) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: ActiveSet = {
          weight: lastSet?.weight ?? "",
          reps: lastSet?.reps ?? "",
          completed: false,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      });
      return { ...prev, exercises };
    });
  }, []);

  const updateNotes = useCallback((exerciseIndex: number, notes: string) => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) =>
        ei === exerciseIndex ? { ...ex, notes } : ex
      );
      return { ...prev, exercises };
    });
  }, []);

  const startRestTimer = useCallback((exerciseIndex: number, duration = 90) => {
    setRestTimer({
      isRunning: true,
      seconds: duration,
      maxSeconds: duration,
      exerciseIndex,
    });
  }, []);

  const stopRestTimer = useCallback(() => {
    setRestTimer((prev) => ({ ...prev, isRunning: false, seconds: 0 }));
  }, []);

  const cancelWorkout = useCallback(() => {
    setActiveSession(null);
    setRestTimer({ isRunning: false, seconds: 0, maxSeconds: 90, exerciseIndex: -1 });
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        activeSession,
        elapsedSeconds,
        restTimer,
        startWorkout,
        addExercise,
        removeExercise,
        updateSet,
        completeSet,
        addSet,
        updateNotes,
        startRestTimer,
        stopRestTimer,
        cancelWorkout,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout(): WorkoutContextValue {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be inside WorkoutProvider");
  return ctx;
}
