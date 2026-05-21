import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SetRow from "@/components/workout/SetRow";
import RestTimer from "@/components/workout/RestTimer";
import { EXERCISES, MUSCLE_GROUP_COLORS } from "@/constants/exercises";
import { useColors } from "@/hooks/useColors";
import { calcPlates } from "@/services/database";
import { useUser } from "@/store/UserContext";
import { useWorkout } from "@/store/WorkoutContext";
import type { ActiveExercise, WorkoutSession } from "@/types";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ActiveWorkoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    activeSession,
    elapsedSeconds,
    addExercise,
    updateSet,
    completeSet,
    addSet,
    updateNotes,
    startRestTimer,
    cancelWorkout,
  } = useWorkout();
  const { addSession, profile } = useUser();

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseFilter, setExerciseFilter] = useState("");
  const [plateInfo, setPlateInfo] = useState<{
    exerciseIndex: number;
    weight: string;
  } | null>(null);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const handleFinish = async () => {
    if (!activeSession) return;

    const completedSets = activeSession.exercises.flatMap((e) =>
      e.sets.filter((s) => s.completed)
    ).length;

    if (completedSets === 0) {
      Alert.alert("No completed sets", "Complete at least one set before finishing.", [
        { text: "OK" },
      ]);
      return;
    }

    Alert.alert("Finish Workout?", `You completed ${completedSets} sets.`, [
      { text: "Keep going", style: "cancel" },
      {
        text: "Finish",
        style: "default",
        onPress: async () => {
          await finishWorkout();
        },
      },
    ]);
  };

  const finishWorkout = async () => {
    if (!activeSession) return;
    const endTime = new Date();
    const duration = Math.round(elapsedSeconds / 60);

    const exercises = activeSession.exercises.map((ex, i) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      muscleGroup: ex.muscleGroup,
      notes: ex.notes,
      sets: ex.sets
        .filter((s) => s.completed)
        .map((s, si) => ({
          setNumber: si + 1,
          weight_kg: parseFloat(s.weight) || 0,
          reps: parseInt(s.reps, 10) || 0,
          restSeconds: profile?.restDuration ?? 90,
          completedAt: new Date().toISOString(),
        })),
    }));

    const totalVolume = exercises.reduce(
      (sum, ex) =>
        sum + ex.sets.reduce((s2, set) => s2 + set.weight_kg * set.reps, 0),
      0
    );

    const session: WorkoutSession = {
      id: activeSession.id,
      name: activeSession.name,
      startedAt: activeSession.startTime.toISOString(),
      endedAt: endTime.toISOString(),
      exercises,
      totalVolume: Math.round(totalVolume),
      duration,
    };

    await addSession(session);
    cancelWorkout();
    router.replace("/workout/summary");
  };

  const filteredExercises = useMemo(() => {
    const q = exerciseFilter.toLowerCase();
    return EXERCISES.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.muscleGroup.toLowerCase().includes(q)
    );
  }, [exerciseFilter]);

  const handleAddExercise = useCallback(
    (exId: string) => {
      const ex = EXERCISES.find((e) => e.id === exId);
      if (!ex) return;
      const activeEx: ActiveExercise = {
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroup: ex.muscleGroup,
        notes: "",
        sets: [
          { weight: "", reps: "", completed: false },
          { weight: "", reps: "", completed: false },
          { weight: "", reps: "", completed: false },
        ],
      };
      addExercise(activeEx);
      setShowExercisePicker(false);
      setExerciseFilter("");
    },
    [addExercise]
  );

  if (!activeSession) {
    router.replace("/(tabs)");
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Cancel Workout?", "Progress will be lost.", [
                { text: "Keep going", style: "cancel" },
                {
                  text: "Cancel",
                  style: "destructive",
                  onPress: () => {
                    cancelWorkout();
                    router.back();
                  },
                },
              ])
            }
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Feather name="x" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.workoutName, { color: colors.foreground }]}>
              {activeSession.name}
            </Text>
            <Text style={[styles.timerText, { color: colors.primary }]}>
              {formatTime(elapsedSeconds)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleFinish}
          style={[styles.finishBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Text style={styles.finishBtnText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Exercise List */}
      <FlatList
        data={activeSession.exercises}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <TouchableOpacity
            onPress={() => setShowExercisePicker(true)}
            style={[
              styles.addExerciseBtn,
              { borderColor: colors.border, borderRadius: colors.radius },
            ]}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color={colors.foreground} />
            <Text
              style={[styles.addExerciseBtnText, { color: colors.foreground }]}
            >
              Add Exercise
            </Text>
          </TouchableOpacity>
        }
        renderItem={({ item: ex, index: exIdx }) => (
          <ExerciseBlock
            exercise={ex}
            exIdx={exIdx}
            colors={colors}
            restDuration={profile?.restDuration ?? 90}
            onUpdateSet={updateSet}
            onCompleteSet={(exI, setI) => {
              completeSet(exI, setI);
              startRestTimer(exI, profile?.restDuration ?? 90);
            }}
            onAddSet={addSet}
            onUpdateNotes={updateNotes}
            onShowPlates={(exI, weight) =>
              setPlateInfo({ exerciseIndex: exI, weight })
            }
          />
        )}
      />

      <RestTimer />

      {/* Plate Calculator Modal */}
      {plateInfo !== null && (
        <Modal transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setPlateInfo(null)}
            activeOpacity={1}
          >
            <View
              style={[
                styles.plateModal,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[styles.plateModalTitle, { color: colors.foreground }]}
              >
                Plate Calculator
              </Text>
              <Text
                style={[styles.plateModalWeight, { color: colors.primary }]}
              >
                {plateInfo.weight}kg
              </Text>
              <Text
                style={[
                  styles.plateModalCalc,
                  { color: colors.mutedForeground },
                ]}
              >
                {calcPlates(parseFloat(plateInfo.weight) || 0)}
              </Text>
              <TouchableOpacity
                onPress={() => setPlateInfo(null)}
                style={[
                  styles.plateCloseBtn,
                  { backgroundColor: colors.primary },
                ]}
                activeOpacity={0.8}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Exercise Picker Modal */}
      <Modal
        visible={showExercisePicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.pickerContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[
              styles.pickerHeader,
              { borderBottomColor: colors.border },
            ]}
          >
            <Text
              style={[styles.pickerTitle, { color: colors.foreground }]}
            >
              Add Exercise
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowExercisePicker(false);
                setExerciseFilter("");
              }}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              value={exerciseFilter}
              onChangeText={setExerciseFilter}
              placeholder="Search exercises..."
              placeholderTextColor={colors.mutedForeground}
              autoFocus
            />
          </View>
          <FlatList
            data={filteredExercises}
            keyExtractor={(e) => e.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
            renderItem={({ item: ex }) => (
              <TouchableOpacity
                onPress={() => handleAddExercise(ex.id)}
                activeOpacity={0.7}
                style={[
                  styles.exPickerItem,
                  { borderBottomColor: colors.border },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.exPickerName, { color: colors.foreground }]}
                  >
                    {ex.name}
                  </Text>
                  <Text
                    style={[
                      styles.exPickerSub,
                      {
                        color:
                          MUSCLE_GROUP_COLORS[ex.muscleGroup] ??
                          colors.mutedForeground,
                      },
                    ]}
                  >
                    {ex.muscleGroup} · {ex.equipment}
                  </Text>
                </View>
                <Feather name="plus" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

interface ExerciseBlockProps {
  exercise: ActiveExercise;
  exIdx: number;
  colors: ReturnType<typeof useColors>;
  restDuration: number;
  onUpdateSet: (exI: number, setI: number, w: string, r: string) => void;
  onCompleteSet: (exI: number, setI: number) => void;
  onAddSet: (exI: number) => void;
  onUpdateNotes: (exI: number, notes: string) => void;
  onShowPlates: (exI: number, weight: string) => void;
}

function ExerciseBlock({
  exercise,
  exIdx,
  colors,
  onUpdateSet,
  onCompleteSet,
  onAddSet,
  onUpdateNotes,
  onShowPlates,
}: ExerciseBlockProps) {
  const muscleColor =
    MUSCLE_GROUP_COLORS[exercise.muscleGroup] ?? colors.primary;

  return (
    <View
      style={[
        styles.exBlock,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      {/* Exercise header */}
      <View style={styles.exHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.exName, { color: colors.foreground }]}>
            {exercise.exerciseName}
          </Text>
          <View style={styles.exMeta}>
            <View
              style={[
                styles.muscleTag,
                { backgroundColor: muscleColor + "22" },
              ]}
            >
              <Text style={[styles.muscleTagText, { color: muscleColor }]}>
                {exercise.muscleGroup}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Set column headers */}
      <View style={styles.setHeaders}>
        <Text style={[styles.setHeaderTxt, { color: colors.mutedForeground }]}>
          SET
        </Text>
        <Text style={[styles.setHeaderTxt, { color: colors.mutedForeground }]}>
          KG
        </Text>
        <Text style={[styles.setHeaderTxt, { color: colors.mutedForeground }]}>
          REPS
        </Text>
        <Text
          style={[
            styles.setHeaderTxt,
            { color: colors.mutedForeground, marginLeft: "auto" },
          ]}
        >
          DONE
        </Text>
      </View>

      {/* Sets */}
      {exercise.sets.map((set, setIdx) => (
        <SetRow
          key={setIdx}
          setNumber={setIdx + 1}
          weight={set.weight}
          reps={set.reps}
          completed={set.completed}
          previousWeight={exercise.previousBest?.weight_kg?.toString()}
          previousReps={exercise.previousBest?.reps?.toString()}
          onWeightChange={(v) => onUpdateSet(exIdx, setIdx, v, set.reps)}
          onRepsChange={(v) => onUpdateSet(exIdx, setIdx, set.weight, v)}
          onComplete={() => onCompleteSet(exIdx, setIdx)}
        />
      ))}

      <View style={styles.exFooter}>
        <TouchableOpacity
          onPress={() => onAddSet(exIdx)}
          style={[
            styles.addSetBtn,
            { borderColor: colors.border },
          ]}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={14} color={colors.foreground} />
          <Text style={[styles.addSetBtnText, { color: colors.foreground }]}>
            Add Set
          </Text>
        </TouchableOpacity>

        {exercise.sets.some((s) => s.weight && parseFloat(s.weight) > 0) && (
          <TouchableOpacity
            onPress={() => {
              const w = exercise.sets.find((s) => s.weight)?.weight ?? "0";
              onShowPlates(exIdx, w);
            }}
            style={[
              styles.plateBtn,
              { borderColor: colors.border },
            ]}
            activeOpacity={0.7}
          >
            <Feather name="disc" size={14} color={colors.mutedForeground} />
            <Text style={[styles.addSetBtnText, { color: colors.mutedForeground }]}>
              Plates
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notes */}
      <TextInput
        style={[
          styles.notesInput,
          {
            color: colors.foreground,
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
        value={exercise.notes}
        onChangeText={(v) => onUpdateNotes(exIdx, v)}
        placeholder="Notes..."
        placeholderTextColor={colors.mutedForeground}
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  workoutName: { fontSize: 17, fontWeight: "700" },
  timerText: { fontSize: 13, fontWeight: "600", marginTop: 2, fontVariant: ["tabular-nums"] },
  finishBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  finishBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  exBlock: {
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  exHeader: { flexDirection: "row", alignItems: "flex-start" },
  exName: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  exMeta: { flexDirection: "row", gap: 6 },
  muscleTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  muscleTagText: { fontSize: 11, fontWeight: "700" },
  setHeaders: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    gap: 8,
    marginBottom: 2,
  },
  setHeaderTxt: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    width: 40,
    textAlign: "center",
  },
  exFooter: { flexDirection: "row", gap: 8 },
  addSetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  addSetBtnText: { fontSize: 13, fontWeight: "600" },
  plateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  notesInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    minHeight: 36,
    marginTop: 2,
  },
  addExerciseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
    marginTop: 4,
  },
  addExerciseBtnText: { fontSize: 15, fontWeight: "600" },
  pickerContainer: { flex: 1 },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
  },
  pickerTitle: { fontSize: 18, fontWeight: "700" },
  searchInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  exPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  exPickerName: { fontSize: 15, fontWeight: "600", marginBottom: 3 },
  exPickerSub: { fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  plateModal: {
    width: "100%",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  plateModalTitle: { fontSize: 16, fontWeight: "700" },
  plateModalWeight: { fontSize: 40, fontWeight: "900" },
  plateModalCalc: { fontSize: 16, textAlign: "center", lineHeight: 24 },
  plateCloseBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
});
