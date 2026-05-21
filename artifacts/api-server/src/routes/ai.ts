import { Router } from "express";

const router = Router();

const ANTHROPIC_BASE_URL =
  process.env["AI_INTEGRATIONS_ANTHROPIC_BASE_URL"] ?? "https://api.anthropic.com";
const ANTHROPIC_API_KEY = process.env["AI_INTEGRATIONS_ANTHROPIC_API_KEY"] ?? "";

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

router.post("/chat", async (req, res) => {
  const { messages, systemPrompt } = req.body as {
    messages: AnthropicMessage[];
    systemPrompt?: string;
  };

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages is required" });
    return;
  }

  if (!ANTHROPIC_API_KEY) {
    res.status(503).json({
      error:
        "AI integration not configured. Please activate Anthropic integration in your Replit project.",
    });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const response = await fetch(`${ANTHROPIC_BASE_URL}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        stream: true,
        system: systemPrompt ?? "You are an expert fitness coach.",
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.write(
        `data: ${JSON.stringify({ error: `Anthropic error: ${response.status}` })}\n\n`
      );
      res.end();
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      res.write(`data: ${JSON.stringify({ error: "Stream not available" })}\n\n`);
      res.end();
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
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") continue;
          try {
            const evt = JSON.parse(raw) as {
              type: string;
              delta?: { type: string; text?: string };
            };
            if (
              evt.type === "content_block_delta" &&
              evt.delta?.type === "text_delta" &&
              evt.delta.text
            ) {
              res.write(
                `data: ${JSON.stringify({ content: evt.delta.text })}\n\n`
              );
            }
          } catch {
            // skip malformed
          }
        }
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    res.write(
      `data: ${JSON.stringify({ error: "Network error reaching AI service" })}\n\n`
    );
    res.end();
  }
});

router.post("/generate-plan", async (req, res) => {
  const { userProfile, daysPerWeek, equipment, focusArea, recentHistory } =
    req.body as {
      userProfile: Record<string, unknown>;
      daysPerWeek: number;
      equipment: string;
      focusArea: string;
      recentHistory: Array<{
        name: string;
        exercises: string[];
        volume: number;
      }>;
    };

  if (!ANTHROPIC_API_KEY) {
    res.status(503).json({ error: "AI integration not configured" });
    return;
  }

  const prompt = `Generate a ${daysPerWeek}-day workout plan as JSON.
User: ${JSON.stringify(userProfile)}
Equipment: ${equipment}
Focus: ${focusArea}
Recent history: ${JSON.stringify(recentHistory?.slice(0, 4) ?? [])}

Return ONLY valid JSON in this exact format:
{
  "plan_name": "...",
  "workouts": [
    {
      "day": "Monday",
      "name": "Push Day",
      "exercises": [
        { "name": "Bench Press", "sets": 4, "reps": "6-8", "rest_seconds": 120, "notes": "..." }
      ]
    }
  ]
}`;

  try {
    const response = await fetch(`${ANTHROPIC_BASE_URL}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      res.status(502).json({ error: "AI service error" });
      return;
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
    };
    const text = data.content?.[0]?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { plan_name: string; workouts: unknown[] };
      res.json(parsed);
    } else {
      res.status(500).json({ error: "Could not parse AI response" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to generate plan" });
  }
});

export default router;
