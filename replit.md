# IronLog

A full-stack AI-powered gym tracking mobile app for iOS and Android built with Expo SDK 54.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/mobile run dev` — run the Expo app (port 18115)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `DATABASE_URL` — Postgres connection string (optional for this app, all data in AsyncStorage)
- Required env: `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` / `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — Set via Replit AI Integrations (requires phone verification)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54, expo-router v6, react-native-svg, react-native-reanimated
- API: Express 5
- State: React Context + AsyncStorage (no database needed)
- AI: Anthropic Claude via Replit AI Integrations (streaming SSE)
- Build: esbuild (API server)

## Where things live

- `artifacts/mobile/` — Expo React Native app
  - `app/` — Expo Router file-based routes
  - `app/(tabs)/` — 5 tab screens: Home, Log, Progress, AI Coach, Profile
  - `app/workout/` — Active workout and summary screens
  - `app/onboarding/` — Welcome + profile setup
  - `store/` — React Context providers (UserContext, WorkoutContext)
  - `services/database.ts` — AsyncStorage CRUD helpers
  - `services/ai.ts` — AI service (calls backend)
  - `constants/exercises.ts` — 80+ exercise database
  - `constants/colors.ts` — Dark gym theme tokens
- `artifacts/api-server/src/routes/ai.ts` — Anthropic streaming chat + plan generation

## Architecture decisions

- All user data stored in AsyncStorage (no DB provisioning needed for first build)
- AI calls route through the Express backend to keep API keys server-side
- Dark mode forced via `userInterfaceStyle: "dark"` in app.json
- Workout state (active session, rest timer) managed in WorkoutContext with interval refs
- SVG charts built with react-native-svg (no external chart library needed)

## Product

- **Onboarding**: Profile setup (name, age, weight, height, goal, experience level)
- **Home**: Quick start workouts (Push/Pull/Legs/Upper), weekly stats, streak counter
- **Active Workout**: Set/rep logging, rest timer with SVG progress ring, plate calculator, exercise picker (80+ exercises)
- **Log**: Calendar heat strip, workout history with set-by-set detail and 1RM estimates
- **Progress**: Personal records, exercise line charts, weekly volume bar charts, bodyweight tracking
- **AI Coach**: Streaming chat with Claude, personalized to user profile and recent workouts
- **Profile**: Stats overview, rest timer settings, weight unit preference

## User preferences

- Dark gym aesthetic: #0A0A0A background, #FF4444 primary red, #FF6600 accent
- No emojis in UI (except streak fire indicator)
- All data local (AsyncStorage) — no sign-in required

## Gotchas

- AI features require Anthropic integration: user must verify phone on Replit account, then call `setupReplitAIIntegrations` in code_execution
- `expo/fetch` is used for streaming AI responses (not native fetch)
- FlatList in ai-coach screen is inverted for chat UX
- Rest timer uses refs for intervals to avoid stale closure issues

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for Expo-specific patterns
