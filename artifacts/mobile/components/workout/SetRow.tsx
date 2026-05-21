import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
  previousWeight?: string;
  previousReps?: string;
  onWeightChange: (v: string) => void;
  onRepsChange: (v: string) => void;
  onComplete: () => void;
}

export default function SetRow({
  setNumber,
  weight,
  reps,
  completed,
  previousWeight,
  previousReps,
  onWeightChange,
  onRepsChange,
  onComplete,
}: Props) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;

  const handleComplete = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete();
  };

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: completed
            ? `${colors.primary}18`
            : colors.card,
          borderColor: completed ? colors.primary : colors.border,
        },
      ]}
    >
      <View style={[styles.setNum, { backgroundColor: completed ? colors.primary : colors.muted }]}>
        <Text style={[styles.setNumText, { color: completed ? "#fff" : colors.mutedForeground }]}>
          {setNumber}
        </Text>
      </View>

      <TextInput
        style={[
          styles.input,
          {
            color: completed ? colors.foreground : colors.foreground,
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
        value={weight}
        onChangeText={onWeightChange}
        keyboardType="decimal-pad"
        placeholder={previousWeight ?? "0"}
        placeholderTextColor={colors.mutedForeground}
        onFocus={(e) => e.target.measure?.(() => {})}
        selectTextOnFocus
      />
      <Text style={[styles.unit, { color: colors.mutedForeground }]}>kg</Text>

      <TextInput
        style={[
          styles.input,
          {
            color: colors.foreground,
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
        value={reps}
        onChangeText={onRepsChange}
        keyboardType="number-pad"
        placeholder={previousReps ?? "0"}
        placeholderTextColor={colors.mutedForeground}
        selectTextOnFocus
      />
      <Text style={[styles.unit, { color: colors.mutedForeground }]}>reps</Text>

      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={handleComplete}
          style={[
            styles.checkBtn,
            {
              backgroundColor: completed ? colors.primary : colors.muted,
              borderColor: completed ? colors.primary : colors.border,
            },
          ]}
          activeOpacity={0.7}
        >
          <Feather
            name="check"
            size={16}
            color={completed ? "#fff" : colors.mutedForeground}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
    gap: 8,
  },
  setNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  setNumText: {
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    width: 64,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  unit: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: -4,
  },
  checkBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
});
