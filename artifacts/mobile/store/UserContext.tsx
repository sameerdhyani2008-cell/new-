import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import * as db from "@/services/database";
import type { BodyStat, PersonalRecord, UserProfile, WorkoutSession } from "@/types";

interface UserContextValue {
  profile: UserProfile | null;
  sessions: WorkoutSession[];
  bodyStats: BodyStat[];
  personalRecords: PersonalRecord[];
  streak: number;
  weeklyStats: {
    thisWeek: { sessions: number; volume: number };
    lastWeek: { sessions: number; volume: number };
  };
  isLoading: boolean;
  onboardingComplete: boolean;
  saveProfile: (profile: UserProfile) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  addSession: (session: WorkoutSession) => Promise<void>;
  addBodyStat: (stat: BodyStat) => Promise<void>;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [bodyStats, setBodyStats] = useState<BodyStat[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState({
    thisWeek: { sessions: 0, volume: 0 },
    lastWeek: { sessions: 0, volume: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const load = useCallback(async () => {
    const [
      profileData,
      sessionsData,
      bodyStatsData,
      prData,
      streakData,
      weeklyData,
      onboarded,
    ] = await Promise.all([
      db.getUserProfile(),
      db.getSessions(),
      db.getBodyStats(),
      db.getPersonalRecords(),
      db.getCurrentStreak(),
      db.getWeeklyStats(),
      db.isOnboardingComplete(),
    ]);

    setProfile(profileData);
    setSessions(sessionsData);
    setBodyStats(bodyStatsData);
    setPersonalRecords(prData);
    setStreak(streakData);
    setWeeklyStats(weeklyData);
    setOnboardingComplete(onboarded);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfile = useCallback(async (p: UserProfile) => {
    await db.saveUserProfile(p);
    setProfile(p);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await db.markOnboardingComplete();
    setOnboardingComplete(true);
  }, []);

  const addSession = useCallback(async (session: WorkoutSession) => {
    await db.saveSession(session);
    await db.updatePersonalRecords(session);
    const [newSessions, newPRs, newStreak, newWeekly] = await Promise.all([
      db.getSessions(),
      db.getPersonalRecords(),
      db.getCurrentStreak(),
      db.getWeeklyStats(),
    ]);
    setSessions(newSessions);
    setPersonalRecords(newPRs);
    setStreak(newStreak);
    setWeeklyStats(newWeekly);
  }, []);

  const addBodyStat = useCallback(async (stat: BodyStat) => {
    await db.saveBodyStat(stat);
    const updated = await db.getBodyStats();
    setBodyStats(updated);
  }, []);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return (
    <UserContext.Provider
      value={{
        profile,
        sessions,
        bodyStats,
        personalRecords,
        streak,
        weeklyStats,
        isLoading,
        onboardingComplete,
        saveProfile,
        completeOnboarding,
        addSession,
        addBodyStat,
        refresh,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
}
