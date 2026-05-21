import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { ChatMessage } from "@/types";

interface Props {
  message: ChatMessage;
  isStreaming?: boolean;
}

export default function ChatBubble({ message, isStreaming }: Props) {
  const colors = useColors();
  const isUser = message.role === "user";

  return (
    <View style={[styles.wrapper, isUser && styles.wrapperUser]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.ai ?? "#4488FF" }]}>
          <Text style={styles.avatarText}>AI</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? colors.primary : colors.card,
            borderColor: isUser ? colors.primary : colors.border,
            maxWidth: "80%",
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: isUser ? "#fff" : colors.foreground },
          ]}
        >
          {message.content}
          {isStreaming && (
            <Text style={{ color: colors.primary }}>▌</Text>
          )}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 4,
    paddingHorizontal: 16,
    gap: 8,
  },
  wrapperUser: {
    flexDirection: "row-reverse",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  bubble: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
});
