import type { Exercise } from "@/types";

export const EXERCISES: Exercise[] = [
  // CHEST
  { id: "chest_01", name: "Bench Press", muscleGroup: "Chest", equipment: "Barbell", instructions: "Lie flat on bench, grip bar slightly wider than shoulder-width, lower to chest, press up." },
  { id: "chest_02", name: "Incline Bench Press", muscleGroup: "Chest", equipment: "Barbell", instructions: "Set bench to 30-45°, press bar from upper chest upward." },
  { id: "chest_03", name: "Dumbbell Bench Press", muscleGroup: "Chest", equipment: "Dumbbell", instructions: "Hold dumbbells at chest level, press up until arms extended." },
  { id: "chest_04", name: "Incline Dumbbell Press", muscleGroup: "Chest", equipment: "Dumbbell", instructions: "Set bench to 30-45°, press dumbbells from upper chest upward." },
  { id: "chest_05", name: "Dumbbell Fly", muscleGroup: "Chest", equipment: "Dumbbell", instructions: "Lie flat, arms extended above chest, lower in wide arc, squeeze back up." },
  { id: "chest_06", name: "Cable Fly", muscleGroup: "Chest", equipment: "Cable", instructions: "Set cables high, pull handles together in arc in front of chest." },
  { id: "chest_07", name: "Push-Up", muscleGroup: "Chest", equipment: "Bodyweight", instructions: "Hands shoulder-width apart, lower chest to floor, push back up." },
  { id: "chest_08", name: "Chest Dip", muscleGroup: "Chest", equipment: "Bodyweight", instructions: "Lean forward slightly on parallel bars, lower until shoulder stretch, press up." },
  { id: "chest_09", name: "Pec Deck", muscleGroup: "Chest", equipment: "Machine", instructions: "Sit upright, bring handles together in front of chest." },
  { id: "chest_10", name: "Decline Bench Press", muscleGroup: "Chest", equipment: "Barbell", instructions: "Set bench declined, press from lower chest upward." },

  // BACK
  { id: "back_01", name: "Deadlift", muscleGroup: "Back", equipment: "Barbell", instructions: "Hip-width stance, hinge at hips, grip bar, drive hips forward to stand." },
  { id: "back_02", name: "Pull-Up", muscleGroup: "Back", equipment: "Bodyweight", instructions: "Hang from bar, pull chest to bar, lower with control." },
  { id: "back_03", name: "Chin-Up", muscleGroup: "Back", equipment: "Bodyweight", instructions: "Underhand grip, pull chin above bar, lower slowly." },
  { id: "back_04", name: "Barbell Row", muscleGroup: "Back", equipment: "Barbell", instructions: "Hinge forward, pull bar to lower chest/belly, squeeze lats." },
  { id: "back_05", name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable", instructions: "Wide grip, pull bar to upper chest, control on way up." },
  { id: "back_06", name: "Seated Cable Row", muscleGroup: "Back", equipment: "Cable", instructions: "Sit upright, pull handle to lower chest, squeeze shoulder blades." },
  { id: "back_07", name: "Single-Arm Dumbbell Row", muscleGroup: "Back", equipment: "Dumbbell", instructions: "Brace on bench, pull dumbbell to hip, lower with control." },
  { id: "back_08", name: "T-Bar Row", muscleGroup: "Back", equipment: "Barbell", instructions: "Straddle bar, pull to chest, keep back flat." },
  { id: "back_09", name: "Face Pull", muscleGroup: "Back", equipment: "Cable", instructions: "Pull rope to face level, separate at end, targets rear delts." },
  { id: "back_10", name: "Romanian Deadlift", muscleGroup: "Back", equipment: "Barbell", instructions: "Hinge at hips with soft knees, lower bar along legs, feel hamstring stretch." },
  { id: "back_11", name: "Hyperextension", muscleGroup: "Back", equipment: "Machine", instructions: "Hinge forward at hips, rise until body is straight, focus on lower back." },

  // SHOULDERS
  { id: "shoulders_01", name: "Overhead Press", muscleGroup: "Shoulders", equipment: "Barbell", instructions: "Press bar from chin level overhead, lock out arms, lower with control." },
  { id: "shoulders_02", name: "Dumbbell Shoulder Press", muscleGroup: "Shoulders", equipment: "Dumbbell", instructions: "Press dumbbells from ear level to overhead." },
  { id: "shoulders_03", name: "Lateral Raise", muscleGroup: "Shoulders", equipment: "Dumbbell", instructions: "Raise dumbbells to side until arms parallel to floor." },
  { id: "shoulders_04", name: "Front Raise", muscleGroup: "Shoulders", equipment: "Dumbbell", instructions: "Raise dumbbells to front until arms parallel to floor." },
  { id: "shoulders_05", name: "Rear Delt Fly", muscleGroup: "Shoulders", equipment: "Dumbbell", instructions: "Bent forward, raise dumbbells to side, squeeze rear delts." },
  { id: "shoulders_06", name: "Arnold Press", muscleGroup: "Shoulders", equipment: "Dumbbell", instructions: "Start with palms facing you, rotate and press overhead." },
  { id: "shoulders_07", name: "Upright Row", muscleGroup: "Shoulders", equipment: "Barbell", instructions: "Narrow grip, pull bar to chin, elbows high." },
  { id: "shoulders_08", name: "Cable Lateral Raise", muscleGroup: "Shoulders", equipment: "Cable", instructions: "Single cable, raise arm out to side." },

  // BICEPS
  { id: "biceps_01", name: "Barbell Curl", muscleGroup: "Biceps", equipment: "Barbell", instructions: "Stand, curl bar to chin, squeeze at top, lower slowly." },
  { id: "biceps_02", name: "Dumbbell Curl", muscleGroup: "Biceps", equipment: "Dumbbell", instructions: "Alternating or simultaneous, curl to shoulder, rotate palm up." },
  { id: "biceps_03", name: "Hammer Curl", muscleGroup: "Biceps", equipment: "Dumbbell", instructions: "Neutral grip (palms facing), curl to shoulder." },
  { id: "biceps_04", name: "Incline Dumbbell Curl", muscleGroup: "Biceps", equipment: "Dumbbell", instructions: "Set bench to 45°, arms hang, curl up for full stretch." },
  { id: "biceps_05", name: "Cable Curl", muscleGroup: "Biceps", equipment: "Cable", instructions: "Low cable, curl up, constant tension throughout." },
  { id: "biceps_06", name: "Preacher Curl", muscleGroup: "Biceps", equipment: "Barbell", instructions: "Rest arms on preacher pad, curl up with strict form." },
  { id: "biceps_07", name: "Concentration Curl", muscleGroup: "Biceps", equipment: "Dumbbell", instructions: "Seated, elbow on inner thigh, curl up and squeeze." },

  // TRICEPS
  { id: "triceps_01", name: "Close-Grip Bench Press", muscleGroup: "Triceps", equipment: "Barbell", instructions: "Narrow grip, lower to chest, press up focusing on triceps." },
  { id: "triceps_02", name: "Skull Crusher", muscleGroup: "Triceps", equipment: "Barbell", instructions: "Lie flat, lower bar to forehead by bending elbows, extend." },
  { id: "triceps_03", name: "Triceps Pushdown", muscleGroup: "Triceps", equipment: "Cable", instructions: "High cable, push down until arms extended, squeeze." },
  { id: "triceps_04", name: "Overhead Triceps Extension", muscleGroup: "Triceps", equipment: "Dumbbell", instructions: "Hold dumbbell overhead, lower behind head, extend." },
  { id: "triceps_05", name: "Triceps Dip", muscleGroup: "Triceps", equipment: "Bodyweight", instructions: "Parallel bars, upright torso, lower until 90° bend, press up." },
  { id: "triceps_06", name: "Diamond Push-Up", muscleGroup: "Triceps", equipment: "Bodyweight", instructions: "Form diamond with hands, push up." },

  // LEGS - QUADS
  { id: "quads_01", name: "Squat", muscleGroup: "Legs", equipment: "Barbell", instructions: "Bar on traps, feet shoulder-width, squat until thighs parallel, drive up." },
  { id: "quads_02", name: "Front Squat", muscleGroup: "Legs", equipment: "Barbell", instructions: "Bar on front delts, upright torso, squat deep." },
  { id: "quads_03", name: "Leg Press", muscleGroup: "Legs", equipment: "Machine", instructions: "Push platform away, lower until 90°, drive up." },
  { id: "quads_04", name: "Leg Extension", muscleGroup: "Legs", equipment: "Machine", instructions: "Seated, extend legs until straight, lower slowly." },
  { id: "quads_05", name: "Lunge", muscleGroup: "Legs", equipment: "Dumbbell", instructions: "Step forward, lower back knee toward floor, return." },
  { id: "quads_06", name: "Bulgarian Split Squat", muscleGroup: "Legs", equipment: "Dumbbell", instructions: "Rear foot elevated, lower front leg until thigh parallel." },
  { id: "quads_07", name: "Hack Squat", muscleGroup: "Legs", equipment: "Machine", instructions: "Feet shoulder-width on platform, lower until 90°." },

  // LEGS - HAMSTRINGS/GLUTES
  { id: "hams_01", name: "Romanian Deadlift (Dumbbell)", muscleGroup: "Hamstrings", equipment: "Dumbbell", instructions: "Hinge at hips, lower dumbbells, feel hamstring stretch." },
  { id: "hams_02", name: "Leg Curl", muscleGroup: "Hamstrings", equipment: "Machine", instructions: "Lie prone, curl heels to glutes, lower slowly." },
  { id: "hams_03", name: "Nordic Curl", muscleGroup: "Hamstrings", equipment: "Bodyweight", instructions: "Kneel, feet anchored, lower body forward resisting with hamstrings." },
  { id: "hams_04", name: "Hip Thrust", muscleGroup: "Glutes", equipment: "Barbell", instructions: "Shoulders on bench, drive hips up with barbell, squeeze glutes at top." },
  { id: "hams_05", name: "Glute Bridge", muscleGroup: "Glutes", equipment: "Bodyweight", instructions: "Lie on back, feet flat, drive hips up, squeeze glutes." },
  { id: "hams_06", name: "Cable Kickback", muscleGroup: "Glutes", equipment: "Cable", instructions: "Ankle strap, kick leg back and up, squeeze glute." },

  // CALVES
  { id: "calves_01", name: "Standing Calf Raise", muscleGroup: "Calves", equipment: "Machine", instructions: "Full range of motion, slow eccentric, squeeze at top." },
  { id: "calves_02", name: "Seated Calf Raise", muscleGroup: "Calves", equipment: "Machine", instructions: "Seated, raise heels, emphasizes soleus." },
  { id: "calves_03", name: "Donkey Calf Raise", muscleGroup: "Calves", equipment: "Bodyweight", instructions: "Bent forward, raise heels, full stretch at bottom." },

  // CORE
  { id: "core_01", name: "Plank", muscleGroup: "Core", equipment: "Bodyweight", instructions: "Hold straight body position on forearms, don't let hips drop." },
  { id: "core_02", name: "Crunch", muscleGroup: "Core", equipment: "Bodyweight", instructions: "Lie on back, curl shoulder blades off floor, squeeze abs." },
  { id: "core_03", name: "Hanging Leg Raise", muscleGroup: "Core", equipment: "Bodyweight", instructions: "Hang from bar, raise legs to parallel, control down." },
  { id: "core_04", name: "Cable Crunch", muscleGroup: "Core", equipment: "Cable", instructions: "Kneel, pull rope down by flexing abs, not pulling with arms." },
  { id: "core_05", name: "Ab Wheel Rollout", muscleGroup: "Core", equipment: "Bodyweight", instructions: "Roll out until body extended, pull back using abs." },
  { id: "core_06", name: "Russian Twist", muscleGroup: "Core", equipment: "Bodyweight", instructions: "Seated, lean back, rotate torso side to side." },
  { id: "core_07", name: "Side Plank", muscleGroup: "Core", equipment: "Bodyweight", instructions: "Side-lying on forearm, maintain straight body, targets obliques." },
  { id: "core_08", name: "Bicycle Crunch", muscleGroup: "Core", equipment: "Bodyweight", instructions: "Alternate elbow to opposite knee in cycling motion." },

  // CARDIO
  { id: "cardio_01", name: "Treadmill Run", muscleGroup: "Cardio", equipment: "Machine", instructions: "Set speed and incline, maintain steady pace." },
  { id: "cardio_02", name: "Rowing Machine", muscleGroup: "Cardio", equipment: "Machine", instructions: "Drive with legs first, then lean back, then pull arms." },
  { id: "cardio_03", name: "Jump Rope", muscleGroup: "Cardio", equipment: "Bodyweight", instructions: "Continuous jumping, stay on balls of feet." },
  { id: "cardio_04", name: "Stair Climber", muscleGroup: "Cardio", equipment: "Machine", instructions: "Steady pace, don't lean on handles." },
  { id: "cardio_05", name: "Assault Bike", muscleGroup: "Cardio", equipment: "Machine", instructions: "Simultaneous push-pull arms while cycling." },
  { id: "cardio_06", name: "Box Jump", muscleGroup: "Cardio", equipment: "Bodyweight", instructions: "Explosive jump onto box, step down, repeat." },
  { id: "cardio_07", name: "Burpee", muscleGroup: "Cardio", equipment: "Bodyweight", instructions: "Squat down, kick out to plank, push-up, jump up." },
];

export const MUSCLE_GROUPS = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Core",
  "Cardio",
];

export const MUSCLE_GROUP_COLORS: Record<string, string> = {
  Chest: "#FF4444",
  Back: "#FF6600",
  Shoulders: "#FFaa00",
  Biceps: "#44FF88",
  Triceps: "#00FFaa",
  Legs: "#4488FF",
  Hamstrings: "#8844FF",
  Glutes: "#FF44AA",
  Calves: "#44FFFF",
  Core: "#FF8844",
  Cardio: "#FFFF44",
};
