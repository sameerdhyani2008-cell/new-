import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useUser } from "@/store/UserContext";
import type { WorkoutSession } from "@/types";

const { width } = Dimensions.get("window");
const CHART_W = width - 64;
const CHART_H = 160;
const PAD = { top: 10, bottom: 30, left: 36, right: 10 };

function LineChart({
  data,
  color,
}: {
  data: { label: string; value: number }[];
  color: string;
}) {
  const colors = useColors();
  if (data.length === 0) return null;

  const maxV = Math.max(...data.map((d) => d.value), 1);
  const minV = Math.min(...data.map((d) => d.value));
  const range = maxV - minV || 1;
  const w = CHART_W - PAD.left - PAD.right;
  const h = CHART_H - PAD.top - PAD.bottom;

  const pts = data.map((d, i) => ({
    x: PAD.left + (i / Math.max(data.length - 1, 1)) * w,
    y: PAD.top + h - ((d.value - minV) / range) * h,
    label: d.label,
    value: d.value,
  }));

  const pathD = pts.reduce(
    (acc, p, i) => acc + (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`),
    ""
  );

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {/* Grid lines */}
      {[0, 0.5, 1].map((f) => (
        <Line
          key={f}
          x1={PAD.left}
          x2={CHART_W - PAD.right}
          y1={PAD.top + (1 - f) * h}
          y2={PAD.top + (1 - f) * h}
          stroke={colors.border}
          strokeWidth={0.5}
        />
      ))}
      {/* Path */}
      <Path
        d={pathD}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Points */}
      {pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={4} fill={color} />
      ))}
      {/* X labels */}
      {pts
        .filter((_, i) => i % Math.max(1, Math.floor(pts.length / 4)) === 0)
        .map((p, i) => (
          <SvgText
            key={i}
            x={p.x}
            y={CHART_H - 4}
            textAnchor="middle"
            fontSize={9}
            fill={colors.mutedForeground}
          >
            {p.label}
          </SvgText>
        ))}
      {/* Y labels */}
      <SvgText
        x={PAD.left - 4}
        y={PAD.top + h}
        textAnchor="end"
        fontSize={9}
        fill={colors.mutedForeground}
      >
        {minV}
      </SvgText>
      <SvgText
        x={PAD.left - 4}
        y={PAD.top + 8}
        textAnchor="end"
        fontSize={9}
        fill={colors.mutedForeground}
      >
        {maxV}
      </SvgText>
    </Svg>
  );
}

function BarChart({
  data,
  color,
}: {
  data: { label: string; value: number }[];
  color: string;
}) {
  const colors = useColors();
  if (data.length === 0) return null;

  const maxV = Math.max(...data.map((d) => d.value), 1);
  const w = CHART_W - PAD.left - PAD.right;
  const h = CHART_H - PAD.top - PAD.bottom;
  const barW = Math.max(4, w / data.length - 4);

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {data.map((d, i) => {
        const barH = (d.value / maxV) * h;
        const x = PAD.left + (i / data.length) * w + (w / data.length - barW) / 2;
        const y = PAD.top + h - barH;
        return (
          <Rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={barH}
            rx={3}
            fill={color}
            opacity={0.85}
          />
        );
      })}
      {data
        .filter((_, i) => i % Math.max(1, Math.floor(data.length / 5)) === 0)
        .map((d, i) => {
          const x =
            PAD.left +
            (data.indexOf(d) / data.length) * w +
            w / data.length / 2;
          return (
            <SvgText
              key={i}
              x={x}
              y={CHART_H - 4}
              textAnchor="middle"
              fontSize={9}
              fill={colors.mutedForeground}
            >
              {d.label}
            </SvgText>
          );
        })}
    </Svg>
  );
}

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessions, personalRecords, bodyStats, profile } = useUser();
  const [bodyWeight, setBodyWeight] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0) + 20;
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 84) + 20;

  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach((s) => s.exercises.forEach((e) => names.add(e.exerciseName)));
    return Array.from(names).sort();
  }, [sessions]);

  const exerciseChartData = useMemo(() => {
    if (!selectedExercise) return [];
    return sessions
      .filter((s) => s.exercises.some((e) => e.exerciseName === selectedExercise))
      .slice(0, 12)
      .reverse()
      .map((s) => {
        const ex = s.exercises.find((e) => e.exerciseName === selectedExercise)!;
        const maxW = Math.max(...ex.sets.map((set) => set.weight_kg));
        return {
          label: new Date(s.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          value: maxW,
        };
      });
  }, [sessions, selectedExercise]);

  const weeklyVolumeData = useMemo(() => {
    const weeks: Record<string, number> = {};
    sessions.slice(0, 12).forEach((s) => {
      const d = new Date(s.startedAt);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      weeks[key] = (weeks[key] ?? 0) + s.totalVolume;
    });
    return Object.entries(weeks)
      .reverse()
      .map(([label, value]) => ({ label, value }));
  }, [sessions]);

  const bodyWeightData = useMemo(() => {
    return bodyStats.slice(-12).map((s) => ({
      label: new Date(s.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: s.weight_kg,
    }));
  }, [bodyStats]);

  const { addBodyStat } = useUser();
  const handleLogWeight = async () => {
    const w = parseFloat(bodyWeight);
    if (isNaN(w)) return;
    await addBodyStat({
      id: Date.now().toString(),
      weight_kg: w,
      recordedAt: new Date().toISOString(),
    });
    setBodyWeight("");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad,
        paddingBottom: botPad,
        paddingHorizontal: 16,
        gap: 20,
      }}
    >
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>
        Progress
      </Text>

      {/* PRs */}
      <Section title="Personal Records" colors={colors}>
        {personalRecords.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            Complete workouts to see your PRs
          </Text>
        ) : (
          personalRecords.slice(0, 5).map((pr) => (
            <View
              key={pr.exerciseId}
              style={[styles.prRow, { borderBottomColor: colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.prName, { color: colors.foreground }]}>
                  {pr.exerciseName}
                </Text>
                <Text style={[styles.prDate, { color: colors.mutedForeground }]}>
                  {new Date(pr.achievedAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.prWeight, { color: colors.primary }]}>
                {pr.weight_kg}kg
              </Text>
              <Text style={[styles.prReps, { color: colors.mutedForeground }]}>
                x{pr.reps}
              </Text>
            </View>
          ))
        )}
      </Section>

      {/* Exercise Progress */}
      <Section title="Exercise Progress" colors={colors}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
        >
          {exerciseNames.slice(0, 15).map((name) => (
            <TouchableOpacity
              key={name}
              onPress={() => setSelectedExercise(name === selectedExercise ? "" : name)}
              style={[
                styles.exChip,
                {
                  backgroundColor:
                    selectedExercise === name ? colors.primary : colors.muted,
                  borderColor: selectedExercise === name ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.exChipText,
                  {
                    color: selectedExercise === name ? "#fff" : colors.mutedForeground,
                  },
                ]}
              >
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {selectedExercise && exerciseChartData.length > 0 ? (
          <>
            <Text style={[styles.chartLabel, { color: colors.mutedForeground }]}>
              Max weight over time
            </Text>
            <LineChart data={exerciseChartData} color={colors.primary} />
          </>
        ) : (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            {exerciseNames.length > 0
              ? "Select an exercise above"
              : "Log workouts to see progress charts"}
          </Text>
        )}
      </Section>

      {/* Weekly Volume */}
      <Section title="Weekly Volume" colors={colors}>
        {weeklyVolumeData.length > 0 ? (
          <BarChart data={weeklyVolumeData} color={colors.primary} />
        ) : (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            Log workouts to see volume trends
          </Text>
        )}
      </Section>

      {/* Bodyweight */}
      <Section title="Bodyweight" colors={colors}>
        <View style={styles.bwInput}>
          <TextInput
            style={[
              styles.bwTextInput,
              {
                color: colors.foreground,
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            value={bodyWeight}
            onChangeText={setBodyWeight}
            placeholder={profile ? `${profile.weight_kg} kg` : "Weight in kg"}
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            onPress={handleLogWeight}
            style={[styles.logBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        {bodyWeightData.length > 0 ? (
          <LineChart data={bodyWeightData} color="#4488FF" />
        ) : (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            Log your bodyweight to track changes
          </Text>
        )}
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  section: { padding: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 14 },
  prRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  prName: { fontSize: 14, fontWeight: "600" },
  prDate: { fontSize: 11, marginTop: 2 },
  prWeight: { fontSize: 18, fontWeight: "800" },
  prReps: { fontSize: 13, fontWeight: "500", width: 32, textAlign: "right" },
  chartLabel: { fontSize: 12, marginBottom: 8 },
  exChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  exChipText: { fontSize: 12, fontWeight: "600" },
  empty: { fontSize: 14, textAlign: "center", paddingVertical: 20 },
  bwInput: { flexDirection: "row", gap: 10, marginBottom: 16 },
  bwTextInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  logBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
