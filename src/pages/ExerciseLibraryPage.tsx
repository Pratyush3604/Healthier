import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Search, Filter, ChevronDown, ChevronUp, Star, Clock, Flame, Target, X, Zap, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type MuscleGroup = 'Chest' | 'Back' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Legs' | 'Core' | 'Glutes' | 'Forearms' | 'Calves' | 'Full Body' | 'Cardio' | 'Flexibility';
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type Equipment = 'None' | 'Dumbbells' | 'Barbell' | 'Machine' | 'Cable' | 'Resistance Band' | 'Kettlebell' | 'Pull-up Bar' | 'Bench' | 'Bodyweight';

interface Exercise {
  name: string;
  muscle: MuscleGroup;
  secondary?: string;
  difficulty: Difficulty;
  equipment: Equipment;
  sets: string;
  reps: string;
  restSec: number;
  calories: number;
  instructions: string[];
  tips: string[];
  emoji: string;
}

// ===== EXERCISE DATA =====
const exercises: Exercise[] = [
  // CHEST
  { name: 'Push-Up', muscle: 'Chest', secondary: 'Triceps, Shoulders', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3-4', reps: '10-20', restSec: 60, calories: 8, emoji: '💪', instructions: ['Start in plank with hands shoulder-width', 'Keep body straight head to heels', 'Lower chest to floor bending elbows', 'Push back up to start', 'Exhale up, inhale down'], tips: ['Keep core tight', 'Don\'t flare elbows wide', 'Scale with knee push-ups'] },
  { name: 'Bench Press', muscle: 'Chest', secondary: 'Triceps, Shoulders', difficulty: 'Intermediate', equipment: 'Barbell', sets: '4', reps: '8-12', restSec: 90, calories: 10, emoji: '🏋️', instructions: ['Lie on bench, eyes under bar', 'Grip wider than shoulder-width', 'Unrack, lower to mid-chest', 'Press to lockout', 'Feet flat on floor'], tips: ['Retract shoulder blades', 'Use spotter for heavy sets', 'Control the descent'] },
  { name: 'Incline Dumbbell Press', muscle: 'Chest', secondary: 'Shoulders', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3-4', reps: '10-12', restSec: 75, calories: 9, emoji: '📐', instructions: ['Bench at 30-45° incline', 'Dumbbells at chest, palms forward', 'Press up and slightly inward', 'Lower with control', 'Squeeze at top'], tips: ['Don\'t set too steep', 'Keep wrists straight', 'Full range of motion'] },
  { name: 'Dumbbell Fly', muscle: 'Chest', secondary: 'Shoulders', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '12-15', restSec: 60, calories: 7, emoji: '🦅', instructions: ['Lie flat, dumbbells above chest', 'Slight elbow bend throughout', 'Lower arms in wide arc', 'Feel deep chest stretch', 'Squeeze together at top'], tips: ['Lighter weight than presses', 'Don\'t go too deep', 'Focus on the squeeze'] },
  { name: 'Cable Crossover', muscle: 'Chest', secondary: 'Shoulders', difficulty: 'Intermediate', equipment: 'Cable', sets: '3', reps: '12-15', restSec: 60, calories: 7, emoji: '🔗', instructions: ['Pulleys at high position', 'Step forward for stability', 'Pull handles down and together', 'Squeeze chest at bottom', 'Return slowly'], tips: ['Slight elbow bend', 'Lean slightly forward', 'Control the negative'] },
  { name: 'Decline Push-Up', muscle: 'Chest', secondary: 'Shoulders, Core', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '10-15', restSec: 60, calories: 9, emoji: '⬇️', instructions: ['Feet on elevated surface', 'Hands shoulder-width on floor', 'Lower chest to floor', 'Push back up aligned', 'Core engaged'], tips: ['Higher = more upper chest', 'Start low, progress up', 'Don\'t let hips sag'] },
  { name: 'Chest Dip', muscle: 'Chest', secondary: 'Triceps, Shoulders', difficulty: 'Advanced', equipment: 'Bodyweight', sets: '3-4', reps: '8-12', restSec: 90, calories: 10, emoji: '🤸', instructions: ['Grip parallel bars', 'Lean forward ~30°', 'Lower to 90° elbows', 'Push to full extension', 'Shoulders down and back'], tips: ['Forward lean = more chest', 'Don\'t go too deep', 'Add weight belt when ready'] },
  { name: 'Landmine Press', muscle: 'Chest', secondary: 'Shoulders', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3', reps: '10-12', restSec: 75, calories: 8, emoji: '💣', instructions: ['Bar end in corner/landmine', 'Hold at chest height', 'Press up and forward', 'Lower with control', 'Alternate or both hands'], tips: ['Shoulder-friendly pressing', 'Heavy core engagement', 'Standing or kneeling'] },
  { name: 'Pec Deck Machine', muscle: 'Chest', difficulty: 'Beginner', equipment: 'Machine', sets: '3', reps: '12-15', restSec: 60, calories: 6, emoji: '🦾', instructions: ['Back flat against pad', 'Forearms on arm pads', 'Bring pads together', 'Squeeze 1 second', 'Return slowly'], tips: ['Don\'t go too far back', 'Squeeze chest not arms', 'Relax shoulders'] },
  { name: 'Diamond Push-Up', muscle: 'Chest', secondary: 'Triceps', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '8-15', restSec: 60, calories: 9, emoji: '💎', instructions: ['Diamond hand position', 'Push-up position', 'Lower chest to hands', 'Push up squeezing triceps', 'Elbows close to body'], tips: ['Harder than regular', 'Great inner chest + triceps', 'Modify on knees'] },
  { name: 'Svend Press', muscle: 'Chest', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '🔘', instructions: ['Hold plate between palms at chest', 'Press straight out', 'Squeeze palms hard throughout', 'Bring back to chest', 'Feel contraction'], tips: ['Light weight — about the squeeze', 'Great finisher', 'Constant tension'] },
  { name: 'Floor Press', muscle: 'Chest', secondary: 'Triceps', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '4', reps: '8-12', restSec: 75, calories: 8, emoji: '🏠', instructions: ['Lie on floor, knees bent', 'Dumbbells above chest', 'Lower until triceps touch floor', 'Pause then press up', 'Great lockout strength'], tips: ['Less shoulder stress', 'Eliminates stretch reflex', 'Good home alternative'] },

  // BACK
  { name: 'Pull-Up', muscle: 'Back', secondary: 'Biceps', difficulty: 'Intermediate', equipment: 'Pull-up Bar', sets: '3-4', reps: '6-12', restSec: 90, calories: 10, emoji: '🧗', instructions: ['Grip wider than shoulders, palms away', 'Hang fully extended', 'Pull chin over bar', 'Lower slowly', 'No swinging'], tips: ['Use bands if needed', 'Pull elbows down not hands', 'Squeeze lats at top'] },
  { name: 'Bent-Over Row', muscle: 'Back', secondary: 'Biceps, Core', difficulty: 'Intermediate', equipment: 'Barbell', sets: '4', reps: '8-12', restSec: 90, calories: 10, emoji: '🚣', instructions: ['Hinge at hips, slight knee bend', 'Grip shoulder-width', 'Pull to lower chest', 'Squeeze shoulder blades', 'Lower with control'], tips: ['Keep back flat', '45° torso angle', 'No momentum'] },
  { name: 'Lat Pulldown', muscle: 'Back', secondary: 'Biceps', difficulty: 'Beginner', equipment: 'Cable', sets: '3-4', reps: '10-12', restSec: 75, calories: 8, emoji: '⬇️', instructions: ['Thighs under pads', 'Wide overhand grip', 'Pull to upper chest', 'Lean back slightly', 'Return slowly'], tips: ['Never behind neck', 'Focus on lats', 'Full extension at top'] },
  { name: 'Single-Arm DB Row', muscle: 'Back', secondary: 'Biceps', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '10-12 each', restSec: 60, calories: 8, emoji: '💪', instructions: ['Knee and hand on bench', 'DB in opposite hand hanging', 'Pull to hip level', 'Squeeze lat at top', 'Lower controlled'], tips: ['Torso parallel to floor', 'Don\'t rotate trunk', 'Full ROM'] },
  { name: 'Seated Cable Row', muscle: 'Back', secondary: 'Biceps', difficulty: 'Beginner', equipment: 'Cable', sets: '3', reps: '10-12', restSec: 60, calories: 7, emoji: '🪝', instructions: ['Feet on plates', 'V-bar or close grip', 'Pull to abdomen', 'Squeeze blades', 'Full extension'], tips: ['Chest tall', 'Don\'t lean back much', 'Pause at contraction'] },
  { name: 'Deadlift', muscle: 'Back', secondary: 'Legs, Core, Glutes', difficulty: 'Advanced', equipment: 'Barbell', sets: '3-5', reps: '3-6', restSec: 120, calories: 15, emoji: '🔥', instructions: ['Feet hip-width, bar over mid-foot', 'Grip just outside knees', 'Chest up, back flat', 'Drive through heels', 'Stand tall, reverse'], tips: ['Never round back', 'Bar stays close', 'Start light, perfect form'] },
  { name: 'T-Bar Row', muscle: 'Back', secondary: 'Biceps', difficulty: 'Intermediate', equipment: 'Barbell', sets: '4', reps: '8-12', restSec: 90, calories: 10, emoji: '🔩', instructions: ['Straddle T-bar', 'Grip handles', 'Hinge, back flat', 'Pull to chest', 'Lower controlled'], tips: ['Builds back thickness', 'Core braced', 'No jerking'] },
  { name: 'Face Pull', muscle: 'Back', secondary: 'Shoulders', difficulty: 'Beginner', equipment: 'Cable', sets: '3', reps: '15-20', restSec: 45, calories: 5, emoji: '🎯', instructions: ['Cable at face height', 'Rope attachment', 'Pull toward face, separate hands', 'Squeeze rear delts', 'Return slowly'], tips: ['Essential for shoulder health', 'Elbows high', 'Light weight'] },
  { name: 'Chin-Up', muscle: 'Back', secondary: 'Biceps', difficulty: 'Intermediate', equipment: 'Pull-up Bar', sets: '3', reps: '6-10', restSec: 90, calories: 10, emoji: '🔝', instructions: ['Shoulder-width, palms facing you', 'Full extension hang', 'Pull chin over bar', 'Lower controlled', 'No swinging'], tips: ['More bicep than pull-ups', 'Great arm builder', 'Bands for assist'] },
  { name: 'Inverted Row', muscle: 'Back', secondary: 'Biceps, Core', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '10-15', restSec: 60, calories: 7, emoji: '🔄', instructions: ['Bar at waist height', 'Hang under, heels on floor', 'Pull chest to bar', 'Squeeze blades', 'Lower controlled'], tips: ['Pull-up progression', 'Feet further = harder', 'Plank body line'] },
  { name: 'Straight-Arm Pulldown', muscle: 'Back', difficulty: 'Beginner', equipment: 'Cable', sets: '3', reps: '12-15', restSec: 45, calories: 6, emoji: '📏', instructions: ['Stand facing cable, bar at top', 'Straight arms grip', 'Pull bar to thighs in arc', 'Squeeze lats hard', 'Return overhead'], tips: ['Arms nearly straight', 'Lean slightly forward', 'Great lat isolation'] },
  { name: 'Superman Hold', muscle: 'Back', secondary: 'Glutes', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '10-15', restSec: 45, calories: 5, emoji: '🦸', instructions: ['Lie face down', 'Arms overhead', 'Lift arms, chest, legs off floor', 'Hold 2-3 seconds', 'Lower controlled'], tips: ['Look at floor, don\'t extend neck', 'Great lower back', 'Hold for time option'] },

  // SHOULDERS
  { name: 'Overhead Press', muscle: 'Shoulders', secondary: 'Triceps', difficulty: 'Intermediate', equipment: 'Barbell', sets: '4', reps: '6-10', restSec: 90, calories: 9, emoji: '⬆️', instructions: ['Bar at shoulder height', 'Slightly wider grip', 'Press overhead to lockout', 'Head through as bar passes', 'Lower to shoulders'], tips: ['Brace core', 'Don\'t lean back', 'Full lockout'] },
  { name: 'Lateral Raise', muscle: 'Shoulders', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3-4', reps: '12-15', restSec: 45, calories: 6, emoji: '🦅', instructions: ['DBs at sides', 'Raise to parallel', 'Slight elbow bend', 'Lower slowly', 'Lead with elbows'], tips: ['Light weight', 'No swing/momentum', 'Pour water at top'] },
  { name: 'Front Raise', muscle: 'Shoulders', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '🙋', instructions: ['DBs in front of thighs', 'Raise to shoulder height', 'Slight elbow bend', 'Lower controlled', 'Alternate or together'], tips: ['Not above shoulders', 'Core braced', 'Light weight'] },
  { name: 'Arnold Press', muscle: 'Shoulders', secondary: 'Triceps', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '10-12', restSec: 75, calories: 8, emoji: '💪', instructions: ['DBs at chest, palms facing you', 'Press up rotating palms forward', 'Full lockout', 'Reverse rotation down', 'Smooth motion'], tips: ['Invented by Arnold', 'Hits all 3 delt heads', 'Don\'t rush rotation'] },
  { name: 'Reverse Fly', muscle: 'Shoulders', secondary: 'Back', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '🦋', instructions: ['Bend forward holding DBs', 'Raise to sides squeezing rear delts', 'Pause at top', 'Lower slowly', 'Slight elbow bend'], tips: ['Focus on rear delt squeeze', 'Great for posture', 'Use light weight'] },
  { name: 'Upright Row', muscle: 'Shoulders', secondary: 'Biceps', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3', reps: '10-12', restSec: 60, calories: 7, emoji: '🔼', instructions: ['Narrow grip, bar at thighs', 'Pull straight up to chin', 'Elbows above bar', 'Lower controlled', 'Lead with elbows'], tips: ['Wider grip easier on shoulders', 'Not above chin', 'Sub lateral raises if pain'] },
  { name: 'DB Shoulder Press', muscle: 'Shoulders', secondary: 'Triceps', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3-4', reps: '8-12', restSec: 75, calories: 8, emoji: '🔝', instructions: ['DBs at shoulder height', 'Press overhead', 'Touch at top', 'Lower to shoulders', 'Core engaged'], tips: ['More natural ROM', 'Seated reduces cheating', 'Don\'t lock aggressively'] },
  { name: 'Pike Push-Up', muscle: 'Shoulders', secondary: 'Triceps', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '8-12', restSec: 60, calories: 8, emoji: '🔺', instructions: ['Downward dog position', 'Hands shoulder-width', 'Lower head toward floor', 'Push back up', 'Hips stay high'], tips: ['Handstand push-up progression', 'Elevate feet for harder', 'Head between hands'] },
  { name: 'Cable Lateral Raise', muscle: 'Shoulders', difficulty: 'Beginner', equipment: 'Cable', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '🔗', instructions: ['Sideways to low pulley', 'Far hand grabs handle', 'Raise to shoulder height', 'Lower controlled', 'Switch sides'], tips: ['Constant tension', 'Better than DBs for resistance curve', 'Great development'] },
  { name: 'Handstand Push-Up', muscle: 'Shoulders', secondary: 'Triceps, Core', difficulty: 'Advanced', equipment: 'Bodyweight', sets: '3', reps: '3-8', restSec: 120, calories: 12, emoji: '🤸', instructions: ['Kick into wall handstand', 'Hands shoulder-width', 'Lower head to floor', 'Push to lockout', 'Core extremely tight'], tips: ['Master pikes first', 'Wall for balance', 'Pillow under head'] },

  // BICEPS
  { name: 'Barbell Curl', muscle: 'Biceps', difficulty: 'Beginner', equipment: 'Barbell', sets: '3', reps: '10-12', restSec: 60, calories: 6, emoji: '💪', instructions: ['Underhand grip', 'Elbows pinned to sides', 'Curl to shoulders', 'Squeeze at top', 'Lower slowly'], tips: ['No body swing', 'Straight wrists', 'EZ-bar for comfort'] },
  { name: 'Hammer Curl', muscle: 'Biceps', secondary: 'Forearms', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '10-12', restSec: 60, calories: 6, emoji: '🔨', instructions: ['Neutral grip (palms facing)', 'Curl up keeping neutral', 'Squeeze at top', 'Lower controlled', 'Alternate or together'], tips: ['Targets brachialis too', 'Elbows stationary', 'Great arm thickness'] },
  { name: 'Incline DB Curl', muscle: 'Biceps', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '10-12', restSec: 60, calories: 6, emoji: '📐', instructions: ['45° incline bench', 'Arms hang straight', 'Curl up, upper arms still', 'Squeeze at top', 'Full stretch at bottom'], tips: ['Amazing long head stretch', 'Strict form', 'Lighter than standing'] },
  { name: 'Concentration Curl', muscle: 'Biceps', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '🧘', instructions: ['Sit, lean forward', 'Elbow against inner thigh', 'Curl squeezing hard', 'Hold peak 1-2s', 'Lower slowly'], tips: ['Complete isolation', 'Perfect peak contraction', 'Don\'t rush'] },
  { name: 'Cable Curl', muscle: 'Biceps', difficulty: 'Beginner', equipment: 'Cable', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '🔗', instructions: ['Bar on low cable', 'Stand upright, underhand grip', 'Curl keeping elbows still', 'Squeeze at top', 'Lower controlled'], tips: ['Constant tension', 'Great finisher', 'Try different attachments'] },
  { name: 'Preacher Curl', muscle: 'Biceps', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3', reps: '10-12', restSec: 60, calories: 6, emoji: '🛐', instructions: ['Upper arms on preacher pad', 'EZ-bar underhand', 'Curl to shoulders', 'Full extension down', 'No bouncing'], tips: ['Eliminates cheating', 'Great for peak', 'Don\'t hyperextend'] },
  { name: 'Spider Curl', muscle: 'Biceps', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '10-12', restSec: 60, calories: 6, emoji: '🕷️', instructions: ['Chest against incline bench', 'Arms hang straight', 'Curl squeezing', 'Lower fully', 'Arms perpendicular'], tips: ['Extreme peak contraction', 'No momentum possible', 'Lighter weight'] },
  { name: 'Zottman Curl', muscle: 'Biceps', secondary: 'Forearms', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '10-12', restSec: 60, calories: 6, emoji: '🔄', instructions: ['Curl up palms up', 'Rotate palms down at top', 'Lower slowly palms down', 'Rotate back at bottom', 'Repeat'], tips: ['Trains both biceps + forearms', 'Negative targets forearms', 'Moderate weight'] },

  // TRICEPS
  { name: 'Tricep Dip', muscle: 'Triceps', secondary: 'Chest, Shoulders', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '8-12', restSec: 75, calories: 9, emoji: '⬇️', instructions: ['Parallel bars, lift body', 'Stay upright', 'Lower to 90° elbows', 'Push to lockout', 'Shoulders down'], tips: ['Upright = more triceps', 'Don\'t go too deep', 'Add weight when easy'] },
  { name: 'Skull Crusher', muscle: 'Triceps', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3', reps: '10-12', restSec: 60, calories: 7, emoji: '💀', instructions: ['Lie on bench, EZ-bar overhead', 'Upper arms vertical', 'Lower to forehead', 'Extend to start', 'Elbows in'], tips: ['EZ-bar for wrists', 'Behind head for more stretch', 'Control descent'] },
  { name: 'Tricep Pushdown', muscle: 'Triceps', difficulty: 'Beginner', equipment: 'Cable', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '⬇️', instructions: ['Bar/rope on high cable', 'Elbows at sides', 'Push to full extension', 'Squeeze triceps', 'Return to 90°'], tips: ['Elbows pinned', 'Don\'t lean forward', 'Rope allows more squeeze'] },
  { name: 'Overhead Tricep Extension', muscle: 'Triceps', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '10-12', restSec: 60, calories: 6, emoji: '🔝', instructions: ['DB with both hands overhead', 'Lower behind head', 'Upper arms near ears', 'Extend up', 'Squeeze at top'], tips: ['Great long head stretch', 'Core braced', 'Cable works too'] },
  { name: 'Close-Grip Bench', muscle: 'Triceps', secondary: 'Chest', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3-4', reps: '8-10', restSec: 75, calories: 9, emoji: '🏋️', instructions: ['Shoulder-width grip', 'Lower to lower chest', 'Elbows close to body', 'Press to lockout', 'Focus on triceps'], tips: ['Don\'t go too narrow', 'Shoulder-width is fine', 'Touch lower chest'] },
  { name: 'Kickback', muscle: 'Triceps', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '🦵', instructions: ['Bend forward, upper arm parallel', 'Extend forearm back', 'Squeeze at full extension', 'Lower slowly', 'Upper arm still'], tips: ['Light weight, focus contraction', 'Don\'t swing', 'Peak contraction exercise'] },
  { name: 'Bench Dip', muscle: 'Triceps', difficulty: 'Beginner', equipment: 'Bench', sets: '3', reps: '12-15', restSec: 60, calories: 7, emoji: '🪑', instructions: ['Hands on bench edge behind', 'Legs extended', 'Lower bending to 90°', 'Push back up', 'Back close to bench'], tips: ['Bend knees = easier', 'Don\'t go too deep', 'Shoulders down'] },
  { name: 'Diamond Push-Up (Tri)', muscle: 'Triceps', secondary: 'Chest', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '8-12', restSec: 60, calories: 8, emoji: '💎', instructions: ['Diamond hands under chest', 'Push-up, elbows close', 'Lower to hands', 'Push up focusing triceps', 'Full lockout'], tips: ['Best bodyweight tricep move', 'Harder than regular', 'Great for home'] },

  // LEGS
  { name: 'Barbell Squat', muscle: 'Legs', secondary: 'Core, Glutes', difficulty: 'Intermediate', equipment: 'Barbell', sets: '4', reps: '6-10', restSec: 120, calories: 15, emoji: '🏋️', instructions: ['Bar on upper traps', 'Feet shoulder-width, toes out', 'Sit back and down', 'Thighs parallel or below', 'Drive through heels'], tips: ['King of exercises', 'Chest up, core braced', 'Knees track over toes'] },
  { name: 'Leg Press', muscle: 'Legs', secondary: 'Glutes', difficulty: 'Beginner', equipment: 'Machine', sets: '4', reps: '10-15', restSec: 90, calories: 10, emoji: '🦵', instructions: ['Feet shoulder-width on platform', 'Release safety', 'Bend to 90°', 'Press away', 'Don\'t lock fully'], tips: ['Foot position changes emphasis', 'High/wide = more glutes', 'Don\'t round lower back'] },
  { name: 'Romanian Deadlift', muscle: 'Legs', secondary: 'Back, Glutes', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3-4', reps: '8-12', restSec: 90, calories: 10, emoji: '🇷🇴', instructions: ['Bar at hips, feet hip-width', 'Slight knee bend', 'Hinge pushing butt back', 'Lower along legs', 'Drive hips forward'], tips: ['Bar stays close', 'Feel hamstring stretch', 'Don\'t round back'] },
  { name: 'Lunges', muscle: 'Legs', secondary: 'Glutes, Core', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '12 each', restSec: 60, calories: 8, emoji: '🚶', instructions: ['Stand feet together', 'Step forward', 'Lower back knee to floor', 'Both knees at 90°', 'Push back, alternate'], tips: ['Torso upright', 'Front knee over toes', 'Add DBs to progress'] },
  { name: 'Leg Extension', muscle: 'Legs', difficulty: 'Beginner', equipment: 'Machine', sets: '3', reps: '12-15', restSec: 45, calories: 6, emoji: '🦿', instructions: ['Ankle pad on shins', 'Extend legs straight', 'Squeeze quads hard', 'Hold 1 second', 'Lower controlled'], tips: ['No momentum', 'Great quad isolation', 'Pause at top'] },
  { name: 'Leg Curl', muscle: 'Legs', difficulty: 'Beginner', equipment: 'Machine', sets: '3', reps: '12-15', restSec: 45, calories: 6, emoji: '🔄', instructions: ['Face down, pad behind ankles', 'Curl toward glutes', 'Squeeze hamstrings', 'Lower controlled', 'Full ROM'], tips: ['Don\'t lift hips', 'Full range', 'Great ham isolation'] },
  { name: 'Bulgarian Split Squat', muscle: 'Legs', secondary: 'Glutes', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '10-12 each', restSec: 75, calories: 9, emoji: '🇧🇬', instructions: ['Rear foot on bench', 'DBs at sides', 'Lower back knee to floor', 'Front knee to 90°', 'Push through front heel'], tips: ['Amazing single-leg', 'Fixes imbalances', 'Lean forward = more quad'] },
  { name: 'Wall Sit', muscle: 'Legs', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '30-60s', restSec: 60, calories: 5, emoji: '🧱', instructions: ['Lean against wall', 'Slide to parallel thighs', 'Knees at 90°', 'Hold position', 'Back flat on wall'], tips: ['Endurance exercise', 'Add weight for harder', 'Breathe normally'] },
  { name: 'Goblet Squat', muscle: 'Legs', secondary: 'Core', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '12-15', restSec: 60, calories: 8, emoji: '🏆', instructions: ['DB vertical at chest', 'Shoulder-width, toes out', 'Squat deep', 'Weight at chest', 'Stand up'], tips: ['Learn squat form', 'Weight counterbalances', 'Elbows between knees'] },
  { name: 'Step-Up', muscle: 'Legs', secondary: 'Glutes', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '10-12 each', restSec: 60, calories: 7, emoji: '🪜', instructions: ['Face bench/box', 'Step up with one foot', 'Stand fully on top', 'Step back down', 'Alternate legs'], tips: ['Higher = more glutes', 'Drive through heel', 'Add DBs to progress'] },
  { name: 'Calf Raise', muscle: 'Calves', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '4', reps: '15-20', restSec: 45, calories: 4, emoji: '🦶', instructions: ['Stand on step edge', 'Rise on toes high', 'Hold 1-2 seconds', 'Lower heels below step', 'Repeat'], tips: ['High reps work best', 'Straight + bent knee versions', 'Pause top and bottom'] },
  { name: 'Hip Thrust', muscle: 'Glutes', secondary: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3-4', reps: '10-12', restSec: 75, calories: 9, emoji: '🍑', instructions: ['Upper back against bench', 'Bar over hips with pad', 'Drive hips up', 'Squeeze glutes at top', 'Lower controlled'], tips: ['Best glute exercise', 'Shoulder-width feet', 'Don\'t hyperextend'] },

  // CORE
  { name: 'Plank', muscle: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '30-60s', restSec: 45, calories: 5, emoji: '🧘', instructions: ['Forearms + toes on floor', 'Straight line head to heels', 'Pull belly button to spine', 'Don\'t sag or pike', 'Breathe normally'], tips: ['Quality > duration', 'Squeeze everything', 'Build up gradually'] },
  { name: 'Bicycle Crunch', muscle: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '20 each', restSec: 45, calories: 6, emoji: '🚲', instructions: ['Lie back, hands behind head', 'Shoulders off floor', 'Elbow to opposite knee', 'Alternate pedaling', 'Don\'t pull neck'], tips: ['Slow > fast', 'Really twist obliques', 'Lower back pressed down'] },
  { name: 'Russian Twist', muscle: 'Core', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '20 total', restSec: 45, calories: 6, emoji: '🇷🇺', instructions: ['Sit, lean back slightly', 'Feet off floor or planted', 'Rotate torso side to side', 'Touch floor each side', 'Chest up'], tips: ['Add weight for harder', 'Control rotation', 'Great obliques'] },
  { name: 'Hanging Leg Raise', muscle: 'Core', difficulty: 'Advanced', equipment: 'Pull-up Bar', sets: '3', reps: '8-12', restSec: 60, calories: 8, emoji: '🦵', instructions: ['Hang fully extended', 'Straight legs or bent', 'Raise to parallel or above', 'Lower slowly', 'No swinging'], tips: ['One of the best', 'Bent knees = beginner', 'Curl pelvis up'] },
  { name: 'Dead Bug', muscle: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '10 each', restSec: 45, calories: 5, emoji: '🪲', instructions: ['Back on floor, arms to ceiling', 'Knees 90°, shins parallel', 'Extend opposite arm + leg', 'Keep back pressed down', 'Return, other side'], tips: ['Excellent stability', 'If back lifts, reduce ROM', 'Exhale as you extend'] },
  { name: 'Mountain Climber', muscle: 'Core', secondary: 'Cardio', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '30s', restSec: 45, calories: 10, emoji: '⛰️', instructions: ['Push-up position', 'Drive knee to chest', 'Quickly switch legs', 'Hips low, core tight', 'Fast pace'], tips: ['Cardio + core', 'Don\'t bounce hips', 'Scale speed'] },
  { name: 'Ab Rollout', muscle: 'Core', difficulty: 'Advanced', equipment: 'Bodyweight', sets: '3', reps: '8-12', restSec: 60, calories: 8, emoji: '🛞', instructions: ['Kneel with ab wheel/barbell', 'Roll forward extending', 'Go as far as you can', 'Pull back using abs', 'Core tight throughout'], tips: ['Extremely effective', 'Don\'t let back sag', 'Start small ROM'] },
  { name: 'Pallof Press', muscle: 'Core', difficulty: 'Intermediate', equipment: 'Cable', sets: '3', reps: '10-12 each', restSec: 45, calories: 5, emoji: '🎯', instructions: ['Sideways to cable at chest height', 'Hold handle at chest', 'Press straight out', 'Resist rotation', 'Return to chest'], tips: ['Anti-rotation training', 'Great for sports', 'Hips + shoulders square'] },
  { name: 'Side Plank', muscle: 'Core', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '30-45s each', restSec: 45, calories: 5, emoji: '↗️', instructions: ['Side, forearm on floor', 'Stack or stagger feet', 'Lift hips straight line', 'Hold', 'Don\'t drop hips'], tips: ['Obliques + hip stability', 'Add hip dips for harder', 'Top hip over bottom'] },
  { name: 'V-Up', muscle: 'Core', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '12-15', restSec: 45, calories: 7, emoji: '✌️', instructions: ['Flat on back, arms overhead', 'Lift legs + torso together', 'Reach hands to feet', 'Balance on sit bones', 'Lower controlled'], tips: ['Straight legs if possible', 'Bend knees = easier', 'No momentum'] },

  // GLUTES
  { name: 'Glute Bridge', muscle: 'Glutes', secondary: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '15-20', restSec: 45, calories: 5, emoji: '🌉', instructions: ['Back on floor, knees bent', 'Drive hips up squeezing', 'Straight line knees to shoulders', 'Hold 2 seconds', 'Lower slowly'], tips: ['Great activation', 'Single-leg for harder', 'Don\'t hyperextend'] },
  { name: 'Sumo Deadlift', muscle: 'Glutes', secondary: 'Legs, Back', difficulty: 'Advanced', equipment: 'Barbell', sets: '4', reps: '6-8', restSec: 120, calories: 14, emoji: '🏋️', instructions: ['Wide stance, toes 45°', 'Grip between legs', 'Knees out over toes', 'Extend hips and knees', 'Lock out at top'], tips: ['More glute + inner thigh', 'Chest up', 'Push floor apart'] },
  { name: 'Cable Pull-Through', muscle: 'Glutes', secondary: 'Legs', difficulty: 'Beginner', equipment: 'Cable', sets: '3', reps: '12-15', restSec: 60, calories: 6, emoji: '🔗', instructions: ['Away from low cable, rope between legs', 'Hinge at hips', 'Feel hamstring stretch', 'Drive hips forward', 'Stand tall'], tips: ['Hip hinge learning tool', 'Arms straight', 'Squeeze at lockout'] },
  { name: 'Donkey Kick', muscle: 'Glutes', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '15 each', restSec: 45, calories: 5, emoji: '🫏', instructions: ['Hands and knees', 'Knee bent 90°', 'Lift leg, foot to ceiling', 'Squeeze glute at top', 'Lower repeat'], tips: ['Don\'t arch back', 'Hips square', 'Add ankle weight'] },
  { name: 'Fire Hydrant', muscle: 'Glutes', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '15 each', restSec: 45, calories: 5, emoji: '🚒', instructions: ['Hands and knees', 'Knee bent 90°', 'Lift leg to side', 'Thigh parallel to floor', 'Lower repeat'], tips: ['Outer glutes', 'Hip stability', 'Core engaged'] },
  { name: 'Frog Pump', muscle: 'Glutes', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '20-30', restSec: 45, calories: 5, emoji: '🐸', instructions: ['Back on floor, soles together, knees out', 'Drive hips up', 'Removes hamstring involvement', 'Pulse at top', 'Lower repeat'], tips: ['Incredible isolation', 'No equipment needed', 'Great warm-up'] },

  // FOREARMS
  { name: 'Wrist Curl', muscle: 'Forearms', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '15-20', restSec: 45, calories: 3, emoji: '🤲', instructions: ['Forearms on thighs, wrists over knees', 'Palms up with DBs', 'Curl wrists up', 'Lower slowly', 'Full ROM'], tips: ['Light weight', 'Both palms-up and down', 'High reps best'] },
  { name: 'Reverse Wrist Curl', muscle: 'Forearms', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '15-20', restSec: 45, calories: 3, emoji: '🔄', instructions: ['Same position, palms down', 'Extend wrists up', 'Lower slowly', 'Feel top of forearm', 'Full ROM'], tips: ['Targets extensors', 'Prevents imbalances', 'Lighter than regular'] },
  { name: 'Farmer\'s Walk', muscle: 'Forearms', secondary: 'Core, Full Body', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '30-60s', restSec: 60, calories: 8, emoji: '🚶', instructions: ['Hold heavy DBs at sides', 'Tall posture, core tight', 'Walk controlled steps', 'Maintain grip', 'Set down carefully'], tips: ['Amazing grip + conditioning', 'Go as heavy as possible', 'Shoulders packed down'] },
  { name: 'Dead Hang', muscle: 'Forearms', secondary: 'Back', difficulty: 'Beginner', equipment: 'Pull-up Bar', sets: '3', reps: '20-60s', restSec: 60, calories: 3, emoji: '🦥', instructions: ['Overhand grip on bar', 'Hang fully extended', 'Shoulders engaged', 'Hold as long as possible', 'Step down safely'], tips: ['Grip strength + spine decompression', 'Shoulder health', 'Increase hang time'] },

  // CARDIO
  { name: 'Jumping Jacks', muscle: 'Cardio', secondary: 'Full Body', difficulty: 'Beginner', equipment: 'None', sets: '3', reps: '30s', restSec: 30, calories: 10, emoji: '⭐', instructions: ['Feet together, arms at sides', 'Jump feet wide, arms overhead', 'Jump back to start', 'Maintain rhythm', 'Land softly'], tips: ['Great warm-up', 'Step out for low impact', 'Steady pace'] },
  { name: 'Burpee', muscle: 'Cardio', secondary: 'Full Body', difficulty: 'Intermediate', equipment: 'None', sets: '3', reps: '10-15', restSec: 60, calories: 15, emoji: '🔥', instructions: ['Squat, hands on floor', 'Jump to plank', 'Push-up optional', 'Jump feet to hands', 'Jump up arms overhead'], tips: ['Ultimate conditioning', 'Step back to modify', 'Form > speed'] },
  { name: 'High Knees', muscle: 'Cardio', secondary: 'Core', difficulty: 'Beginner', equipment: 'None', sets: '3', reps: '30s', restSec: 30, calories: 12, emoji: '🦵', instructions: ['Stand in place', 'Drive knee to hip height', 'Quickly alternate', 'Pump arms', 'Balls of feet'], tips: ['Warm-up or HIIT', 'Core engaged', 'Speed focus'] },
  { name: 'Box Jump', muscle: 'Cardio', secondary: 'Legs', difficulty: 'Intermediate', equipment: 'None', sets: '3', reps: '8-12', restSec: 60, calories: 10, emoji: '📦', instructions: ['Face sturdy box', 'Swing arms, jump up', 'Land softly both feet', 'Stand on top', 'Step down'], tips: ['Start low', 'Soft landings', 'Step down to protect joints'] },
  { name: 'Jump Rope', muscle: 'Cardio', secondary: 'Calves', difficulty: 'Beginner', equipment: 'None', sets: '3', reps: '60s', restSec: 45, calories: 14, emoji: '🪢', instructions: ['Handles at hips', 'Swing overhead, jump under', 'Just high enough to clear', 'Balls of feet', 'Elbows close'], tips: ['One of the best cardio', 'Great coordination', 'Calf endurance'] },
  { name: 'Sprint Intervals', muscle: 'Cardio', secondary: 'Legs', difficulty: 'Advanced', equipment: 'None', sets: '6-10', reps: '20-30s', restSec: 60, calories: 20, emoji: '🏃', instructions: ['Warm up thoroughly', 'Sprint 90-100% effort', 'Walk/jog 60s rest', 'Repeat', 'Cool down walking'], tips: ['Most efficient fat burning', 'Always warm up', 'Build up rounds'] },
  { name: 'Bear Crawl', muscle: 'Cardio', secondary: 'Core, Shoulders', difficulty: 'Intermediate', equipment: 'None', sets: '3', reps: '30s', restSec: 45, calories: 10, emoji: '🐻', instructions: ['Hands and knees', 'Lift knees slightly', 'Move opposite hand + foot', 'Hips low and stable', 'Crawl forward'], tips: ['Core + coordination', 'Knees close to ground', 'Try backwards'] },
  { name: 'Skater Jumps', muscle: 'Cardio', secondary: 'Legs, Glutes', difficulty: 'Intermediate', equipment: 'None', sets: '3', reps: '20 total', restSec: 45, calories: 10, emoji: '⛸️', instructions: ['Stand on one leg', 'Jump laterally', 'Land on outside leg', 'Touch floor opposite hand', 'Jump back'], tips: ['Lateral stability', 'Soft landing', 'Speed skating motion'] },

  // FLEXIBILITY
  { name: 'Downward Dog', muscle: 'Flexibility', secondary: 'Shoulders, Calves', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '30-60s', restSec: 15, calories: 3, emoji: '🐕', instructions: ['Hands and knees', 'Push hips up and back', 'Inverted V shape', 'Heels toward floor', 'Relax head'], tips: ['Foundational yoga pose', 'Pedal feet to warm up', 'Don\'t force heels'] },
  { name: 'Pigeon Pose', muscle: 'Flexibility', secondary: 'Glutes', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '30-60s each', restSec: 15, calories: 2, emoji: '🐦', instructions: ['Right knee behind right wrist', 'Left leg straight back', 'Hips square', 'Walk hands forward', 'Switch sides'], tips: ['Amazing hip opener', 'Pillow under hip', 'Don\'t force it'] },
  { name: 'Cat-Cow Stretch', muscle: 'Flexibility', secondary: 'Core, Back', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '10 cycles', restSec: 15, calories: 2, emoji: '🐱', instructions: ['Hands and knees', 'Cow: belly down, look up', 'Cat: round back, chin tuck', 'Flow with breath', 'Inhale cow, exhale cat'], tips: ['Great spinal mobility', 'Perfect warm-up', 'Move with breath'] },
  { name: 'World\'s Greatest Stretch', muscle: 'Flexibility', secondary: 'Full Body', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '5 each side', restSec: 15, calories: 3, emoji: '🌍', instructions: ['Deep lunge', 'Inside hand on floor', 'Rotate, reach outside arm up', 'Hold and feel stretch', 'Switch sides'], tips: ['Opens everything', 'Best single mobility drill', 'Do before every workout'] },
  { name: 'Hip Flexor Stretch', muscle: 'Flexibility', secondary: 'Legs', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '30-45s each', restSec: 15, calories: 2, emoji: '🦵', instructions: ['Kneel in lunge', 'Push hips forward', 'Feel front of back hip stretch', 'Torso upright', 'Switch sides'], tips: ['Essential for desk workers', 'Squeeze back glute deeper', 'Arm overhead for more'] },
  { name: 'Hamstring Stretch', muscle: 'Flexibility', secondary: 'Back', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '30-45s each', restSec: 15, calories: 2, emoji: '🧘', instructions: ['Sit, one leg extended', 'Other foot against inner thigh', 'Reach toward foot', 'Hinge at hips', 'Feel back of thigh'], tips: ['Don\'t bounce', 'Flex foot deeper stretch', 'Breathe and relax'] },
  { name: 'Thoracic Rotation', muscle: 'Flexibility', secondary: 'Core', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '10 each', restSec: 15, calories: 2, emoji: '🔄', instructions: ['Lie on side, knees bent 90°', 'Stack knees', 'Rotate top arm to other side', 'Follow with eyes', 'Return repeat'], tips: ['Upper back mobility', 'Knees stay stacked', 'Breathe out rotating'] },
  { name: 'Child\'s Pose', muscle: 'Flexibility', secondary: 'Back', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '30-60s', restSec: 15, calories: 2, emoji: '🧒', instructions: ['Kneel, big toes together', 'Sit back on heels', 'Walk hands forward', 'Forehead on floor', 'Arms extended or alongside'], tips: ['Rest and recovery pose', 'Lower back relief', 'Widen knees for hips'] },
  { name: 'Foam Roll IT Band', muscle: 'Flexibility', secondary: 'Legs', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '60s each', restSec: 15, calories: 2, emoji: '🧻', instructions: ['Side on foam roller, outer thigh', 'Support with arms + foot', 'Roll hip to above knee', 'Pause on tender spots', 'Switch sides'], tips: ['Uncomfortable is normal', 'Not on joints', 'Essential for runners'] },
  { name: 'Neck Stretch', muscle: 'Flexibility', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '20s each', restSec: 10, calories: 1, emoji: '🦒', instructions: ['Sit or stand tall', 'Tilt ear to shoulder', 'Gentle hand pressure', 'Hold', 'Repeat other side + chin tuck'], tips: ['Be very gentle', 'Never force or bounce', 'Essential for desk workers'] },

  // FULL BODY
  { name: 'Turkish Get-Up', muscle: 'Full Body', secondary: 'Core, Shoulders', difficulty: 'Advanced', equipment: 'Kettlebell', sets: '3', reps: '3 each', restSec: 90, calories: 10, emoji: '🇹🇷', instructions: ['Lie back, KB overhead one arm', 'Roll to elbow then hand', 'Bridge hips, sweep leg', 'Kneel then stand', 'Reverse to lie down'], tips: ['Learn each step solo', 'Start with no weight', 'Tests everything'] },
  { name: 'Thruster', muscle: 'Full Body', secondary: 'Shoulders, Legs', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '10-12', restSec: 75, calories: 12, emoji: '🚀', instructions: ['DBs at shoulders', 'Front squat', 'Use momentum to press overhead', 'Lock out at top', 'Lower to squat again'], tips: ['Incredibly efficient', 'Breathe: in squat, out press', 'Core tight'] },
  { name: 'Clean and Press', muscle: 'Full Body', secondary: 'Shoulders, Back', difficulty: 'Advanced', equipment: 'Barbell', sets: '4', reps: '5-8', restSec: 120, calories: 14, emoji: '🏋️', instructions: ['Bar on floor', 'Explosive pull to shoulders', 'Catch in front rack', 'Press overhead', 'Lower to floor'], tips: ['Olympic technique needed', 'Start with just bar', 'Get coaching'] },
  { name: 'Kettlebell Swing', muscle: 'Full Body', secondary: 'Glutes, Core', difficulty: 'Intermediate', equipment: 'Kettlebell', sets: '3-4', reps: '15-20', restSec: 60, calories: 12, emoji: '🔔', instructions: ['Wide stance', 'Both hands on KB', 'Hinge, swing between legs', 'Drive hips forward explosively', 'Control backswing'], tips: ['Power from hips NOT arms', 'Back flat, core braced', 'It\'s a hip hinge not squat'] },
  { name: 'Man Maker', muscle: 'Full Body', difficulty: 'Advanced', equipment: 'Dumbbells', sets: '3', reps: '6-8', restSec: 90, calories: 15, emoji: '💀', instructions: ['Standing with DBs', 'Place down, jump to plank', 'Push-up', 'Renegade row each side', 'Jump up, thruster'], tips: ['Hardest exercise here', 'Light DBs — it\'s brutal', 'Rest between reps'] },
  { name: 'Battle Ropes', muscle: 'Full Body', secondary: 'Core, Shoulders', difficulty: 'Intermediate', equipment: 'None', sets: '4', reps: '30s', restSec: 45, calories: 14, emoji: '🪢', instructions: ['Grip rope ends, athletic stance', 'Alternating waves rapidly', 'Core tight, knees bent', 'Consistent amplitude', 'Try different patterns'], tips: ['Incredible conditioning', 'Waves to anchor point', 'Experiment with movements'] },
];

const muscleGroups: MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes', 'Calves', 'Forearms', 'Full Body', 'Cardio', 'Flexibility'];
const difficulties: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

const difficultyConfig: Record<Difficulty, { color: string; icon: typeof Zap }> = {
  Beginner: { color: 'bg-success/15 text-success border-success/20', icon: Shield },
  Intermediate: { color: 'bg-warning/15 text-warning border-warning/20', icon: Zap },
  Advanced: { color: 'bg-destructive/15 text-destructive border-destructive/20', icon: Flame },
};

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.02 } } };
const item = { hidden: { opacity: 0, scale: 0.97 }, visible: { opacity: 1, scale: 1 } };

export default function ExerciseLibraryPage() {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return exercises.filter(e => {
      const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.muscle.toLowerCase().includes(search.toLowerCase()) || (e.secondary?.toLowerCase().includes(search.toLowerCase()));
      const matchMuscle = selectedMuscle === 'All' || e.muscle === selectedMuscle;
      const matchDiff = selectedDifficulty === 'All' || e.difficulty === selectedDifficulty;
      return matchSearch && matchMuscle && matchDiff;
    });
  }, [search, selectedMuscle, selectedDifficulty]);

  const muscleCount = useMemo(() => {
    const counts: Record<string, number> = {};
    exercises.forEach(e => { counts[e.muscle] = (counts[e.muscle] || 0) + 1; });
    return counts;
  }, []);

  const clearFilters = () => {
    setSelectedMuscle('All');
    setSelectedDifficulty('All');
    setSearch('');
  };

  const hasFilters = selectedMuscle !== 'All' || selectedDifficulty !== 'All' || search;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-card border border-border p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">{exercises.length} Exercises</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Exercise Library</h1>
            <p className="text-muted-foreground max-w-xl text-lg">
              Every exercise with step-by-step instructions, target muscles, difficulty levels, and pro tips.
            </p>
          </div>

          {/* Muscle group quick stats */}
          <div className="flex flex-wrap gap-2 mt-6">
            {muscleGroups.map(m => (
              <button key={m} onClick={() => { setSelectedMuscle(m === selectedMuscle ? 'All' : m); setShowFilters(true); }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${selectedMuscle === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'}`}>
                {m}
                <span className={`text-[10px] ${selectedMuscle === m ? 'text-primary-foreground/70' : 'text-muted-foreground/60'}`}>{muscleCount[m] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search + Controls */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search exercises..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11 bg-card border-border" />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2 h-11 px-4">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
          </Button>
          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} className="gap-1 h-11 text-muted-foreground">
              <X className="w-4 h-4" /> Clear
            </Button>
          )}
        </div>

        {/* Difficulty filter */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Difficulty</p>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedDifficulty('All')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedDifficulty === 'All' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                    All Levels
                  </button>
                  {difficulties.map(d => {
                    const cfg = difficultyConfig[d];
                    const Icon = cfg.icon;
                    return (
                      <button key={d} onClick={() => setSelectedDifficulty(d)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${selectedDifficulty === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                        <Icon className="w-3.5 h-3.5" />{d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{filtered.length} exercise{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Exercise Cards — Grid Layout */}
        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={container} initial="hidden" animate="visible"
          key={`${selectedMuscle}-${selectedDifficulty}-${search}`}>
          {filtered.map((ex) => {
            const isExpanded = expandedExercise === ex.name;
            const diffCfg = difficultyConfig[ex.difficulty];
            const DiffIcon = diffCfg.icon;
            return (
              <motion.div key={ex.name} variants={item} layout>
                <div className={`bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-primary/30' : 'hover:border-primary/20'}`}>
                  {/* Card Header */}
                  <button onClick={() => setExpandedExercise(isExpanded ? null : ex.name)}
                    className="w-full p-5 text-left">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{ex.emoji}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${diffCfg.color}`}>
                        <DiffIcon className="w-3 h-3" />{ex.difficulty}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-base mb-1.5">{ex.name}</h3>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">{ex.muscle}</span>
                      {ex.secondary && <span className="text-[11px] text-muted-foreground">+ {ex.secondary}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" />{ex.sets}×{ex.reps}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ex.restSec}s</span>
                      <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{ex.calories}cal</span>
                      <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" />{ex.equipment}</span>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                          {/* Instructions */}
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Instructions</h4>
                            <ol className="space-y-1.5">
                              {ex.instructions.map((step, j) => (
                                <li key={j} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{j + 1}</span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Tips */}
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                              <Star className="w-3 h-3 text-warning" /> Pro Tips
                            </h4>
                            <ul className="space-y-1">
                              {ex.tips.map((tip, j) => (
                                <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <span className="w-1 h-1 rounded-full bg-warning mt-2 shrink-0" />{tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Dumbbell className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No exercises found</h3>
            <p className="text-sm text-muted-foreground">Try different search terms or filters</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
