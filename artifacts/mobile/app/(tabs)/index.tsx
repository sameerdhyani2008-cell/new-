import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EXERCISES } from "@/constants/exercises";
import { useColors } from "@/hooks/useColors";
import { getPlans } from "@/services/database";
import { useUser } from "@/store/UserContext";
import { useWorkout } from "@/store/WorkoutContext";
import type { ActiveExercise, PlannedWorkout, WorkoutPlan } from "@/types";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, streak, weeklyStats, sessions } = useUser();
  const { startWorkout, activeSession } = useWorkout();
  const [savedPlans, setSavedPlans] = useState<WorkoutPlan[]>([]);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  useEffect(() => {
    getPlans().then(setSavedPlans);
  }, []);

  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, []);

  const volumeChange = useMemo(() => {
    const { thisWeek, lastWeek } = weeklyStats;
    if (lastWeek.volume === 0) return null;
    return Math.round(
      ((thisWeek.volume - lastWeek.volume) / lastWeek.volume) * 100
    );
  }, [weeklyStats]);

  const handleStartPlanWorkout = (plan: WorkoutPlan, workout: PlannedWorkout) => {
    const exList: ActiveExercise[] = workout.exercises.map((pe) => {
      const found = EXERCISES.find(
        (e) => e.name.toLowerCase() === pe.name.toLowerCase()
      );
      return {
        exerciseId: found?.id ?? pe.name.toLowerCase().replace(/\s+/g, "_"),
        exerciseName: pe.name,
        muscleGroup: found?.muscleGroup ?? "Other",
        notes: pe.notes ?? "",
        sets: Array.from({ length: pe.sets }, () => ({
          weight: "",
          reps: "",
          completed: false,
        })),
      };
    });
    startWorkout(workout.name, exList);
    router.push("/workout/active");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad + 20,
        paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 84) + 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {todayStr}
          </Text>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {profile ? `Hey, ${profile.name.split(" ")[0]}` : "Welcome back"}
          </Text>
        </View>
        <View
          style={[
            styles.streakBadge,
            { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" },
          ]}
        >
          <Text style={[styles.streakFire, { color: colors.primary }]}>
            {streak > 0 ? "🔥" : "—"}
          </Text>
          <Text style={[styles.streakCount, { color: colors.primary }]}>
            {streak}
          </Text>
        </View>
      </View>

      {/* Active session banner */}
      {activeSession && (
        <TouchableOpacity
          onPress={() => router.push("/workout/active")}
          activeOpacity={0.85}
          style={{ marginHorizontal: 20, marginBottom: 16 }}
        >
          <LinearGradient
            colors={[colors.primary, "#FF6600"]}
            style={[styles.activeBanner, { borderRadius: colors.radius }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View>
              <Text style={styles.activeBannerLabel}>ACTIVE WORKOUT</Text>
              <Text style={styles.activeBannerName}>{activeSession.name}</Text>
            </View>
            <Feather name="arrow-right" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Weekly Stats */}
      <View style={styles.statsRow}>
        <StatCard
          label="Sessions"
          value={weeklyStats.thisWeek.sessions.toString()}
          sub="this week"
          colors={colors}
        />
        <StatCard
          label="Volume"
          value={
            weeklyStats.thisWeek.volume >= 1000
              ? `${(weeklyStats.thisWeek.volume / 1000).toFixed(1)}t`
              : `${weeklyStats.thisWeek.volume}kg`
          }
          sub={
            volumeChange !== null
              ? `${volumeChange > 0 ? "+" : ""}${volumeChange}% vs last week`
              : "total lifted"
          }
          accent={volumeChange !== null ? (volumeChange >= 0 ? "#44FF88" : "#FF4444") : undefined}
          colors={colors}
        />
        <StatCard
          label="Streak"
          value={`${streak}`}
          sub="days in a row"
          colors={colors}
        />
      </View>

      {/* My Plans */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        My Plans
      </Text>

      {savedPlans.length === 0 ? (
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/ai-coach")}
          style={[
            styles.emptyPlansCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          activeOpacity={0.7}
        >
          <Feather name="plus-circle" size={24} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.emptyPlansTitle, { color: colors.foreground }]}>
              No plans yet
            </Text>
            <Text style={[styles.emptyPlansSub, { color: colors.mutedForeground }]}>
              Tap to create one with AI Coach
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      ) : (
        savedPlans.map((plan) => (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.planName, { color: colors.foreground }]}>
              {plan.name}
            </Text>
            <Text style={[styles.planMeta, { color: colors.mutedForeground }]}>
              {plan.workouts.length} days · {plan.createdByAI ? "AI generated" : "Custom"}
            </Text>
            {plan.workouts.map((workout, wi) => (
              <TouchableOpacity
                key={wi}
                onPress={() => handleStartPlanWorkout(plan, workout)}
                style={[styles.dayBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayBtnText, { color: "#fff" }]}>
                  {workout.name}
                </Text>
                <Feather name="play" size={14} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        ))
      )}

      {/* Custom workout */}
      <TouchableOpacity
        onPress={() => {
          startWorkout("Custom Workout", []);
          router.push("/workout/active");
        }}
        activeOpacity={0.8}
        style={[
          styles.customBtn,
          {
            marginHorizontal: 20,
            marginTop: 12,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <Feather name="plus" size={18} color={colors.foreground} />
        <Text style={[styles.customBtnText, { color: colors.foreground }]}>
          Start Empty Workout
        </Text>
      </TouchableOpacity>

      {/* Recent */}
      {sessions.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>
            Recent
          </Text>
          {sessions.slice(0, 3).map((s) => (
            <View
              key={s.id}
              style={[
                styles.recentCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                  marginHorizontal: 20,
                  marginBottom: 8,
                },
              ]}
            >
              <View>
                <Text style={[styles.recentName, { color: colors.foreground }]}>
                  {s.name}
                </Text>
                <Text style={[styles.recentSub, { color: colors.mutedForeground }]}>
                  {new Date(s.startedAt).toLocaleDateString()} · {s.duration}min · {s.totalVolume}kg
                </Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
  colors,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
      ]}
    >
      <Text style={[styles.statValue, { color: accent ?? colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.foreground }]}>{label}</Text>
      <Text style={[styles.statSub, { color: colors.mutedForeground }]}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: { fontSize: 13, fontWeight: "500", marginBottom: 4 },
  name: { fontSize: 26, fontWeight: "800" },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  streakFire: { fontSize: 16 },
  streakCount: { fontSize: 18, fontWeight: "800" },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  statCard: { flex: 1, padding: 14, borderWidth: 1 },
  statValue: { fontSize: 22, fontWeight: "800", marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: "600" },
  statSub: { fontSize: 10, marginTop: 2 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  emptyPlansCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginHorizontal: 20,
  },
  emptyPlansTitle: { fontSize: 15, fontWeight: "700" },
  emptyPlansSub: { fontSize: 13, marginTop: 2 },
  planCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  planName: { fontSize: 16, fontWeight: "800" },
  planMeta: { fontSize: 12, marginTop: -4 },
  dayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  dayBtnText: { fontSize: 14, fontWeight: "700", flex: 1 },
  customBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
  },
  customBtnText: { fontSize: 15, fontWeight: "600" },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  activeBannerLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  activeBannerName: { fontSize: 18, fontWeight: "800", color: "#fff" },
  recentCard: { padding: 14, borderWidth: 1 },
  recentName: { fontSize: 15, fontWeight: "700", marginBottom: 3 },
  recentSub: { fontSize: 12 },
});
