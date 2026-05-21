import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useUser } from "@/store/UserContext";
import type { WorkoutSession } from "@/types";

export default function LogScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessions } = useUser();
  const [selected, setSelected] = useState<WorkoutSession | null>(null);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0) + 20;
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 84) + 20;

  const calendarDates = useMemo(() => {
    const s = new Set(
      sessions.map((s) => new Date(s.startedAt).toDateString())
    );
    return s;
  }, [sessions]);

  const calendarDays = useMemo(() => {
    const today = new Date();
    const days: Date[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d);
    }
    return days;
  }, []);

  if (selected) {
    return (
      <SessionDetail
        session={selected}
        onBack={() => setSelected(null)}
        topPad={topPad}
        botPad={botPad}
        colors={colors}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Calendar strip */}
      <View style={[styles.calendarWrapper, { paddingTop: topPad }]}>
        <FlatList
          horizontal
          data={calendarDays}
          keyExtractor={(d) => d.toISOString()}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={Math.max(0, calendarDays.length - 8)}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}
          getItemLayout={(_, index) => ({
            length: 46,
            offset: 46 * index + 16 + index * 6,
            index,
          })}
          renderItem={({ item: d }) => {
            const hasWorkout = calendarDates.has(d.toDateString());
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <View
                style={[
                  styles.calDay,
                  {
                    backgroundColor: isToday ? colors.primary + "22" : colors.card,
                    borderColor: isToday ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.calDayName,
                    { color: isToday ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1)}
                </Text>
                <Text
                  style={[
                    styles.calDayNum,
                    { color: isToday ? colors.primary : colors.foreground },
                  ]}
                >
                  {d.getDate()}
                </Text>
                <View
                  style={[
                    styles.calDot,
                    {
                      backgroundColor: hasWorkout
                        ? colors.primary
                        : "transparent",
                    },
                  ]}
                />
              </View>
            );
          }}
        />
      </View>

      {/* Session List */}
      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="calendar" size={40} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No workouts yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Complete your first workout to see it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: botPad,
            gap: 10,
          }}
          renderItem={({ item: s }) => (
            <TouchableOpacity
              onPress={() => setSelected(s)}
              activeOpacity={0.8}
              style={[
                styles.sessionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={styles.sessionCardRow}>
                <View style={styles.sessionInfo}>
                  <Text
                    style={[styles.sessionName, { color: colors.foreground }]}
                  >
                    {s.name}
                  </Text>
                  <Text
                    style={[
                      styles.sessionDate,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {new Date(s.startedAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <View style={styles.sessionStats}>
                  <Text
                    style={[styles.sessionStat, { color: colors.foreground }]}
                  >
                    {s.duration}m
                  </Text>
                  <Text
                    style={[
                      styles.sessionStatLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {s.exercises.length} exercises
                  </Text>
                </View>
                <View style={styles.sessionStats}>
                  <Text
                    style={[
                      styles.sessionStat,
                      { color: colors.primary },
                    ]}
                  >
                    {s.totalVolume >= 1000
                      ? `${(s.totalVolume / 1000).toFixed(1)}t`
                      : `${s.totalVolume}kg`}
                  </Text>
                  <Text
                    style={[
                      styles.sessionStatLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    volume
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

function SessionDetail({
  session,
  onBack,
  topPad,
  botPad,
  colors,
}: {
  session: WorkoutSession;
  onBack: () => void;
  topPad: number;
  botPad: number;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: topPad,
        paddingBottom: botPad,
        paddingHorizontal: 16,
        gap: 12,
      }}
      ListHeaderComponent={
        <View>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.detailTitle, { color: colors.foreground }]}>
            {session.name}
          </Text>
          <Text style={[styles.detailSub, { color: colors.mutedForeground }]}>
            {new Date(session.startedAt).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            {" · "}
            {session.duration} min · {session.totalVolume}kg total
          </Text>
        </View>
      }
      data={session.exercises}
      keyExtractor={(e) => e.exerciseId}
      renderItem={({ item: ex }) => (
        <View
          style={[
            styles.exCard,
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
          <Text style={[styles.exMuscle, { color: colors.primary }]}>
            {ex.muscleGroup}
          </Text>
          <View style={styles.setsHeader}>
            <Text style={[styles.setHeaderText, { color: colors.mutedForeground }]}>
              SET
            </Text>
            <Text style={[styles.setHeaderText, { color: colors.mutedForeground }]}>
              WEIGHT
            </Text>
            <Text style={[styles.setHeaderText, { color: colors.mutedForeground }]}>
              REPS
            </Text>
            <Text style={[styles.setHeaderText, { color: colors.mutedForeground }]}>
              1RM EST.
            </Text>
          </View>
          {ex.sets.map((set) => {
            const orm = Math.round(
              set.weight_kg * set.reps * 0.0333 + set.weight_kg
            );
            return (
              <View key={set.setNumber} style={styles.setDetailRow}>
                <Text
                  style={[styles.setDetailText, { color: colors.mutedForeground }]}
                >
                  {set.setNumber}
                </Text>
                <Text style={[styles.setDetailText, { color: colors.foreground }]}>
                  {set.weight_kg}kg
                </Text>
                <Text style={[styles.setDetailText, { color: colors.foreground }]}>
                  {set.reps}
                </Text>
                <Text style={[styles.setDetailText, { color: colors.accent ?? "#FF6600" }]}>
                  {orm}kg
                </Text>
              </View>
            );
          })}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  calendarWrapper: { paddingBottom: 12 },
  calDay: {
    width: 40,
    height: 64,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 6,
  },
  calDayName: { fontSize: 10, fontWeight: "600" },
  calDayNum: { fontSize: 15, fontWeight: "700" },
  calDot: { width: 5, height: 5, borderRadius: 2.5 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  sessionCard: { padding: 16, borderWidth: 1 },
  sessionCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sessionInfo: { flex: 1 },
  sessionName: { fontSize: 16, fontWeight: "700", marginBottom: 3 },
  sessionDate: { fontSize: 12 },
  sessionStats: { alignItems: "flex-end" },
  sessionStat: { fontSize: 18, fontWeight: "800" },
  sessionStatLabel: { fontSize: 10, marginTop: 2 },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    marginLeft: -8,
  },
  detailTitle: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  detailSub: { fontSize: 14, marginBottom: 16 },
  exCard: { padding: 14, borderWidth: 1 },
  exName: { fontSize: 16, fontWeight: "700" },
  exMuscle: { fontSize: 12, fontWeight: "600", marginTop: 2, marginBottom: 10 },
  setsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  setHeaderText: { fontSize: 10, fontWeight: "700", letterSpacing: 1, flex: 1, textAlign: "center" },
  setDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  setDetailText: { fontSize: 14, fontWeight: "600", flex: 1, textAlign: "center" },
});
