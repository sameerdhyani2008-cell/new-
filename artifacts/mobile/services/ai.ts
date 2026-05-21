import { fetch } from "expo/fetch";

import type { ChatMessage, PlannedWorkout, UserProfile, WorkoutSession } from "@/types";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export async function streamAIChat(
  messages: ChatMessage[],
  userProfile: UserProfile | null,
  recentSessions: WorkoutSession[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  const systemPrompt = buildCoachSystemPrompt(userProfile, recentSessions);

  const apiMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));

  try {
    const response = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: apiMessages, systemPrompt }),
    });

    if (!response.ok) {
      onError("AI service unavailable. Check that Anthropic integration is activated.");
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError("Stream not available");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6)) as {
              content?: string;
              done?: boolean;
              error?: string;
            };
            if (data.error) {
              onError(data.error);
              return;
            }
            if (data.content) {
              onChunk(data.content);
            }
            if (data.done) {
              onDone();
              return;
            }
          } catch {
            // skip malformed line
          }
        }
      }
    }

    onDone();
  } catch (err) {
    onError("Network error. Please check your connection.");
  }
}

export async function generateWorkoutPlan(
  userProfile: UserProfile,
  daysPerWeek: number,
  equipment: string,
  focusArea: string,
  recentSessions: WorkoutSession[]
): Promise<PlannedWorkout[] | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/ai/generate-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userProfile,
        daysPerWeek,
        equipment,
        focusArea,
        recentHistory: recentSessions.slice(0, 10).map((s) => ({
          name: s.name,
          exercises: s.exercises.map((e) => e.exerciseName),
          volume: s.totalVolume,
        })),
      }),
    });

    if (!response.ok) return null;

    const data = await response.json() as { workouts?: PlannedWorkout[] };
    return data?.workouts ?? null;
  } catch {
    return null;
  }
}

function buildCoachSystemPrompt(
  profile: UserProfile | null,
  recent: WorkoutSession[]
): string {
  const profileInfo = profile
    ? `User profile: ${profile.name}, ${profile.age}yo, ${profile.weight_kg}kg, goal: ${profile.goal}, level: ${profile.experienceLevel}.`
    : "User profile not set up yet.";

  const recentInfo =
    recent.length > 0
      ? `Recent workouts (last ${recent.length}): ${recent
          .slice(0, 4)
          .map(
            (s) =>
              `${s.name} (${new Date(s.startedAt).toLocaleDateString()}, ${s.duration}min, ${s.totalVolume}kg volume)`
          )
          .join("; ")}.`
      : "No recent workout history.";

  return `You are IronLog AI Coach — an expert personal trainer and strength coach with deep knowledge of exercise science, programming, and nutrition. You provide personalized, evidence-based advice.

${profileInfo}
${recentInfo}

Key guidelines:
- Be direct and confident. Avoid generic disclaimers.
- Use specific numbers (weights, sets, reps, rest times).
- When designing workouts, format exercises as structured lists.
- Reference the user's recent history to give personalized advice.
- Keep responses focused and actionable — not walls of text.
- Use proper exercise terminology.
- Do not use emojis.`;
}
