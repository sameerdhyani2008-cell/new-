import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useUser } from "@/store/UserContext";
import type { UserProfile } from "@/types";

const GOALS: UserProfile["goal"][] = [
  "Build Muscle",
  "Lose Fat",
  "Recomposition",
  "Improve Strength",
  "General Fitness",
];
const LEVELS: UserProfile["experienceLevel"][] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

export default function ProfileSetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { saveProfile, completeOnboarding } = useUser();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState<UserProfile["goal"]>("Build Muscle");
  const [level, setLevel] = useState<UserProfile["experienceLevel"]>("Beginner");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [error, setError] = useState("");

  const handleWeightUnitChange = (unit: "kg" | "lbs") => {
    if (unit === weightUnit) return;
    if (weight) {
      const num = parseFloat(weight);
      if (!isNaN(num)) {
        if (unit === "lbs") {
          setWeight((num * 2.20462).toFixed(1));
        } else {
          setWeight((num / 2.20462).toFixed(1));
        }
      }
    }
    setWeightUnit(unit);
  };

  const handleHeightUnitChange = (unit: "cm" | "in") => {
    if (unit === heightUnit) return;
    if (height) {
      const num = parseFloat(height);
      if (!isNaN(num)) {
        if (unit === "in") {
          setHeight((num / 2.54).toFixed(1));
        } else {
          setHeight((num * 2.54).toFixed(1));
        }
      }
    }
    setHeightUnit(unit);
  };

  const handleDone = async () => {
    if (!name.trim() || !age || !weight || !height) {
      setError("Please fill in all fields.");
      return;
    }
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    if (isNaN(weightNum) || isNaN(heightNum)) {
      setError("Please enter valid numbers for weight and height.");
      return;
    }
    const weight_kg = weightUnit === "lbs" ? weightNum / 2.20462 : weightNum;
    const height_cm = heightUnit === "in" ? heightNum * 2.54 : heightNum;

    const profile: UserProfile = {
      id: Date.now().toString(),
      name: name.trim(),
      age: parseInt(age, 10),
      weight_kg: parseFloat(weight_kg.toFixed(2)),
      height_cm: parseFloat(height_cm.toFixed(1)),
      goal,
      experienceLevel: level,
      weightUnit,
      heightUnit,
      restDuration: 90,
    };
    await saveProfile(profile);
    await completeOnboarding();
    router.replace("/(tabs)");
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0) + 20;
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 20;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad,
        paddingBottom: botPad,
        paddingHorizontal: 24,
        gap: 24,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Tell us about yourself
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Personalizes your AI coaching
        </Text>
      </View>

      <View style={styles.row}>
        <Field label="Name" flex={1}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.foreground,
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.mutedForeground}
          />
        </Field>
        <Field label="Age" flex={0.5}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.foreground,
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            value={age}
            onChangeText={setAge}
            placeholder="25"
            keyboardType="number-pad"
            placeholderTextColor={colors.mutedForeground}
          />
        </Field>
      </View>

      {/* Unit toggles */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            WEIGHT UNIT
          </Text>
          <View style={styles.unitToggle}>
            {(["kg", "lbs"] as const).map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => handleWeightUnitChange(u)}
                style={[
                  styles.unitBtn,
                  {
                    backgroundColor:
                      weightUnit === u ? colors.primary : colors.card,
                    borderColor:
                      weightUnit === u ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.unitBtnText,
                    { color: weightUnit === u ? "#fff" : colors.foreground },
                  ]}
                >
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            HEIGHT UNIT
          </Text>
          <View style={styles.unitToggle}>
            {(["cm", "in"] as const).map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => handleHeightUnitChange(u)}
                style={[
                  styles.unitBtn,
                  {
                    backgroundColor:
                      heightUnit === u ? colors.primary : colors.card,
                    borderColor:
                      heightUnit === u ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.unitBtnText,
                    { color: heightUnit === u ? "#fff" : colors.foreground },
                  ]}
                >
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Weight & Height inputs */}
      <View style={styles.row}>
        <Field label={`Weight (${weightUnit})`} flex={1}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.foreground,
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            value={weight}
            onChangeText={setWeight}
            placeholder={weightUnit === "kg" ? "80" : "176"}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.mutedForeground}
          />
        </Field>
        <Field label={`Height (${heightUnit})`} flex={1}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.foreground,
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            value={height}
            onChangeText={setHeight}
            placeholder={heightUnit === "cm" ? "178" : "70"}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.mutedForeground}
          />
        </Field>
      </View>

      <View>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          GOAL
        </Text>
        <View style={styles.chips}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setGoal(g)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    goal === g ? colors.primary : colors.card,
                  borderColor: goal === g ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: goal === g ? "#fff" : colors.foreground,
                  },
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          EXPERIENCE
        </Text>
        <View style={styles.chips}>
          {LEVELS.map((l) => (
            <TouchableOpacity
              key={l}
              onPress={() => setLevel(l)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    level === l ? colors.primary : colors.card,
                  borderColor: level === l ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: level === l ? "#fff" : colors.foreground },
                ]}
              >
                {l}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {!!error && (
        <Text style={{ color: colors.destructive, fontSize: 14 }}>{error}</Text>
      )}

      <TouchableOpacity
        onPress={handleDone}
        style={[styles.doneBtn, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
      >
        <Text style={styles.doneBtnText}>Start Training</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({
  label,
  flex,
  children,
}: {
  label: string;
  flex?: number;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={{ flex: flex ?? 1, gap: 6 }}>
      <Text style={{ fontSize: 11, fontWeight: "600", color: colors.mutedForeground, letterSpacing: 1 }}>
        {label.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  sub: { fontSize: 15 },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 12 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  unitToggle: {
    flexDirection: "row",
    gap: 8,
  },
  unitBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  unitBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  doneBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  doneBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
});
