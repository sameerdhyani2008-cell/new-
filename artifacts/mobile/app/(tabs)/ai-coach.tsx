import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
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
import { useUser } from "@/store/UserContext";
import type { ChatMessage } from "@/types";

const STARTER_PROMPTS = [
  "Design me a Push/Pull/Legs split",
  "What should I do for leg day?",
  "How can I improve my bench press?",
  "Create a beginner program",
];

export default function AICoachScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, sessions } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

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

    // Capture messages before async
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
        <View style={[styles.aiBadge, { backgroundColor: "#4488FF22" }]}>
          <View style={[styles.aiDot, { backgroundColor: "#4488FF" }]} />
          <Text style={[styles.aiBadgeText, { color: "#4488FF" }]}>
            AI COACH
          </Text>
        </View>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          Powered by Claude
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
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
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.starterText, { color: colors.foreground }]}>
                    {p}
                  </Text>
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

        {/* Input */}
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
              {
                backgroundColor:
                  input.trim() && !isTyping ? "#4488FF" : colors.muted,
              },
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
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
  starterBtn: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  starterText: { fontSize: 14, fontWeight: "500" },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
  },
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
});
