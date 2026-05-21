import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

import { useColors } from "@/hooks/useColors";
import { useWorkout } from "@/store/WorkoutContext";

export default function RestTimer() {
  const colors = useColors();
  const { restTimer, stopRestTimer } = useWorkout();
  const slideAnim = useRef(new Animated.Value(120)).current;

  useEffect(() => {
    if (restTimer.isRunning) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 120,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [restTimer.isRunning, slideAnim]);

  if (!restTimer.isRunning && restTimer.seconds === 0) return null;

  const progress = restTimer.maxSeconds > 0
    ? restTimer.seconds / restTimer.maxSeconds
    : 0;
  const size = 72;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * (1 - progress);

  const mins = Math.floor(restTimer.seconds / 60);
  const secs = restTimer.seconds % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          REST
        </Text>

        <View style={styles.timerWrapper}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.muted}
              strokeWidth={4}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.primary}
              strokeWidth={4}
              fill="none"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDash}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          <View style={styles.timerTextOverlay}>
            <Text style={[styles.time, { color: colors.foreground }]}>
              {timeStr}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={stopRestTimer}
          style={[styles.skipBtn, { backgroundColor: colors.muted }]}
          activeOpacity={0.7}
        >
          <Feather name="skip-forward" size={16} color={colors.foreground} />
          <Text style={[styles.skipText, { color: colors.foreground }]}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },
  timerWrapper: {
    position: "relative",
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  timerTextOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    fontSize: 18,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
