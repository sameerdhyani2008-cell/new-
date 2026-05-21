import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#FF4444", "#FF6600", "#0A0A0A"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 0.6 }}
        locations={[0, 0.3, 0.7]}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop:
              insets.top + (Platform.OS === "web" ? 67 : 0) + 40,
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 40,
          },
        ]}
      >
        <View style={styles.logoSection}>
          <View
            style={[
              styles.logoBox,
              { borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(0,0,0,0.5)" },
            ]}
          >
            <Text style={styles.logoText}>IL</Text>
          </View>
          <Text style={styles.appName}>IRONLOG</Text>
          <Text style={[styles.tagline, { color: "rgba(255,255,255,0.7)" }]}>
            Your AI-Powered Strength Coach
          </Text>
        </View>

        <View style={styles.features}>
          {[
            { icon: "//", text: "Track every set, rep, and PR" },
            { icon: "//", text: "AI coach learns your performance" },
            { icon: "//", text: "Visual progress over time" },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => router.push("/onboarding/profile")}
          style={[styles.btn, { backgroundColor: "#fff" }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnText, { color: "#0A0A0A" }]}>
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "space-between",
  },
  logoSection: {
    alignItems: "center",
    gap: 12,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1,
  },
  appName: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "400",
    lineHeight: 22,
  },
  features: {
    gap: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featureText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  btn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 17,
    fontWeight: "700",
  },
});
