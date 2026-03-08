import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Search, Filter, ChevronDown, ChevronUp, Star, Clock, Flame, Target, ArrowLeft } from 'lucide-react';
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

const exercises: Exercise[] = [
  // CHEST (12)
  { name: 'Push-Up', muscle: 'Chest', secondary: 'Triceps, Shoulders', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3-4', reps: '10-20', restSec: 60, calories: 8, emoji: '💪', instructions: ['Start in plank position with hands shoulder-width apart', 'Keep body in a straight line from head to heels', 'Lower chest to the floor by bending elbows', 'Push back up to starting position', 'Exhale on the way up, inhale on the way down'], tips: ['Keep core tight throughout', 'Don\'t flare elbows out too wide', 'Scale with knee push-ups if needed'] },
  { name: 'Bench Press', muscle: 'Chest', secondary: 'Triceps, Shoulders', difficulty: 'Intermediate', equipment: 'Barbell', sets: '4', reps: '8-12', restSec: 90, calories: 10, emoji: '🏋️', instructions: ['Lie on bench with eyes under the bar', 'Grip bar slightly wider than shoulder-width', 'Unrack and lower bar to mid-chest', 'Press bar back up to lockout', 'Keep feet flat on the floor'], tips: ['Retract shoulder blades for stability', 'Use a spotter for heavy sets', 'Control the descent — don\'t bounce'] },
  { name: 'Incline Dumbbell Press', muscle: 'Chest', secondary: 'Shoulders', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3-4', reps: '10-12', restSec: 75, calories: 9, emoji: '📐', instructions: ['Set bench to 30-45 degree incline', 'Hold dumbbells at chest level with palms forward', 'Press dumbbells up and slightly inward', 'Lower with control to chest level', 'Squeeze chest at the top'], tips: ['Don\'t set incline too high — targets shoulders more', 'Keep wrists straight', 'Full range of motion is key'] },
  { name: 'Dumbbell Fly', muscle: 'Chest', secondary: 'Shoulders', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '12-15', restSec: 60, calories: 7, emoji: '🦅', instructions: ['Lie on flat bench holding dumbbells above chest', 'Slight bend in elbows throughout', 'Lower arms out to sides in wide arc', 'Feel deep stretch in chest', 'Bring dumbbells back together squeezing chest'], tips: ['Use lighter weight than pressing movements', 'Don\'t go too deep — risk of shoulder injury', 'Focus on the squeeze at the top'] },
  { name: 'Cable Crossover', muscle: 'Chest', secondary: 'Shoulders', difficulty: 'Intermediate', equipment: 'Cable', sets: '3', reps: '12-15', restSec: 60, calories: 7, emoji: '🔗', instructions: ['Set pulleys to high position', 'Step forward with one foot for stability', 'Pull handles down and together in front of chest', 'Squeeze chest hard at bottom', 'Return slowly to start'], tips: ['Keep slight bend in elbows', 'Lean slightly forward', 'Control the negative'] },
  { name: 'Decline Push-Up', muscle: 'Chest', secondary: 'Shoulders, Core', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '10-15', restSec: 60, calories: 9, emoji: '⬇️', instructions: ['Place feet on elevated surface (bench/step)', 'Hands on floor shoulder-width apart', 'Lower chest toward floor', 'Push back up maintaining body alignment', 'Keep core engaged'], tips: ['Higher elevation = more upper chest emphasis', 'Start with low elevation and progress', 'Keep hips from sagging'] },
  { name: 'Chest Dip', muscle: 'Chest', secondary: 'Triceps, Shoulders', difficulty: 'Advanced', equipment: 'Bodyweight', sets: '3-4', reps: '8-12', restSec: 90, calories: 10, emoji: '🤸', instructions: ['Grip parallel bars and lift body', 'Lean forward slightly (30 degrees)', 'Lower body by bending elbows to 90 degrees', 'Push back up to full extension', 'Keep shoulders down and back'], tips: ['Lean forward for more chest, upright for more triceps', 'Don\'t go too deep if shoulders hurt', 'Add weight belt when bodyweight becomes easy'] },
  { name: 'Landmine Press', muscle: 'Chest', secondary: 'Shoulders', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3', reps: '10-12', restSec: 75, calories: 8, emoji: '💣', instructions: ['Place one end of barbell in corner or landmine attachment', 'Hold the other end at chest height', 'Press the bar up and forward', 'Lower with control', 'Alternate arms or use both hands'], tips: ['Great for shoulder-friendly pressing', 'Engages core heavily', 'Can be done standing or kneeling'] },
  { name: 'Pec Deck Machine', muscle: 'Chest', difficulty: 'Beginner', equipment: 'Machine', sets: '3', reps: '12-15', restSec: 60, calories: 6, emoji: '🦾', instructions: ['Sit with back flat against pad', 'Place forearms against arm pads', 'Bring pads together in front of chest', 'Squeeze and hold for 1 second', 'Return slowly to start position'], tips: ['Don\'t let arms go too far back', 'Focus on squeezing chest, not pushing with arms', 'Keep shoulders relaxed'] },
  { name: 'Diamond Push-Up', muscle: 'Chest', secondary: 'Triceps', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '8-15', restSec: 60, calories: 9, emoji: '💎', instructions: ['Place hands together forming diamond shape with thumbs and index fingers', 'Assume push-up position', 'Lower chest to hands', 'Push back up squeezing inner chest and triceps', 'Keep elbows close to body'], tips: ['Harder than regular push-ups', 'Great for inner chest and triceps', 'Modify on knees if needed'] },
  { name: 'Svend Press', muscle: 'Chest', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '🔘', instructions: ['Hold a plate or light dumbbell between palms at chest level', 'Press arms straight out in front of you', 'Squeeze palms together hard throughout', 'Bring back to chest', 'Feel the chest contraction'], tips: ['Use light weight — it\'s about the squeeze', 'Great finisher exercise', 'Keep constant tension'] },
  { name: 'Floor Press', muscle: 'Chest', secondary: 'Triceps', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '4', reps: '8-12', restSec: 75, calories: 8, emoji: '🏠', instructions: ['Lie on floor with knees bent', 'Hold dumbbells above chest', 'Lower until triceps touch the floor', 'Pause briefly then press back up', 'Great for lockout strength'], tips: ['Reduces range of motion — less shoulder stress', 'Pause at bottom eliminates stretch reflex', 'Good home alternative to bench press'] },

  // BACK (12)
  { name: 'Pull-Up', muscle: 'Back', secondary: 'Biceps', difficulty: 'Intermediate', equipment: 'Pull-up Bar', sets: '3-4', reps: '6-12', restSec: 90, calories: 10, emoji: '🧗', instructions: ['Grip bar slightly wider than shoulder-width, palms facing away', 'Hang with arms fully extended', 'Pull body up until chin is over the bar', 'Lower slowly with control', 'Avoid swinging or kipping'], tips: ['Use assisted machine or bands if needed', 'Focus on pulling elbows down, not hands up', 'Squeeze lats at the top'] },
  { name: 'Bent-Over Row', muscle: 'Back', secondary: 'Biceps, Core', difficulty: 'Intermediate', equipment: 'Barbell', sets: '4', reps: '8-12', restSec: 90, calories: 10, emoji: '🚣', instructions: ['Hinge at hips with slight knee bend', 'Grip barbell shoulder-width apart', 'Pull bar to lower chest/upper abs', 'Squeeze shoulder blades together at top', 'Lower with control'], tips: ['Keep back flat — don\'t round', 'About 45-degree torso angle', 'Don\'t use momentum'] },
  { name: 'Lat Pulldown', muscle: 'Back', secondary: 'Biceps', difficulty: 'Beginner', equipment: 'Cable', sets: '3-4', reps: '10-12', restSec: 75, calories: 8, emoji: '⬇️', instructions: ['Sit at lat pulldown machine, thighs secured under pads', 'Grip bar wider than shoulder-width', 'Pull bar down to upper chest', 'Lean back slightly', 'Return bar slowly overhead'], tips: ['Don\'t pull behind the neck — injury risk', 'Focus on lat contraction, not arm pulling', 'Full extension at top for stretch'] },
  { name: 'Single-Arm Dumbbell Row', muscle: 'Back', secondary: 'Biceps', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '10-12 each', restSec: 60, calories: 8, emoji: '💪', instructions: ['Place one knee and hand on bench', 'Hold dumbbell in opposite hand, arm hanging straight', 'Pull dumbbell to hip/waist level', 'Squeeze lat at top', 'Lower with control'], tips: ['Keep torso parallel to floor', 'Don\'t rotate trunk', 'Full range of motion'] },
  { name: 'Seated Cable Row', muscle: 'Back', secondary: 'Biceps', difficulty: 'Beginner', equipment: 'Cable', sets: '3', reps: '10-12', restSec: 60, calories: 7, emoji: '🪝', instructions: ['Sit at cable row station, feet on footplates', 'Grab V-bar or close-grip handle', 'Pull handle to lower chest/abdomen', 'Squeeze shoulder blades together', 'Extend arms fully on the return'], tips: ['Keep chest tall throughout', 'Don\'t lean back excessively', 'Pause at contraction'] },
  { name: 'Deadlift', muscle: 'Back', secondary: 'Legs, Core, Glutes', difficulty: 'Advanced', equipment: 'Barbell', sets: '3-5', reps: '3-6', restSec: 120, calories: 15, emoji: '🔥', instructions: ['Stand with feet hip-width, bar over mid-foot', 'Hinge and grip bar just outside knees', 'Keep chest up, back flat', 'Drive through heels and extend hips', 'Stand tall at top, reverse the movement'], tips: ['Never round your back', 'The bar should stay close to your body', 'Start light and perfect form first'] },
  { name: 'T-Bar Row', muscle: 'Back', secondary: 'Biceps', difficulty: 'Intermediate', equipment: 'Barbell', sets: '4', reps: '8-12', restSec: 90, calories: 10, emoji: '🔩', instructions: ['Straddle the T-bar or landmine setup', 'Grip handles with both hands', 'Bend at hips, keep back flat', 'Pull weight to chest', 'Lower with control'], tips: ['Great for building back thickness', 'Keep core braced', 'Don\'t jerk the weight'] },
  { name: 'Face Pull', muscle: 'Back', secondary: 'Shoulders', difficulty: 'Beginner', equipment: 'Cable', sets: '3', reps: '15-20', restSec: 45, calories: 5, emoji: '🎯', instructions: ['Set cable pulley to face height', 'Use rope attachment', 'Pull rope toward face, separating hands', 'Squeeze rear delts and upper back', 'Return slowly'], tips: ['Essential for shoulder health', 'Keep elbows high', 'Use light weight — it\'s a corrective exercise'] },
  { name: 'Chin-Up', muscle: 'Back', secondary: 'Biceps', difficulty: 'Intermediate', equipment: 'Pull-up Bar', sets: '3', reps: '6-10', restSec: 90, calories: 10, emoji: '🔝', instructions: ['Grip bar shoulder-width with palms facing you', 'Hang with full arm extension', 'Pull up until chin clears the bar', 'Lower with control', 'Avoid swinging'], tips: ['More bicep involvement than pull-ups', 'Great for bicep development too', 'Use bands for assistance if needed'] },
  { name: 'Inverted Row', muscle: 'Back', secondary: 'Biceps, Core', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '10-15', restSec: 60, calories: 7, emoji: '🔄', instructions: ['Set bar at waist height on rack or Smith machine', 'Hang underneath with arms extended, heels on floor', 'Pull chest to bar', 'Squeeze shoulder blades at top', 'Lower with control'], tips: ['Great pull-up progression exercise', 'Walk feet further out to increase difficulty', 'Keep body straight like a plank'] },
  { name: 'Straight-Arm Pulldown', muscle: 'Back', difficulty: 'Beginner', equipment: 'Cable', sets: '3', reps: '12-15', restSec: 45, calories: 6, emoji: '📏', instructions: ['Stand facing cable machine, bar at top', 'Grip bar with straight arms', 'Pull bar down to thighs in an arc', 'Squeeze lats hard at bottom', 'Return slowly overhead'], tips: ['Keep arms nearly straight throughout', 'Lean slightly forward', 'Great lat isolation exercise'] },
  { name: 'Superman Hold', muscle: 'Back', secondary: 'Glutes', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '10-15', restSec: 45, calories: 5, emoji: '🦸', instructions: ['Lie face down on the floor', 'Extend arms overhead', 'Simultaneously lift arms, chest, and legs off floor', 'Hold for 2-3 seconds', 'Lower back down with control'], tips: ['Don\'t hyperextend neck — look at floor', 'Great for lower back strength', 'Can hold for time instead of reps'] },

  // SHOULDERS (10)
  { name: 'Overhead Press', muscle: 'Shoulders', secondary: 'Triceps', difficulty: 'Intermediate', equipment: 'Barbell', sets: '4', reps: '6-10', restSec: 90, calories: 9, emoji: '⬆️', instructions: ['Stand with bar at shoulder height', 'Grip slightly wider than shoulder-width', 'Press bar overhead to full lockout', 'Move head through as bar passes face', 'Lower back to shoulders'], tips: ['Brace core tight', 'Don\'t lean back excessively', 'Full lockout at top'] },
  { name: 'Lateral Raise', muscle: 'Shoulders', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3-4', reps: '12-15', restSec: 45, calories: 6, emoji: '🦅', instructions: ['Stand with dumbbells at sides', 'Raise arms out to sides until parallel with floor', 'Slight bend in elbows', 'Lower slowly with control', 'Lead with elbows, not hands'], tips: ['Use light weight — shoulders are small muscles', 'Don\'t swing or use momentum', 'Think of pouring water from a pitcher at the top'] },
  { name: 'Front Raise', muscle: 'Shoulders', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '🙋', instructions: ['Hold dumbbells in front of thighs', 'Raise one or both arms straight ahead to shoulder height', 'Keep slight bend in elbows', 'Lower with control', 'Alternate arms or do both together'], tips: ['Don\'t go above shoulder height', 'Keep core braced', 'Use light weight'] },
  { name: 'Arnold Press', muscle: 'Shoulders', secondary: 'Triceps', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '10-12', restSec: 75, calories: 8, emoji: '💪', instructions: ['Start with dumbbells at chest, palms facing you', 'Press up while rotating palms to face forward', 'Full lockout at top', 'Reverse the rotation on the way down', 'Smooth continuous motion'], tips: ['Invented by Arnold Schwarzenegger', 'Hits all three delt heads', 'Don\'t rush the rotation'] },
  { name: 'Reverse Fly', muscle: 'Shoulders', secondary: 'Back', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '🦋', instructions: ['Bend forward at hips holding dumbbells', 'Raise arms out to sides squeezing rear delts', 'Pause at the top', 'Lower slowly', 'Keep slight bend in elbows'], tips: ['Focus on rear delts squeezing', 'Great for posture improvement', 'Use light weight'] },
  { name: 'Upright Row', muscle: 'Shoulders', secondary: 'Biceps', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3', reps: '10-12', restSec: 60, calories: 7, emoji: '🔼', instructions: ['Hold barbell with narrow grip in front of thighs', 'Pull bar straight up along body to chin', 'Keep elbows above the bar', 'Lower with control', 'Lead with elbows'], tips: ['Wider grip is easier on shoulders', 'Don\'t pull above chin', 'If shoulders hurt, substitute with lateral raises'] },
  { name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', secondary: 'Triceps', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3-4', reps: '8-12', restSec: 75, calories: 8, emoji: '🔝', instructions: ['Sit or stand holding dumbbells at shoulder height', 'Press dumbbells overhead', 'Touch dumbbells lightly at the top', 'Lower to shoulder level', 'Keep core engaged'], tips: ['Allows more natural range of motion than barbell', 'Seated version reduces cheating', 'Don\'t lock elbows aggressively'] },
  { name: 'Pike Push-Up', muscle: 'Shoulders', secondary: 'Triceps', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '8-12', restSec: 60, calories: 8, emoji: '🔺', instructions: ['Start in downward dog position — hips high', 'Hands shoulder-width apart', 'Bend elbows and lower head toward floor', 'Push back up to start', 'Keep hips high throughout'], tips: ['Great handstand push-up progression', 'Elevate feet for more difficulty', 'Head should go between hands'] },
  { name: 'Cable Lateral Raise', muscle: 'Shoulders', difficulty: 'Beginner', equipment: 'Cable', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '🔗', instructions: ['Stand sideways to low cable pulley', 'Grab handle with far hand', 'Raise arm out to side to shoulder height', 'Lower with control', 'Switch sides'], tips: ['Constant tension throughout range', 'Better than dumbbells for constant resistance', 'Great for shoulder development'] },
  { name: 'Handstand Push-Up', muscle: 'Shoulders', secondary: 'Triceps, Core', difficulty: 'Advanced', equipment: 'Bodyweight', sets: '3', reps: '3-8', restSec: 120, calories: 12, emoji: '🤸', instructions: ['Kick up into handstand against wall', 'Hands shoulder-width apart', 'Lower head to floor by bending elbows', 'Push back up to full lockout', 'Keep core extremely tight'], tips: ['Master pike push-ups first', 'Use wall for balance', 'Place a pillow under head for safety'] },

  // BICEPS (8)
  { name: 'Barbell Curl', muscle: 'Biceps', difficulty: 'Beginner', equipment: 'Barbell', sets: '3', reps: '10-12', restSec: 60, calories: 6, emoji: '💪', instructions: ['Stand holding barbell with underhand grip', 'Keep elbows pinned to sides', 'Curl bar up to shoulder level', 'Squeeze biceps at top', 'Lower slowly — fight the weight down'], tips: ['Don\'t swing body for momentum', 'Keep wrists straight', 'EZ-bar is easier on wrists'] },
  { name: 'Hammer Curl', muscle: 'Biceps', secondary: 'Forearms', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '10-12', restSec: 60, calories: 6, emoji: '🔨', instructions: ['Hold dumbbells with palms facing each other (neutral grip)', 'Curl dumbbells up keeping neutral grip throughout', 'Squeeze at top', 'Lower with control', 'Can alternate or do simultaneously'], tips: ['Targets brachialis and forearms too', 'Keep elbows stationary', 'Great for overall arm thickness'] },
  { name: 'Incline Dumbbell Curl', muscle: 'Biceps', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '10-12', restSec: 60, calories: 6, emoji: '📐', instructions: ['Set bench to 45-degree incline', 'Let arms hang straight down with dumbbells', 'Curl weights up, keeping upper arms still', 'Squeeze at top', 'Lower fully for maximum stretch'], tips: ['Amazing stretch on the long head of biceps', 'Don\'t swing — strict form', 'Use lighter weight than standing curls'] },
  { name: 'Concentration Curl', muscle: 'Biceps', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '🧘', instructions: ['Sit on bench, lean forward', 'Brace elbow against inner thigh', 'Curl dumbbell up squeezing bicep hard', 'Hold peak contraction 1-2 seconds', 'Lower slowly'], tips: ['Isolates the bicep completely', 'Perfect for peak contraction', 'Don\'t rush the reps'] },
  { name: 'Cable Curl', muscle: 'Biceps', difficulty: 'Beginner', equipment: 'Cable', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '🔗', instructions: ['Attach straight bar to low cable', 'Stand upright gripping bar underhand', 'Curl bar up keeping elbows stationary', 'Squeeze at top', 'Lower with control'], tips: ['Constant tension throughout', 'Great finisher exercise', 'Try different attachments — rope, EZ-bar'] },
  { name: 'Preacher Curl', muscle: 'Biceps', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3', reps: '10-12', restSec: 60, calories: 6, emoji: '🛐', instructions: ['Sit at preacher bench, upper arms on pad', 'Grip EZ-bar with underhand grip', 'Curl bar up to shoulder level', 'Lower slowly — full extension', 'Don\'t bounce at bottom'], tips: ['Eliminates all cheating', 'Great for bicep peak', 'Don\'t hyperextend elbows at bottom'] },
  { name: 'Spider Curl', muscle: 'Biceps', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '10-12', restSec: 60, calories: 6, emoji: '🕷️', instructions: ['Lean chest against incline bench (facing the bench)', 'Arms hang straight down', 'Curl dumbbells up squeezing biceps', 'Lower fully', 'Keep upper arms perpendicular to floor'], tips: ['Extreme peak contraction', 'No momentum possible', 'Use lighter weight'] },
  { name: 'Zottman Curl', muscle: 'Biceps', secondary: 'Forearms', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '10-12', restSec: 60, calories: 6, emoji: '🔄', instructions: ['Curl dumbbells up with palms facing up (supinated)', 'At the top, rotate palms to face down (pronated)', 'Lower slowly with palms facing down', 'Rotate back to palms up at bottom', 'Repeat'], tips: ['Trains both biceps and forearms', 'The negative with pronated grip targets forearms', 'Use moderate weight'] },

  // TRICEPS (8)
  { name: 'Tricep Dip', muscle: 'Triceps', secondary: 'Chest, Shoulders', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '8-12', restSec: 75, calories: 9, emoji: '⬇️', instructions: ['Grip parallel bars, lift body up', 'Keep torso upright (lean forward = more chest)', 'Lower body bending elbows to 90 degrees', 'Push back up to lockout', 'Keep shoulders down'], tips: ['Upright torso = more triceps', 'Don\'t go too deep if shoulders hurt', 'Add weight when bodyweight is easy'] },
  { name: 'Skull Crusher', muscle: 'Triceps', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3', reps: '10-12', restSec: 60, calories: 7, emoji: '💀', instructions: ['Lie on bench holding EZ-bar overhead', 'Keep upper arms vertical', 'Lower bar to forehead by bending elbows', 'Extend arms back to start', 'Keep elbows in — don\'t flare'], tips: ['Use EZ-bar for wrist comfort', 'Can lower to behind head for more stretch', 'Control the descent carefully'] },
  { name: 'Tricep Pushdown', muscle: 'Triceps', difficulty: 'Beginner', equipment: 'Cable', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '⬇️', instructions: ['Attach bar or rope to high cable', 'Stand with elbows at sides', 'Push handle down to full extension', 'Squeeze triceps at bottom', 'Return to 90-degree elbow position'], tips: ['Keep elbows pinned to sides', 'Don\'t lean forward excessively', 'Rope attachment allows more contraction'] },
  { name: 'Overhead Tricep Extension', muscle: 'Triceps', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '10-12', restSec: 60, calories: 6, emoji: '🔝', instructions: ['Hold dumbbell with both hands overhead', 'Lower weight behind head by bending elbows', 'Keep upper arms close to ears', 'Extend back up to start', 'Squeeze at top'], tips: ['Great stretch on long head of triceps', 'Keep core braced', 'Can use cable for constant tension'] },
  { name: 'Close-Grip Bench Press', muscle: 'Triceps', secondary: 'Chest', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3-4', reps: '8-10', restSec: 75, calories: 9, emoji: '🏋️', instructions: ['Lie on bench, grip bar shoulder-width or slightly narrower', 'Unrack bar and lower to lower chest', 'Keep elbows close to body', 'Press back up to lockout', 'Focus on tricep contraction'], tips: ['Don\'t go too narrow — wrist strain', 'Shoulder-width grip is fine', 'Touch lower on chest than regular bench'] },
  { name: 'Kickback', muscle: 'Triceps', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '12-15', restSec: 45, calories: 5, emoji: '🦵', instructions: ['Bend forward at hips, upper arm parallel to floor', 'Extend forearm back until arm is straight', 'Squeeze tricep at full extension', 'Lower slowly', 'Keep upper arm still'], tips: ['Use light weight and focus on contraction', 'Don\'t swing', 'Peak contraction exercise'] },
  { name: 'Bench Dip', muscle: 'Triceps', difficulty: 'Beginner', equipment: 'Bench', sets: '3', reps: '12-15', restSec: 60, calories: 7, emoji: '🪑', instructions: ['Place hands on edge of bench behind you', 'Extend legs out in front', 'Lower body by bending elbows to 90 degrees', 'Push back up', 'Keep back close to bench'], tips: ['Bend knees to make easier', 'Don\'t go too deep', 'Keep shoulders down'] },
  { name: 'Diamond Push-Up (Tricep Focus)', muscle: 'Triceps', secondary: 'Chest', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '8-12', restSec: 60, calories: 8, emoji: '💎', instructions: ['Form diamond with hands under chest', 'Perform push-up keeping elbows close to body', 'Lower chest to hands', 'Push up focusing on tricep engagement', 'Full lockout at top'], tips: ['One of the best bodyweight tricep exercises', 'Harder than regular push-ups', 'Great for home workouts'] },

  // LEGS (12)
  { name: 'Barbell Squat', muscle: 'Legs', secondary: 'Core, Glutes', difficulty: 'Intermediate', equipment: 'Barbell', sets: '4', reps: '6-10', restSec: 120, calories: 15, emoji: '🏋️', instructions: ['Place bar on upper back (traps)', 'Feet shoulder-width apart, toes slightly out', 'Sit back and down — knees track over toes', 'Descend until thighs are parallel or below', 'Drive up through heels'], tips: ['King of all exercises', 'Keep chest up and core braced', 'Don\'t let knees cave inward'] },
  { name: 'Leg Press', muscle: 'Legs', secondary: 'Glutes', difficulty: 'Beginner', equipment: 'Machine', sets: '4', reps: '10-15', restSec: 90, calories: 10, emoji: '🦵', instructions: ['Sit in leg press machine, feet shoulder-width on platform', 'Release safety and lower platform', 'Bend knees to 90 degrees', 'Press platform away', 'Don\'t lock knees fully at top'], tips: ['Foot position changes emphasis', 'High and wide = more glutes', 'Don\'t round lower back at bottom'] },
  { name: 'Romanian Deadlift', muscle: 'Legs', secondary: 'Back, Glutes', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3-4', reps: '8-12', restSec: 90, calories: 10, emoji: '🇷🇴', instructions: ['Hold barbell at hip level, feet hip-width', 'Slight bend in knees throughout', 'Hinge at hips pushing butt back', 'Lower bar along legs until hamstring stretch', 'Return to standing by driving hips forward'], tips: ['Bar stays close to legs', 'Feel the stretch in hamstrings', 'Don\'t round your back'] },
  { name: 'Lunges', muscle: 'Legs', secondary: 'Glutes, Core', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '12 each leg', restSec: 60, calories: 8, emoji: '🚶', instructions: ['Stand upright, feet together', 'Step forward with one leg', 'Lower back knee toward floor', 'Both knees at 90 degrees', 'Push back to start, alternate legs'], tips: ['Keep torso upright', 'Front knee doesn\'t pass toes', 'Add dumbbells for progression'] },
  { name: 'Leg Extension', muscle: 'Legs', difficulty: 'Beginner', equipment: 'Machine', sets: '3', reps: '12-15', restSec: 45, calories: 6, emoji: '🦿', instructions: ['Sit in machine, ankle pad on shins', 'Extend legs to straight position', 'Squeeze quads hard at top', 'Hold 1 second', 'Lower with control'], tips: ['Don\'t use momentum', 'Great quad isolation', 'Pause at top for peak contraction'] },
  { name: 'Leg Curl', muscle: 'Legs', difficulty: 'Beginner', equipment: 'Machine', sets: '3', reps: '12-15', restSec: 45, calories: 6, emoji: '🔄', instructions: ['Lie face down on leg curl machine', 'Ankle pad behind ankles', 'Curl weight up toward glutes', 'Squeeze hamstrings at top', 'Lower with control'], tips: ['Don\'t lift hips off pad', 'Full range of motion', 'Great hamstring isolation'] },
  { name: 'Bulgarian Split Squat', muscle: 'Legs', secondary: 'Glutes', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '10-12 each', restSec: 75, calories: 9, emoji: '🇧🇬', instructions: ['Stand in front of bench, place rear foot on it', 'Hold dumbbells at sides', 'Lower back knee toward floor', 'Front knee bends to 90 degrees', 'Push through front heel to stand'], tips: ['Amazing single-leg exercise', 'Fix imbalances between legs', 'Lean slightly forward for more quad'] },
  { name: 'Wall Sit', muscle: 'Legs', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '30-60 sec', restSec: 60, calories: 5, emoji: '🧱', instructions: ['Lean back against wall', 'Slide down until thighs parallel to floor', 'Knees at 90 degrees', 'Hold the position', 'Keep back flat against wall'], tips: ['Great endurance exercise', 'Add weight on thighs for more difficulty', 'Breathe normally throughout'] },
  { name: 'Goblet Squat', muscle: 'Legs', secondary: 'Core', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '12-15', restSec: 60, calories: 8, emoji: '🏆', instructions: ['Hold dumbbell vertically at chest', 'Feet shoulder-width, toes slightly out', 'Squat down keeping weight at chest', 'Go as deep as comfortable', 'Stand back up'], tips: ['Great for learning squat form', 'The weight acts as a counterbalance', 'Keep elbows between knees'] },
  { name: 'Step-Up', muscle: 'Legs', secondary: 'Glutes', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '10-12 each', restSec: 60, calories: 7, emoji: '🪜', instructions: ['Stand facing bench or box', 'Step up with one foot, drive body up', 'Stand fully on top of box', 'Step back down with control', 'Alternate legs'], tips: ['Higher box = more glute activation', 'Drive through the heel of the working leg', 'Add dumbbells for progression'] },
  { name: 'Calf Raise', muscle: 'Calves', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '4', reps: '15-20', restSec: 45, calories: 4, emoji: '🦶', instructions: ['Stand on edge of step or flat ground', 'Rise up on toes as high as possible', 'Hold peak contraction 1-2 seconds', 'Lower heels below step for stretch', 'Repeat'], tips: ['Calves respond to high reps', 'Both straight-leg and bent-knee versions', 'Pause at top and bottom'] },
  { name: 'Hip Thrust', muscle: 'Glutes', secondary: 'Legs', difficulty: 'Intermediate', equipment: 'Barbell', sets: '3-4', reps: '10-12', restSec: 75, calories: 9, emoji: '🍑', instructions: ['Sit on floor with upper back against bench', 'Roll barbell over hips (use pad for comfort)', 'Drive hips up until body forms straight line', 'Squeeze glutes hard at top', 'Lower with control'], tips: ['Best exercise for glute development', 'Feet shoulder-width apart', 'Don\'t hyperextend lower back'] },

  // CORE (10)
  { name: 'Plank', muscle: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '30-60 sec', restSec: 45, calories: 5, emoji: '🧘', instructions: ['Forearms and toes on the floor', 'Body forms straight line', 'Engage core — pull belly button to spine', 'Keep hips level — don\'t sag or pike', 'Breathe normally and hold'], tips: ['Quality over duration', 'Squeeze everything — glutes, quads, core', 'Build up time gradually'] },
  { name: 'Bicycle Crunch', muscle: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '20 each side', restSec: 45, calories: 6, emoji: '🚲', instructions: ['Lie on back, hands behind head', 'Lift shoulders off floor', 'Bring right elbow to left knee while extending right leg', 'Alternate sides in pedaling motion', 'Don\'t pull on neck'], tips: ['Slow and controlled > fast', 'Really twist and squeeze obliques', 'Keep lower back pressed to floor'] },
  { name: 'Russian Twist', muscle: 'Core', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '20 total', restSec: 45, calories: 6, emoji: '🇷🇺', instructions: ['Sit with knees bent, lean back slightly', 'Lift feet off floor (or keep planted for easier version)', 'Rotate torso side to side', 'Touch floor on each side with hands or weight', 'Keep chest up'], tips: ['Add weight to increase difficulty', 'Control the rotation — don\'t rush', 'Great for obliques'] },
  { name: 'Hanging Leg Raise', muscle: 'Core', difficulty: 'Advanced', equipment: 'Pull-up Bar', sets: '3', reps: '8-12', restSec: 60, calories: 8, emoji: '🦵', instructions: ['Hang from pull-up bar with full extension', 'Keep legs straight (or bend knees for easier version)', 'Raise legs to parallel or above', 'Lower slowly with control', 'Don\'t swing'], tips: ['One of the best ab exercises', 'Bent knee version for beginners', 'Think of curling pelvis up'] },
  { name: 'Dead Bug', muscle: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '10 each side', restSec: 45, calories: 5, emoji: '🪲', instructions: ['Lie on back, arms extended to ceiling', 'Knees bent at 90 degrees, shins parallel to floor', 'Extend opposite arm and leg simultaneously', 'Keep lower back pressed to floor', 'Return and repeat other side'], tips: ['Excellent for core stability', 'If back lifts off floor, you\'ve gone too far', 'Breathe out as you extend'] },
  { name: 'Mountain Climber', muscle: 'Core', secondary: 'Cardio', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '30 sec', restSec: 45, calories: 10, emoji: '⛰️', instructions: ['Start in push-up position', 'Drive one knee toward chest', 'Quickly switch legs', 'Keep hips low and core tight', 'Maintain fast pace'], tips: ['Great for cardio and core', 'Don\'t let hips bounce up', 'Scale speed to your fitness level'] },
  { name: 'Ab Rollout', muscle: 'Core', difficulty: 'Advanced', equipment: 'Bodyweight', sets: '3', reps: '8-12', restSec: 60, calories: 8, emoji: '🛞', instructions: ['Kneel on floor holding ab wheel or barbell', 'Roll forward extending body toward floor', 'Go as far as you can maintain tension', 'Pull back to starting position using abs', 'Keep core tight throughout'], tips: ['Extremely effective core exercise', 'Don\'t let lower back sag', 'Start with small range of motion'] },
  { name: 'Pallof Press', muscle: 'Core', difficulty: 'Intermediate', equipment: 'Cable', sets: '3', reps: '10-12 each side', restSec: 45, calories: 5, emoji: '🎯', instructions: ['Stand sideways to cable machine at chest height', 'Hold handle at chest with both hands', 'Press handle straight out in front', 'Resist the rotation — core fights the pull', 'Return to chest and repeat'], tips: ['Anti-rotation exercise — trains core stability', 'Great for sports performance', 'Keep hips and shoulders square'] },
  { name: 'Side Plank', muscle: 'Core', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '30-45 sec each', restSec: 45, calories: 5, emoji: '↗️', instructions: ['Lie on side, forearm on floor under shoulder', 'Stack feet or stagger them', 'Lift hips creating straight line from head to feet', 'Hold position', 'Don\'t let hips drop'], tips: ['Great for obliques and hip stability', 'Add hip dips for more difficulty', 'Keep top hip stacked over bottom'] },
  { name: 'V-Up', muscle: 'Core', difficulty: 'Intermediate', equipment: 'Bodyweight', sets: '3', reps: '12-15', restSec: 45, calories: 7, emoji: '✌️', instructions: ['Lie flat on back, arms overhead', 'Simultaneously lift legs and torso', 'Reach hands toward feet forming V shape', 'Balance briefly on sit bones', 'Lower back to start with control'], tips: ['Keep legs straight if possible', 'Bend knees for easier version', 'Don\'t use momentum'] },

  // GLUTES (6)
  { name: 'Glute Bridge', muscle: 'Glutes', secondary: 'Core', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '15-20', restSec: 45, calories: 5, emoji: '🌉', instructions: ['Lie on back, knees bent, feet flat on floor', 'Drive hips up squeezing glutes at top', 'Create straight line from knees to shoulders', 'Hold top position 2 seconds', 'Lower slowly'], tips: ['Great activation exercise', 'Single-leg version for more challenge', 'Don\'t hyperextend back'] },
  { name: 'Sumo Deadlift', muscle: 'Glutes', secondary: 'Legs, Back', difficulty: 'Advanced', equipment: 'Barbell', sets: '4', reps: '6-8', restSec: 120, calories: 14, emoji: '🏋️', instructions: ['Wide stance, toes pointed out 45 degrees', 'Grip bar between legs shoulder-width', 'Push knees out over toes', 'Lift by extending hips and knees', 'Lock out at top'], tips: ['More glute and inner thigh than conventional', 'Keep chest up', 'Push floor apart with feet'] },
  { name: 'Cable Pull-Through', muscle: 'Glutes', secondary: 'Legs', difficulty: 'Beginner', equipment: 'Cable', sets: '3', reps: '12-15', restSec: 60, calories: 6, emoji: '🔗', instructions: ['Stand facing away from low cable with rope between legs', 'Hinge at hips, push butt back', 'Feel stretch in hamstrings and glutes', 'Drive hips forward squeezing glutes', 'Stand tall at top'], tips: ['Great hip hinge learning tool', 'Keep arms straight — power comes from hips', 'Squeeze glutes hard at lockout'] },
  { name: 'Donkey Kick', muscle: 'Glutes', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '15 each', restSec: 45, calories: 5, emoji: '🫏', instructions: ['Start on hands and knees', 'Keep knee bent at 90 degrees', 'Lift one leg up driving foot toward ceiling', 'Squeeze glute at top', 'Lower and repeat'], tips: ['Don\'t arch lower back', 'Keep hips square — don\'t rotate', 'Add ankle weight for resistance'] },
  { name: 'Fire Hydrant', muscle: 'Glutes', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '15 each', restSec: 45, calories: 5, emoji: '🚒', instructions: ['Start on hands and knees', 'Keep knee bent at 90 degrees', 'Lift leg out to the side', 'Raise until thigh is parallel with floor', 'Lower and repeat'], tips: ['Targets outer glutes (gluteus medius)', 'Great for hip stability', 'Keep core engaged'] },
  { name: 'Frog Pump', muscle: 'Glutes', difficulty: 'Beginner', equipment: 'Bodyweight', sets: '3', reps: '20-30', restSec: 45, calories: 5, emoji: '🐸', instructions: ['Lie on back, soles of feet together, knees out', 'Drive hips up squeezing glutes', 'This position removes hamstring involvement', 'Pulse at top for maximum activation', 'Lower and repeat'], tips: ['Incredible glute isolation', 'No equipment needed', 'Great as a warm-up exercise'] },

  // FOREARMS (4)
  { name: 'Wrist Curl', muscle: 'Forearms', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '15-20', restSec: 45, calories: 3, emoji: '🤲', instructions: ['Sit with forearms on thighs, wrists hanging over knees', 'Hold dumbbells with palms up', 'Curl wrists up', 'Lower slowly', 'Full range of motion'], tips: ['Use light weight — forearms are small muscles', 'Both palms-up and palms-down versions', 'High reps work best for forearms'] },
  { name: 'Reverse Wrist Curl', muscle: 'Forearms', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '15-20', restSec: 45, calories: 3, emoji: '🔄', instructions: ['Same as wrist curl but palms face down', 'Extend wrists upward', 'Lower slowly', 'Feel the top of the forearm working', 'Full range of motion'], tips: ['Targets wrist extensors', 'Prevents imbalances', 'Use lighter weight than regular wrist curls'] },
  { name: 'Farmer\'s Walk', muscle: 'Forearms', secondary: 'Core, Full Body', difficulty: 'Beginner', equipment: 'Dumbbells', sets: '3', reps: '30-60 sec', restSec: 60, calories: 8, emoji: '🚶', instructions: ['Hold heavy dumbbells at sides', 'Stand tall — shoulders back, core tight', 'Walk with controlled steps', 'Maintain grip throughout', 'Set down carefully when finished'], tips: ['Amazing for grip strength and overall conditioning', 'Go as heavy as you can hold', 'Keep shoulders packed down'] },
  { name: 'Dead Hang', muscle: 'Forearms', secondary: 'Back', difficulty: 'Beginner', equipment: 'Pull-up Bar', sets: '3', reps: '20-60 sec', restSec: 60, calories: 3, emoji: '🦥', instructions: ['Grip pull-up bar with overhand grip', 'Hang with arms fully extended', 'Keep shoulders engaged (not fully relaxed)', 'Hold as long as possible', 'Step down safely'], tips: ['Builds grip strength and decompresses spine', 'Great for shoulder health', 'Challenge yourself to increase hang time'] },

  // CARDIO (8)
  { name: 'Jumping Jacks', muscle: 'Cardio', secondary: 'Full Body', difficulty: 'Beginner', equipment: 'None', sets: '3', reps: '30 sec', restSec: 30, calories: 10, emoji: '⭐', instructions: ['Stand with feet together, arms at sides', 'Jump feet out wide while raising arms overhead', 'Jump back to start', 'Maintain rhythm', 'Land softly'], tips: ['Great warm-up exercise', 'Low impact version — step out instead of jump', 'Keep a steady pace'] },
  { name: 'Burpee', muscle: 'Cardio', secondary: 'Full Body', difficulty: 'Intermediate', equipment: 'None', sets: '3', reps: '10-15', restSec: 60, calories: 15, emoji: '🔥', instructions: ['Stand, then squat down placing hands on floor', 'Jump feet back to plank position', 'Perform a push-up (optional)', 'Jump feet forward to hands', 'Explosively jump up with arms overhead'], tips: ['The ultimate full-body conditioning exercise', 'Modify by stepping back instead of jumping', 'Focus on form as you fatigue'] },
  { name: 'High Knees', muscle: 'Cardio', secondary: 'Core', difficulty: 'Beginner', equipment: 'None', sets: '3', reps: '30 sec', restSec: 30, calories: 12, emoji: '🦵', instructions: ['Stand in place', 'Drive one knee up to hip height', 'Quickly alternate to other knee', 'Pump arms like sprinting', 'Stay on balls of feet'], tips: ['Great for warm-up or HIIT', 'Engage core throughout', 'Aim for speed'] },
  { name: 'Box Jump', muscle: 'Cardio', secondary: 'Legs', difficulty: 'Intermediate', equipment: 'None', sets: '3', reps: '8-12', restSec: 60, calories: 10, emoji: '📦', instructions: ['Stand in front of sturdy box or platform', 'Swing arms and explosively jump onto box', 'Land softly with both feet', 'Stand fully on top', 'Step down (don\'t jump down)'], tips: ['Start with lower box height', 'Focus on soft landings', 'Step down to protect knees and Achilles'] },
  { name: 'Jump Rope', muscle: 'Cardio', secondary: 'Calves', difficulty: 'Beginner', equipment: 'None', sets: '3', reps: '60 sec', restSec: 45, calories: 14, emoji: '🪢', instructions: ['Hold rope handles at hip level', 'Swing rope overhead and jump as it passes under', 'Jump just high enough to clear the rope', 'Land on balls of feet', 'Keep elbows close to body'], tips: ['One of the best cardio exercises', 'Great for coordination', 'Builds calf endurance'] },
  { name: 'Sprint Intervals', muscle: 'Cardio', secondary: 'Legs', difficulty: 'Advanced', equipment: 'None', sets: '6-10', reps: '20-30 sec sprint', restSec: 60, calories: 20, emoji: '🏃', instructions: ['Warm up thoroughly first', 'Sprint at 90-100% effort for 20-30 seconds', 'Walk or jog for 60 seconds rest', 'Repeat for designated rounds', 'Cool down with easy walking'], tips: ['Most efficient fat-burning cardio', 'Always warm up first', 'Start with fewer rounds and build up'] },
  { name: 'Bear Crawl', muscle: 'Cardio', secondary: 'Core, Shoulders', difficulty: 'Intermediate', equipment: 'None', sets: '3', reps: '30 sec', restSec: 45, calories: 10, emoji: '🐻', instructions: ['Start on hands and knees', 'Lift knees slightly off ground', 'Move opposite hand and foot forward together', 'Keep hips low and stable', 'Continue crawling forward'], tips: ['Incredible core and coordination exercise', 'Keep knees close to ground', 'Try going backwards for extra challenge'] },
  { name: 'Skater Jumps', muscle: 'Cardio', secondary: 'Legs, Glutes', difficulty: 'Intermediate', equipment: 'None', sets: '3', reps: '20 total', restSec: 45, calories: 10, emoji: '⛸️', instructions: ['Stand on one leg', 'Jump laterally to the other leg', 'Land softly on outside leg', 'Touch floor with opposite hand', 'Immediately jump back to other side'], tips: ['Great for lateral stability and agility', 'Land softly and control balance', 'Mimic speed skating motion'] },

  // FLEXIBILITY & MOBILITY (10)
  { name: 'Downward Dog', muscle: 'Flexibility', secondary: 'Shoulders, Calves', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '30-60 sec', restSec: 15, calories: 3, emoji: '🐕', instructions: ['Start on hands and knees', 'Push hips up and back forming inverted V', 'Straighten legs, press heels toward floor', 'Arms shoulder-width, fingers spread', 'Relax head between arms'], tips: ['Foundational yoga pose', 'Pedal feet to warm up calves', 'Don\'t force heels to ground'] },
  { name: 'Pigeon Pose', muscle: 'Flexibility', secondary: 'Glutes', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '30-60 sec each', restSec: 15, calories: 2, emoji: '🐦', instructions: ['From all fours, bring right knee forward behind right wrist', 'Extend left leg straight back', 'Keep hips square to the floor', 'Walk hands forward to deepen stretch', 'Switch sides'], tips: ['Amazing hip opener', 'Use a pillow under hip if needed', 'Don\'t force the stretch'] },
  { name: 'Cat-Cow Stretch', muscle: 'Flexibility', secondary: 'Core, Back', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '10 cycles', restSec: 15, calories: 2, emoji: '🐱', instructions: ['Start on hands and knees', 'Cow: Drop belly, lift chest and tailbone, look up', 'Cat: Round back, tuck chin, pull belly in', 'Flow between positions with breath', 'Inhale for cow, exhale for cat'], tips: ['Great spinal mobility exercise', 'Perfect warm-up for any workout', 'Move with your breath'] },
  { name: 'World\'s Greatest Stretch', muscle: 'Flexibility', secondary: 'Full Body', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '5 each side', restSec: 15, calories: 3, emoji: '🌍', instructions: ['Step into deep lunge position', 'Place inside hand on floor', 'Rotate torso and reach outside arm to ceiling', 'Hold and feel the stretch through hip, torso, and chest', 'Return and switch sides'], tips: ['Opens up everything — hips, thoracic spine, shoulders', 'Best single mobility drill', 'Do before every workout'] },
  { name: 'Hip Flexor Stretch', muscle: 'Flexibility', secondary: 'Legs', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '30-45 sec each', restSec: 15, calories: 2, emoji: '🦵', instructions: ['Kneel on one knee in lunge position', 'Push hips forward gently', 'Feel stretch in front of back hip', 'Keep torso upright', 'Switch sides'], tips: ['Essential for anyone who sits a lot', 'Squeeze back glute for deeper stretch', 'Raise same-side arm overhead for more stretch'] },
  { name: 'Hamstring Stretch', muscle: 'Flexibility', secondary: 'Back', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '30-45 sec each', restSec: 15, calories: 2, emoji: '🧘', instructions: ['Sit on floor with one leg extended', 'Bend other leg with foot against inner thigh', 'Reach forward toward extended foot', 'Keep back straight — hinge at hips', 'Feel stretch along back of thigh'], tips: ['Don\'t bounce', 'Flex foot for deeper hamstring stretch', 'Breathe deeply and relax into it'] },
  { name: 'Thoracic Spine Rotation', muscle: 'Flexibility', secondary: 'Core', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '10 each side', restSec: 15, calories: 2, emoji: '🔄', instructions: ['Lie on side with knees bent at 90 degrees', 'Stack knees together', 'Rotate top arm and torso to opposite side', 'Follow hand with eyes', 'Return and repeat'], tips: ['Critical for upper back mobility', 'Keep knees stacked and still', 'Breathe out as you rotate open'] },
  { name: 'Child\'s Pose', muscle: 'Flexibility', secondary: 'Back', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '30-60 sec', restSec: 15, calories: 2, emoji: '🧒', instructions: ['Kneel on floor, big toes together', 'Sit back on heels', 'Walk hands forward, lowering chest to floor', 'Rest forehead on floor', 'Arms extended or alongside body'], tips: ['Ultimate rest and recovery pose', 'Great for lower back relief', 'Widen knees for deeper hip stretch'] },
  { name: 'Foam Roll (IT Band)', muscle: 'Flexibility', secondary: 'Legs', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '60 sec each', restSec: 15, calories: 2, emoji: '🧻', instructions: ['Lie on side with foam roller under outer thigh', 'Support body with arms and opposite foot', 'Roll slowly from hip to just above knee', 'Pause on tender spots for 20-30 seconds', 'Switch sides'], tips: ['Can be uncomfortable — that\'s normal', 'Don\'t roll directly on joints', 'Essential for runners and cyclists'] },
  { name: 'Neck Stretch', muscle: 'Flexibility', difficulty: 'Beginner', equipment: 'None', sets: '1', reps: '20 sec each', restSec: 10, calories: 1, emoji: '🦒', instructions: ['Sit or stand tall', 'Tilt head to one side bringing ear toward shoulder', 'Gently press with same-side hand', 'Hold stretch', 'Repeat other side, then do forward chin tuck'], tips: ['Be very gentle with neck stretches', 'Never force or bounce', 'Essential for desk workers'] },

  // FULL BODY (6)
  { name: 'Turkish Get-Up', muscle: 'Full Body', secondary: 'Core, Shoulders', difficulty: 'Advanced', equipment: 'Kettlebell', sets: '3', reps: '3 each side', restSec: 90, calories: 10, emoji: '🇹🇷', instructions: ['Lie on back holding kettlebell overhead with one arm', 'Roll to elbow, then to hand', 'Bridge hips up and sweep leg under', 'Kneel, then stand up — all while keeping weight overhead', 'Reverse the steps to lie back down'], tips: ['Learn each step individually first', 'Use light weight or no weight initially', 'Tests mobility, stability, and strength'] },
  { name: 'Thruster', muscle: 'Full Body', secondary: 'Shoulders, Legs', difficulty: 'Intermediate', equipment: 'Dumbbells', sets: '3', reps: '10-12', restSec: 75, calories: 12, emoji: '🚀', instructions: ['Hold dumbbells at shoulder height', 'Perform a front squat', 'As you stand, use momentum to press overhead', 'Lock out at top', 'Lower dumbbells back to shoulders and squat again'], tips: ['Incredibly efficient full-body movement', 'Breathe in on squat, out on press', 'Keep core tight throughout'] },
  { name: 'Clean and Press', muscle: 'Full Body', secondary: 'Shoulders, Back', difficulty: 'Advanced', equipment: 'Barbell', sets: '4', reps: '5-8', restSec: 120, calories: 14, emoji: '🏋️', instructions: ['Start with barbell on floor', 'Perform explosive pull to shoulder height (clean)', 'Catch bar at shoulders in front rack position', 'Press bar overhead', 'Lower to shoulders then to floor'], tips: ['Olympic lifting technique required', 'Start with just the bar', 'Get coaching on form'] },
  { name: 'Kettlebell Swing', muscle: 'Full Body', secondary: 'Glutes, Core', difficulty: 'Intermediate', equipment: 'Kettlebell', sets: '3-4', reps: '15-20', restSec: 60, calories: 12, emoji: '🔔', instructions: ['Stand with feet wider than shoulder-width', 'Hold kettlebell with both hands', 'Hinge at hips and swing KB between legs', 'Drive hips forward explosively swinging KB to chest height', 'Control the backswing'], tips: ['Power comes from hips, NOT arms', 'Keep back flat and core braced', 'Don\'t squat — it\'s a hip hinge'] },
  { name: 'Man Maker', muscle: 'Full Body', difficulty: 'Advanced', equipment: 'Dumbbells', sets: '3', reps: '6-8', restSec: 90, calories: 15, emoji: '💀', instructions: ['Start standing holding dumbbells', 'Place dumbbells down and jump to plank', 'Perform a push-up', 'Row each dumbbell (renegade row)', 'Jump feet to hands and perform a thruster'], tips: ['The hardest exercise on this list', 'Use light dumbbells — it\'s brutal', 'Rest as needed between reps'] },
  { name: 'Battle Ropes', muscle: 'Full Body', secondary: 'Core, Shoulders', difficulty: 'Intermediate', equipment: 'None', sets: '4', reps: '30 sec', restSec: 45, calories: 14, emoji: '🪢', instructions: ['Grip rope ends in each hand, athletic stance', 'Create alternating waves by rapidly raising and lowering arms', 'Keep core tight and knees slightly bent', 'Maintain consistent wave amplitude', 'Try different patterns — alternating, double, slams'], tips: ['Incredible conditioning tool', 'Keep waves going all the way to anchor point', 'Experiment with different movements'] },
];

const muscleGroups: MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes', 'Calves', 'Forearms', 'Full Body', 'Cardio', 'Flexibility'];
const difficulties: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];
const muscleColors: Record<string, string> = {
  Chest: 'from-red-500 to-pink-500',
  Back: 'from-blue-500 to-indigo-500',
  Shoulders: 'from-orange-500 to-amber-500',
  Biceps: 'from-purple-500 to-violet-500',
  Triceps: 'from-fuchsia-500 to-pink-500',
  Legs: 'from-emerald-500 to-teal-500',
  Core: 'from-yellow-500 to-orange-500',
  Glutes: 'from-rose-500 to-red-500',
  Calves: 'from-teal-500 to-cyan-500',
  Forearms: 'from-amber-500 to-yellow-500',
  'Full Body': 'from-violet-500 to-purple-500',
  Cardio: 'from-cyan-500 to-blue-500',
  Flexibility: 'from-green-500 to-emerald-500',
};

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

export default function ExerciseLibraryPage() {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Exercise Library</h1>
          <p className="text-muted-foreground">{exercises.length} exercises with step-by-step instructions, muscle groups & tips</p>
        </div>

        {/* Search + Filter Toggle */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search exercises, muscle groups..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="w-4 h-4" /> Filters
            {(selectedMuscle !== 'All' || selectedDifficulty !== 'All') && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </Button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-6 space-y-4 overflow-hidden">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Muscle Group</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedMuscle('All')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedMuscle === 'All' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    All ({exercises.length})
                  </button>
                  {muscleGroups.map(m => (
                    <button key={m} onClick={() => setSelectedMuscle(m)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedMuscle === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {m} ({muscleCount[m] || 0})
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Difficulty</p>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedDifficulty('All')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedDifficulty === 'All' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    All
                  </button>
                  {difficulties.map(d => (
                    <button key={d} onClick={() => setSelectedDifficulty(d)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedDifficulty === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">{filtered.length} exercises found</p>

        {/* Exercise Grid */}
        <motion.div className="space-y-3" variants={container} initial="hidden" animate="visible" key={`${selectedMuscle}-${selectedDifficulty}-${search}`}>
          {filtered.map((ex, i) => {
            const isExpanded = expandedIndex === i;
            const gradient = muscleColors[ex.muscle] || 'from-primary to-secondary';
            return (
              <motion.div key={ex.name} variants={item}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/20 transition-all">
                {/* Header row */}
                <button onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  className="w-full flex items-center gap-4 p-4 text-left">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shrink-0 text-2xl`}>
                    {ex.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{ex.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{ex.muscle}</span>
                      {ex.secondary && <span className="text-xs text-muted-foreground hidden sm:inline">+ {ex.secondary}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ex.difficulty === 'Beginner' ? 'bg-success/15 text-success' : ex.difficulty === 'Intermediate' ? 'bg-warning/15 text-warning' : 'bg-destructive/15 text-destructive'}`}>
                        {ex.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    <div className="flex items-center gap-1"><Target className="w-3 h-3" />{ex.sets}×{ex.reps}</div>
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{ex.restSec}s rest</div>
                    <div className="flex items-center gap-1"><Flame className="w-3 h-3" />~{ex.calories} cal</div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
                </button>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="px-4 pb-5 pt-1 space-y-4 border-t border-border">
                        {/* Quick stats for mobile */}
                        <div className="flex sm:hidden gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Target className="w-3 h-3" />{ex.sets}×{ex.reps}</div>
                          <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{ex.restSec}s rest</div>
                          <div className="flex items-center gap-1"><Flame className="w-3 h-3" />~{ex.calories} cal</div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          {/* Info cards */}
                          <div className="space-y-3">
                            <div className="bg-muted/30 rounded-xl p-4">
                              <h4 className="text-sm font-semibold mb-1 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Targets</h4>
                              <p className="text-sm text-muted-foreground"><strong>Primary:</strong> {ex.muscle}</p>
                              {ex.secondary && <p className="text-sm text-muted-foreground"><strong>Secondary:</strong> {ex.secondary}</p>}
                            </div>
                            <div className="bg-muted/30 rounded-xl p-4">
                              <h4 className="text-sm font-semibold mb-1 flex items-center gap-2"><Dumbbell className="w-4 h-4 text-primary" /> Equipment</h4>
                              <p className="text-sm text-muted-foreground">{ex.equipment}</p>
                            </div>
                            <div className="bg-muted/30 rounded-xl p-4">
                              <h4 className="text-sm font-semibold mb-1 flex items-center gap-2"><Star className="w-4 h-4 text-warning" /> Pro Tips</h4>
                              <ul className="space-y-1">
                                {ex.tips.map((tip, j) => (
                                  <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />{tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Instructions */}
                          <div className="bg-muted/30 rounded-xl p-4">
                            <h4 className="text-sm font-semibold mb-3">Step-by-Step Instructions</h4>
                            <ol className="space-y-2">
                              {ex.instructions.map((step, j) => (
                                <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground">
                                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{j + 1}</span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Dumbbell className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No exercises found</h3>
            <p className="text-muted-foreground">Try different search terms or filters</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
