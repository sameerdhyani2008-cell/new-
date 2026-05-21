import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { useUser } from "@/store/UserContext";

export default function Index() {
  const { onboardingComplete, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0A0A", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#FF4444" size="large" />
      </View>
    );
  }

  if (!onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
