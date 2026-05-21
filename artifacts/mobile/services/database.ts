import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  BodyStat,
  PersonalRecord,
  UserProfile,
  WorkoutPlan,
  WorkoutSession,
} from "@/types";

const KEYS = {
  USER_PROFILE: "@ironlog:user_profile",
  ONBOARDING_DONE: "@ironlog:onboarding_complete",
  SESSIONS: "@ironlog:sessions",
  PLANS: "@ironlog:plans",
  BODY_STATS: "@ironlog:body_stats",
  PERSONAL_RECORDS: "@ironlog:personal_records",
};

// ---------- Helpers ----------

async function getJSON<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ---------- User ----------

export async function getUserProfile(): Promise<UserProfile | null> {
  return getJSON<UserProfile>(KEYS.USER_PROFILE);
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setJSON(KEYS.USER_PROFILE, profile);
}

export async function isOnboardingComplete(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
  return val === "true";
}

export async function markOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, "true");
}

// ---------- Sessions ----------

export async function getSessions(): Promise<WorkoutSession[]> {
  return (await getJSON<WorkoutSession[]>(KEYS.SESSIONS)) ?? [];
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  const sessions = await getSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  await setJSON(KEYS.SESSIONS, sessions);
}

export async function deleteSession(sessionId: string): Promise<void> {
  const sessions = await getSessions();
  await setJSON(
    KEYS.SESSIONS,
    sessions.filter((s) => s.id !== sessionId)
  );
}

export async function getRecentSessions(count = 8): Promise<WorkoutSession[]> {
  const sessions = await getSessions();
  return sessions.slice(0, count);
}

// ---------- Plans ----------

export async function getPlans(): Promise<WorkoutPlan[]> {
  return (await getJSON<WorkoutPlan[]>(KEYS.PLANS)) ?? [];
}

export async function savePlan(plan: WorkoutPlan): Promise<void> {
  const plans = await getPlans();
  const idx = plans.findIndex((p) => p.id === plan.id);
  if (idx >= 0) {
    plans[idx] = plan;
  } else {
    plans.unshift(plan);
  }
  await setJSON(KEYS.PLANS, plans);
}

export async function deletePlan(planId: string): Promise<void> {
  const plans = await getPlans();
  await setJSON(
    KEYS.PLANS,
    plans.filter((p) => p.id !== planId)
  );
}

// ---------- Body Stats ----------

export async function getBodyStats(): Promise<BodyStat[]> {
  return (await getJSON<BodyStat[]>(KEYS.BODY_STATS)) ?? [];
}

export async function saveBodyStat(stat: BodyStat): Promise<void> {
  const stats = await getBodyStats();
  stats.push(stat);
  stats.sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );
  await setJSON(KEYS.BODY_STATS, stats);
}

// ---------- Personal Records ----------

export async function getPersonalRecords(): Promise<PersonalRecord[]> {
  return (await getJSON<PersonalRecord[]>(KEYS.PERSONAL_RECORDS)) ?? [];
}

export async function updatePersonalRecords(
  session: WorkoutSession
): Promise<void> {
  const records = await getPersonalRecords();

  for (const exercise of session.exercises) {
    for (const set of exercise.sets) {
      if (set.reps > 0 && set.weight_kg > 0) {
        const existing = records.find(
          (r) => r.exerciseId === exercise.exerciseId
        );
        if (!existing || set.weight_kg > existing.weight_kg) {
          const idx = records.findIndex(
            (r) => r.exerciseId === exercise.exerciseId
          );
          const pr: PersonalRecord = {
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            weight_kg: set.weight_kg,
            reps: set.reps,
            achievedAt: session.endedAt,
          };
          if (idx >= 0) {
            records[idx] = pr;
          } else {
            records.push(pr);
          }
        }
      }
    }
  }

  await setJSON(KEYS.PERSONAL_RECORDS, records);
}

// ---------- Analytics ----------

export async function getWeeklyStats(): Promise<{
  thisWeek: { sessions: number; volume: number };
  lastWeek: { sessions: number; volume: number };
}> {
  const sessions = await getSessions();
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const thisWeekSessions = sessions.filter((s) => {
    const d = new Date(s.startedAt);
    return d >= startOfWeek;
  });
  const lastWeekSessions = sessions.filter((s) => {
    const d = new Date(s.startedAt);
    return d >= startOfLastWeek && d < startOfWeek;
  });

  return {
    thisWeek: {
      sessions: thisWeekSessions.length,
      volume: thisWeekSessions.reduce((sum, s) => sum + s.totalVolume, 0),
    },
    lastWeek: {
      sessions: lastWeekSessions.length,
      volume: lastWeekSessions.reduce((sum, s) => sum + s.totalVolume, 0),
    },
  };
}

export async function getCurrentStreak(): Promise<number> {
  const sessions = await getSessions();
  if (sessions.length === 0) return 0;

  const dates = [
    ...new Set(
      sessions.map((s) => new Date(s.startedAt).toLocaleDateString())
    ),
  ];

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toLocaleDateString();
    if (dates.includes(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}

export async function getPreviousBest(
  exerciseId: string
): Promise<{ weight_kg: number; reps: number } | null> {
  const sessions = await getSessions();
  let best: { weight_kg: number; reps: number } | null = null;

  for (const session of sessions) {
    for (const ex of session.exercises) {
      if (ex.exerciseId === exerciseId) {
        for (const set of ex.sets) {
          if (!best || set.weight_kg > best.weight_kg) {
            best = { weight_kg: set.weight_kg, reps: set.reps };
          }
        }
      }
    }
  }

  return best;
}

export function calcOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * reps * 0.0333 + weight);
}

export function calcPlates(targetWeight: number): string {
  const barWeight = 20;
  const available = [25, 20, 15, 10, 5, 2.5, 1.25];
  let remaining = (targetWeight - barWeight) / 2;
  if (remaining <= 0) return "Bar only";
  const plates: string[] = [];
  for (const p of available) {
    while (remaining >= p) {
      plates.push(`${p}kg`);
      remaining -= p;
      remaining = Math.round(remaining * 100) / 100;
    }
  }
  return plates.length > 0 ? `Each side: ${plates.join(" + ")}` : "Bar only";
}
