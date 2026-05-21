import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import * as db from "@/services/database";
import { useUser } from "@/store/UserContext";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, sessions, weeklyStats, saveProfile } = useUser();

  const [restDuration, setRestDuration] = useState(
    String(profile?.restDuration ?? 90)
  );
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">(
    profile?.weightUnit ?? "kg"
  );
  const [edited, setEdited] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0) + 20;
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 84) + 20;

  const totalVolume = sessions.reduce((sum, s) => sum + s.totalVolume, 0);
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);

  const handleSave = async () => {
    if (!profile) return;
    await saveProfile({
      ...profile,
      restDuration: parseInt(restDuration, 10) || 90,
      weightUnit,
    });
    setEdited(false);
  };

  const handleReset = () => {
    Alert.alert(
      "Reset All Data",
      "This will permanently delete all your workout history, personal records, and settings. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await db.markOnboardingComplete();
          },
        },
      ]
    );
  };

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>No profile found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPad,
        paddingBottom: botPad,
        paddingHorizontal: 16,
        gap: 16,
      }}
    >
      {/* Profile card */}
      <View
        style={[
          styles.profileCard,
          { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
        ]}
      >
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.primary + "22", borderColor: colors.primary },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {profile.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.profileName, { color: colors.foreground }]}>
            {profile.name}
          </Text>
          <Text style={[styles.profileGoal, { color: colors.primary }]}>
            {profile.goal} · {profile.experienceLevel}
          </Text>
          <Text style={[styles.profileStats, { color: colors.mutedForeground }]}>
            {profile.height_cm}cm · {profile.weight_kg}kg
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View
        style={[
          styles.statsGrid,
          { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
        ]}
      >
        <StatItem
          label="Workouts"
          value={String(sessions.length)}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <StatItem
          label="Total Volume"
          value={
            totalVolume >= 1000
              ? `${(totalVolume / 1000).toFixed(1)}t`
              : `${totalVolume}kg`
          }
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <StatItem
          label="Hours"
          value={(totalDuration / 60).toFixed(1)}
          colors={colors}
        />
      </View>

      {/* Settings */}
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        SETTINGS
      </Text>

      <View
        style={[
          styles.settingsCard,
          { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
        ]}
      >
        <SettingRow label="Weight Unit" colors={colors}>
          <View style={styles.toggleRow}>
            {(["kg", "lbs"] as const).map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => {
                  setWeightUnit(u);
                  setEdited(true);
                }}
                style={[
                  styles.unitBtn,
                  {
                    backgroundColor:
                      weightUnit === u ? colors.primary : colors.muted,
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
        </SettingRow>

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        <SettingRow label="Default Rest Timer" colors={colors}>
          <View style={styles.restInput}>
            <TextInput
              style={[
                styles.restTextInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              value={restDuration}
              onChangeText={(v) => {
                setRestDuration(v);
                setEdited(true);
              }}
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={[styles.restUnit, { color: colors.mutedForeground }]}>
              sec
            </Text>
          </View>
        </SettingRow>

        {edited && (
          <>
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity
        onPress={handleReset}
        style={[
          styles.dangerBtn,
          { borderColor: colors.destructive + "44" },
        ]}
        activeOpacity={0.8}
      >
        <Feather name="trash-2" size={16} color={colors.destructive} />
        <Text style={[styles.dangerBtnText, { color: colors.destructive }]}>
          Reset All Data
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatItem({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

function SettingRow({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={[styles.settingLabel, { color: colors.foreground }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 26, fontWeight: "800" },
  profileName: { fontSize: 20, fontWeight: "800", marginBottom: 3 },
  profileGoal: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  profileStats: { fontSize: 12 },
  statsGrid: {
    flexDirection: "row",
    padding: 16,
    borderWidth: 1,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "800", marginBottom: 3 },
  statLabel: { fontSize: 11, fontWeight: "500" },
  divider: { width: 1 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    paddingHorizontal: 4,
    marginBottom: -4,
  },
  settingsCard: { borderWidth: 1 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingLabel: { fontSize: 15, fontWeight: "500" },
  separator: { height: StyleSheet.hairlineWidth },
  toggleRow: { flexDirection: "row", gap: 6 },
  unitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unitBtnText: { fontSize: 13, fontWeight: "700" },
  restInput: { flexDirection: "row", alignItems: "center", gap: 6 },
  restTextInput: {
    width: 60,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  restUnit: { fontSize: 13 },
  saveBtn: {
    margin: 16,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  dangerBtnText: { fontSize: 15, fontWeight: "600" },
});
