import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChatBubble from "@/components/ai/ChatBubble";
import { useColors } from "@/hooks/useColors";
import * as aiService from "@/services/ai";
import { savePlan } from "@/services/database";
import { useUser } from "@/store/UserContext";
import type { ChatMessage, PlannedWorkout, WorkoutPlan } from "@/types";

const STARTER_PROMPTS = [
  "Design me a Push/Pull/Legs split",
  "What should I do for leg day?",
  "How can I improve my bench press?",
  "Create a beginner program",
];

const EQUIPMENT_OPTIONS = ["Full Gym", "Barbell Only", "Dumbbells Only", "Bodyweight"];
const GOAL_OPTIONS = ["Build Muscle", "Strength", "Fat Loss", "Athletic"];
const DAYS_OPTIONS = [3, 4, 5, 6];

export default function AICoachScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, sessions } = useUser();
  const [activeTab, setActiveTab] = useState<"chat" | "plan">("chat");

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Plan builder state
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [equipment, setEquipment] = useState("Full Gym");
  const [planGoal, setPlanGoal] = useState("Build Muscle");
  const [focusArea, setFocusArea] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<PlannedWorkout[] | null>(null);
  const [planName, setPlanName] = useState("");
  const [generating, setGenerating] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const aiId = (Date.now() + 1).toString();
    const aiMsg: ChatMessage = {
      id: aiId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, aiMsg]);
    setIsTyping(true);
    setStreamingId(aiId);

    const msgSnapshot = newMessages;

    await aiService.streamAIChat(
      msgSnapshot,
      profile,
      sessions.slice(0, 8),
      (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId ? { ...m, content: m.content + chunk } : m
          )
        );
      },
      () => {
        setIsTyping(false);
        setStreamingId(null);
      },
      (err) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiId ? { ...m, content: `Error: ${err}` } : m
          )
        );
        setIsTyping(false);
        setStreamingId(null);
      }
    );
  };

  const handleGeneratePlan = async () => {
    if (!profile) {
      Alert.alert("Setup Required", "Complete your profile setup first.");
      return;
    }
    setGenerating(true);
    setGeneratedPlan(null);
    try {
      const plan = await aiService.generateWorkoutPlan(
        profile,
        daysPerWeek,
        equipment,
        focusArea || planGoal,
        sessions.slice(0, 8)
      );
      if (plan) {
        setGeneratedPlan(plan);
        setPlanName(`${daysPerWeek}-Day ${planGoal} Plan`);
      } else {
        Alert.alert(
          "AI Unavailable",
          "Could not generate plan. Make sure Anthropic integration is activated in your Replit project settings under Tools → Integrations."
        );
      }
    } finally {
      setGenerating(false);
    }
  };

  const savePlanToStorage = async () => {
    if (!generatedPlan) return;
    const plan: WorkoutPlan = {
      id: Date.now().toString(),
      name: planName || "AI Generated Plan",
      createdByAI: true,
      createdAt: new Date().toISOString(),
      workouts: generatedPlan,
    };
    await savePlan(plan);
    Alert.alert("Saved!", "Your plan has been saved. Find it on the Home tab.");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 16,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={[styles.aiBadge, { backgroundColor: "#4488FF22" }]}>
            <View style={[styles.aiDot, { backgroundColor: "#4488FF" }]} />
            <Text style={[styles.aiBadgeText, { color: "#4488FF" }]}>AI COACH</Text>
          </View>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Powered by Claude
          </Text>
        </View>

        {/* Tab switcher */}
        <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(["chat", "plan"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabBtn,
                activeTab === tab && { backgroundColor: colors.primary },
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === tab ? "#fff" : colors.mutedForeground },
                ]}
              >
                {tab === "chat" ? "CHAT" : "PLAN BUILDER"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === "chat" ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                Your AI Coach
              </Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Ask anything about training, nutrition, or program design.
              </Text>
              <View style={styles.starters}>
                {STARTER_PROMPTS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => sendMessage(p)}
                    activeOpacity={0.7}
                    style={[
                      styles.starterBtn,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.starterText, { color: colors.foreground }]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(m) => m.id}
              inverted
              contentContainerStyle={{ paddingVertical: 12, flexDirection: "column-reverse" }}
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              renderItem={({ item: m }) => (
                <ChatBubble
                  message={m}
                  isStreaming={m.id === streamingId && isTyping}
                />
              )}
              ListHeaderComponent={
                isTyping && streamingId === null ? (
                  <View style={[styles.typingIndicator, { marginBottom: 8 }]}>
                    <ActivityIndicator size="small" color="#4488FF" />
                  </View>
                ) : null
              }
            />
          )}

          <View
            style={[
              styles.inputBar,
              {
                backgroundColor: colors.background,
                borderTopColor: colors.border,
                paddingBottom: botPad + 8,
              },
            ]}
          >
            <TextInput
              style={[
                styles.textInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              value={input}
              onChangeText={setInput}
              placeholder="Ask your coach..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              maxLength={500}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={() => sendMessage(input)}
            />
            <TouchableOpacity
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              style={[
                styles.sendBtn,
                { backgroundColor: input.trim() && !isTyping ? "#4488FF" : colors.muted },
              ]}
              activeOpacity={0.8}
            >
              {isTyping ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: botPad + 32,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Days per week */}
          <View>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              DAYS PER WEEK
            </Text>
            <View style={styles.segmentRow}>
              {DAYS_OPTIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDaysPerWeek(d)}
                  style={[
                    styles.segmentBtn,
                    {
                      backgroundColor: daysPerWeek === d ? colors.primary : colors.card,
                      borderColor: daysPerWeek === d ? colors.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.segmentBtnText,
                      { color: daysPerWeek === d ? "#fff" : colors.foreground },
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Equipment */}
          <View>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              EQUIPMENT
            </Text>
            <View style={styles.chipRow}>
              {EQUIPMENT_OPTIONS.map((e) => (
                <TouchableOpacity
                  key={e}
                  onPress={() => setEquipment(e)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: equipment === e ? colors.primary : colors.card,
                      borderColor: equipment === e ? colors.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: equipment === e ? "#fff" : colors.foreground },
                    ]}
                  >
                    {e}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Goal */}
          <View>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              GOAL
            </Text>
            <View style={styles.chipRow}>
              {GOAL_OPTIONS.map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setPlanGoal(g)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: planGoal === g ? colors.primary : colors.card,
                      borderColor: planGoal === g ? colors.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: planGoal === g ? "#fff" : colors.foreground },
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Focus area */}
          <View>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              FOCUS AREA (OPTIONAL)
            </Text>
            <TextInput
              style={[
                styles.focusInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              value={focusArea}
              onChangeText={setFocusArea}
              placeholder="e.g. Upper body and legs, weak points..."
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          {/* Generate button */}
          <TouchableOpacity
            onPress={handleGeneratePlan}
            disabled={generating}
            style={[
              styles.generateBtn,
              { backgroundColor: generating ? colors.muted : colors.primary },
            ]}
            activeOpacity={0.85}
          >
            {generating ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.generateBtnText}>Generating plan...</Text>
              </>
            ) : (
              <>
                <Feather name="zap" size={18} color="#fff" />
                <Text style={styles.generateBtnText}>Generate AI Plan</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Generated plan */}
          {generatedPlan && generatedPlan.length > 0 && (
            <>
              <View style={[styles.planDivider, { backgroundColor: colors.border }]} />
              <TextInput
                style={[
                  styles.planNameInput,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
                value={planName}
                onChangeText={setPlanName}
                placeholder="Plan name..."
                placeholderTextColor={colors.mutedForeground}
              />

              {generatedPlan.map((workout, wi) => (
                <View
                  key={wi}
                  style={[
                    styles.planDayCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.planDayHeader}>
                    <Text style={[styles.planDayLabel, { color: colors.mutedForeground }]}>
                      {workout.day.toUpperCase()}
                    </Text>
                    <Text style={[styles.planDayName, { color: colors.foreground }]}>
                      {workout.name}
                    </Text>
                  </View>
                  {workout.exercises.map((ex, ei) => (
                    <View key={ei} style={styles.planExRow}>
                      <View style={[styles.planExDot, { backgroundColor: colors.primary }]} />
                      <Text style={[styles.planExText, { color: colors.foreground }]}>
                        {ex.name}
                      </Text>
                      <Text style={[styles.planExMeta, { color: colors.mutedForeground }]}>
                        {ex.sets}×{ex.reps}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}

              <View style={styles.planActions}>
                <TouchableOpacity
                  onPress={savePlanToStorage}
                  style={[styles.savePlanBtn, { backgroundColor: colors.primary }]}
                  activeOpacity={0.85}
                >
                  <Feather name="save" size={16} color="#fff" />
                  <Text style={styles.savePlanBtnText}>Save Plan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleGeneratePlan}
                  style={[styles.regenBtn, { borderColor: colors.border }]}
                  activeOpacity={0.8}
                >
                  <Feather name="refresh-cw" size={16} color={colors.foreground} />
                  <Text style={[styles.regenBtnText, { color: colors.foreground }]}>
                    Regenerate
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  aiDot: { width: 7, height: 7, borderRadius: 3.5 },
  aiBadgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  headerSub: { fontSize: 12 },
  tabBar: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  tabBtnText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  emptySub: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  starters: { width: "100%", gap: 8, marginTop: 8 },
  starterBtn: { padding: 14, borderRadius: 12, borderWidth: 1 },
  starterText: { fontSize: 14, fontWeight: "500" },
  typingIndicator: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 8 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  // Plan builder
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  segmentRow: { flexDirection: "row", gap: 8 },
  segmentBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnText: { fontSize: 16, fontWeight: "800" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  focusInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  generateBtn: {
    height: 56,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  generateBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  planDivider: { height: StyleSheet.hairlineWidth },
  planNameInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "700",
  },
  planDayCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  planDayHeader: { gap: 2 },
  planDayLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5 },
  planDayName: { fontSize: 16, fontWeight: "800" },
  planExRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  planExDot: { width: 6, height: 6, borderRadius: 3 },
  planExText: { flex: 1, fontSize: 14, fontWeight: "500" },
  planExMeta: { fontSize: 13, fontWeight: "600" },
  planActions: { flexDirection: "row", gap: 10 },
  savePlanBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  savePlanBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  regenBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  regenBtnText: { fontSize: 15, fontWeight: "600" },
});
