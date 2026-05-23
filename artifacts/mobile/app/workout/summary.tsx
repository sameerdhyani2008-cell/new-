import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useUser } from "@/store/UserContext";

export default function SummaryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessions } = useUser();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  // Find by ID first (passed via params), fall back to most recent
  const lastSession = sessionId
    ? (sessions.find((s) => s.id === sessionId) ?? sessions[0])
    : sessions[0];

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0) + 20;
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40;

  if (!lastSession) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          style={{ padding: 20 }}
        >
          <Feather name="home" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>
    );
  }

  const totalSets = lastSession.exercises.reduce(
    (sum, e) => sum + e.sets.length,
    0
  );

  const maxSet = lastSession.exercises.reduce(
    (best, ex) => {
      for (const set of ex.sets) {
        if (set.weight_kg > (best?.weight ?? 0)) {
          return { exercise: ex.exerciseName, weight: set.weight_kg, reps: set.reps };
        }
      }
      return best;
    },
    null as { exercise: string; weight: number; reps: number } | null
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad,
        paddingBottom: botPad,
        paddingHorizontal: 20,
        gap: 20,
      }}
    >
      <View style={styles.heroSection}>
        <Text style={[styles.heroLabel, { color: colors.primary }]}>
          WORKOUT COMPLETE
        </Text>
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>
          {lastSession.name}
        </Text>
      </View>

      {/* Main stats */}
      <LinearGradient
        colors={[colors.primary, "#FF6600"]}
        style={[styles.statsCard, { borderRadius: colors.radius }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatItem label="Duration" value={`${lastSession.duration}m`} />
        <View style={styles.statDivider} />
        <StatItem
          label="Volume"
          value={
            lastSession.totalVolume >= 1000
              ? `${(lastSession.totalVolume / 1000).toFixed(1)}t`
              : `${lastSession.totalVolume}kg`
          }
        />
        <View style={styles.statDivider} />
        <StatItem
          label="Exercises"
          value={String(lastSession.exercises.length)}
        />
        <View style={styles.statDivider} />
        <StatItem label="Sets" value={String(totalSets)} />
      </LinearGradient>

      {/* Best lift */}
      {maxSet && (
        <View
          style={[
            styles.bestCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Text style={[styles.bestLabel, { color: colors.mutedForeground }]}>
            TOP LIFT
          </Text>
          <Text style={[styles.bestExercise, { color: colors.foreground }]}>
            {maxSet.exercise}
          </Text>
          <Text style={[styles.bestWeight, { color: colors.primary }]}>
            {maxSet.weight}kg × {maxSet.reps}
          </Text>
          <Text style={[styles.bestOrm, { color: colors.mutedForeground }]}>
            Est. 1RM:{" "}
            {Math.round(maxSet.weight * maxSet.reps * 0.0333 + maxSet.weight)}kg
          </Text>
        </View>
      )}

      {/* Exercises summary */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Exercises
      </Text>
      {lastSession.exercises.map((ex) => (
        <View
          key={ex.exerciseId}
          style={[
            styles.exSummaryCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Text style={[styles.exName, { color: colors.foreground }]}>
            {ex.exerciseName}
          </Text>
          <Text style={[styles.exSets, { color: colors.mutedForeground }]}>
            {ex.sets.map((s) => `${s.weight_kg}kg×${s.reps}`).join("  ")}
          </Text>
        </View>
      ))}

      <TouchableOpacity
        onPress={() => router.replace("/(tabs)")}
        style={[
          styles.doneBtn,
          { backgroundColor: colors.primary, borderRadius: colors.radius },
        ]}
        activeOpacity={0.85}
      >
        <Feather name="home" size={18} color="#fff" />
        <Text style={styles.doneBtnText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: { alignItems: "center", gap: 8 },
  heroLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 3 },
  heroTitle: { fontSize: 28, fontWeight: "900", textAlign: "center" },
  statsCard: { flexDirection: "row", padding: 20 },
  stat: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  statValue: { fontSize: 22, fontWeight: "900", color: "#fff", marginBottom: 4 },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: "600" },
  bestCard: { padding: 20, borderWidth: 1, alignItems: "center", gap: 4 },
  bestLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, marginBottom: 4 },
  bestExercise: { fontSize: 18, fontWeight: "700" },
  bestWeight: { fontSize: 32, fontWeight: "900" },
  bestOrm: { fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  exSummaryCard: { padding: 14, borderWidth: 1 },
  exName: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  exSets: { fontSize: 13, lineHeight: 20 },
  doneBtn: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },
  doneBtnText: { fontSize: 17, fontWeight: "700", color: "#fff" },
});
