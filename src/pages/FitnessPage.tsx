import { useState } from 'react';
import { Apple, Dumbbell, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { FloatingBackground } from '@/components/FloatingBackground';
import { ParticleBackground } from '@/components/ParticleBackground';
import { ScrollReveal } from '@/components/ScrollReveal';
import { cn } from '@/lib/utils';

type Tab = 'diet' | 'workout';

export default function FitnessPage() {
  const [tab, setTab] = useState<Tab>('diet');
  const { toast } = useToast();
  const dietAI = useAIStream({ type: 'diet-plan' });
  const workoutAI = useAIStream({ type: 'workout-plan' });

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('moderate');
  const [injuries, setInjuries] = useState('');
  const [conditions, setConditions] = useState('');

  const [dietGoal, setDietGoal] = useState('weight-loss');
  const [dietType, setDietType] = useState('no-preference');
  const [allergies, setAllergies] = useState('');
  const [cuisine, setCuisine] = useState('any');
  const [mealsPerDay, setMealsPerDay] = useState('3');
  const [cookingSkill, setCookingSkill] = useState('intermediate');
  const [budget, setBudget] = useState('medium');
  const [dislikedFoods, setDislikedFoods] = useState('');
  const [dietCustom, setDietCustom] = useState('');
  const [targetCalories, setTargetCalories] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [supplements, setSupplements] = useState('');

  const [workoutGoal, setWorkoutGoal] = useState('strength');
  const [level, setLevel] = useState('beginner');
  const [muscles, setMuscles] = useState<string[]>([]);
  const [days, setDays] = useState('3');
  const [equipment, setEquipment] = useState('full-gym');
  const [time, setTime] = useState('60');
  const [trainingStyle, setTrainingStyle] = useState('balanced');
  const [workoutCustom, setWorkoutCustom] = useState('');
  const [cardioPreference, setCardioPreference] = useState('moderate');
  const [warmupCooldown, setWarmupCooldown] = useState('yes');
  const [restDayActivity, setRestDayActivity] = useState('');

  const bmi = (() => {
    const w = parseFloat(weight), h = parseFloat(height) / 100;
    return w && h ? (w / (h * h)).toFixed(1) : '—';
  })();

  const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes', 'Full Body'];
  const toggleMuscle = (m: string) => setMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  const [customMuscle, setCustomMuscle] = useState('');

  const handleDiet = async () => {
    if (!age || !weight || !height) { toast({ title: 'Fill in age, weight, height', variant: 'destructive' }); return; }
    const prompt = `Create a personalized **meal plan** for one full day (with variety notes for the week):
- Age: ${age}, Gender: ${gender}, Weight: ${weight}kg, Height: ${height}cm, BMI: ${bmi}
- Goal: ${dietGoal}, Diet: ${dietType}, Activity: ${activity}
- Cuisine: ${cuisine}, Meals/day: ${mealsPerDay}, Cooking: ${cookingSkill}, Budget: ${budget}
${targetCalories ? `- Target calories: ${targetCalories}` : ''}
${waterIntake ? `- Current water intake: ${waterIntake}L/day` : ''}
${supplements ? `- Current supplements: ${supplements}` : ''}
${allergies ? `- Allergies: ${allergies}` : ''}${conditions ? `\n- Conditions: ${conditions}` : ''}${dislikedFoods ? `\n- Disliked: ${dislikedFoods}` : ''}${dietCustom ? `\n- Custom notes: ${dietCustom}` : ''}

IMPORTANT: Do NOT prescribe any medications or supplements that require a prescription.

Keep it practical. For each meal include: dish name, ingredients, approx calories and protein. End with a brief weekly grocery list estimate and hydration target.`;
    try { await dietAI.stream([{ role: 'user', content: prompt }]); 
      saveReport('diet', 'Diet Plan Generated', dietGoal);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const handleWorkout = async () => {
    const allMuscles = [...muscles, ...(customMuscle ? [customMuscle] : [])];
    const prompt = `Create a focused **${days}-day weekly workout plan**:
- Age: ${age || 'N/A'}, Gender: ${gender}, Weight: ${weight || 'N/A'}kg, Height: ${height || 'N/A'}cm
- Goal: ${workoutGoal}, Level: ${level}, Style: ${trainingStyle}
- Muscles: ${allMuscles.length > 0 ? allMuscles.join(', ') : 'Full Body'}
- Equipment: ${equipment}, Time: ${time}min/session, Activity: ${activity}
- Cardio preference: ${cardioPreference}
- Include warmup/cooldown: ${warmupCooldown}
${restDayActivity ? `- Rest day activities: ${restDayActivity}` : ''}
${injuries ? `- Injuries: ${injuries}` : ''}${workoutCustom ? `\n- Custom notes: ${workoutCustom}` : ''}

IMPORTANT: Do NOT recommend performance-enhancing drugs or prescription supplements.

For each day: exercise name, sets × reps, rest time, brief form cue. Keep exercises practical and safe for the stated level. Include progressive overload notes.`;
    try { await workoutAI.stream([{ role: 'user', content: prompt }]);
      saveReport('workout', 'Workout Plan Generated', workoutGoal);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const saveReport = (type: string, title: string, goal: string) => {
    const existing = JSON.parse(localStorage.getItem('healthier-reports') || '[]');
    existing.push({ id: `${type}-${Date.now()}`, type, title, date: new Date().toISOString().split('T')[0], summary: `Goal: ${goal}`, details: '' });
    localStorage.setItem('healthier-reports', JSON.stringify(existing));
  };

  const ai = tab === 'diet' ? dietAI : workoutAI;

  return (
    <div className="relative">
      <FloatingBackground variant="fitness" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            icon={tab === 'diet' ? <Apple className="h-8 w-8 text-primary-foreground" /> : <Dumbbell className="h-8 w-8 text-primary-foreground" />}
            title="Fitness & Nutrition Planner"
            description="Get AI-powered workout routines and personalized meal plans"
            gradient="from-primary to-success"
            showEmergency={false}
          />

          <ScrollReveal>
            <div className="flex gap-2 mb-6">
              <button onClick={() => setTab('diet')} className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                tab === 'diet' ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:shadow-soft')}>
                <Apple className="w-5 h-5" /> Diet Plan
              </button>
              <button onClick={() => setTab('workout')} className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                tab === 'workout' ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:shadow-soft')}>
                <Dumbbell className="w-5 h-5" /> Workout Plan
              </button>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <ScrollReveal delay={0.1}>
                <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4 hover:shadow-elevated transition-shadow duration-300">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Body Stats</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Age</Label><Input type="number" placeholder="25" value={age} onChange={e => setAge(e.target.value)} /></div>
                    <div><Label>Weight (kg)</Label><Input type="number" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)} /></div>
                    <div><Label>Height (cm)</Label><Input type="number" placeholder="175" value={height} onChange={e => setHeight(e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Gender</Label><ChipSelect options={['male', 'female']} value={gender} onChange={setGender} customPlaceholder="Enter gender..." /></div>
                    <div><Label>BMI</Label><div className="mt-2 px-4 py-2 rounded-lg bg-muted text-center font-bold text-lg">{bmi}</div></div>
                  </div>
                  <div><Label>Activity Level</Label><ChipSelect options={['sedentary', 'light', 'moderate', 'active', 'very-active']} value={activity} onChange={setActivity} customPlaceholder="Describe your activity level..." /></div>
                  <div><Label>Medical Conditions</Label><Input placeholder="Diabetes, hypertension..." value={conditions} onChange={e => setConditions(e.target.value)} /></div>
                  <div><Label>Injuries</Label><Input placeholder="Bad knee, shoulder..." value={injuries} onChange={e => setInjuries(e.target.value)} /></div>
                </div>
              </ScrollReveal>

              {tab === 'diet' ? (
                <ScrollReveal delay={0.2}>
                  <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4 hover:shadow-elevated transition-shadow duration-300">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Diet Preferences</h3>
                    <div><Label>Goal</Label><ChipSelect options={['weight-loss', 'weight-gain', 'muscle-building', 'maintenance', 'heart-health', 'gut-health']} value={dietGoal} onChange={setDietGoal} customPlaceholder="Your specific diet goal..." /></div>
                    <div><Label>Diet Type</Label><ChipSelect options={['no-preference', 'vegetarian', 'vegan', 'keto', 'mediterranean', 'paleo', 'gluten-free']} value={dietType} onChange={setDietType} customPlaceholder="Your specific diet type..." /></div>
                    <div><Label>Cuisine</Label><ChipSelect options={['any', 'indian', 'western', 'asian', 'mediterranean', 'mexican']} value={cuisine} onChange={setCuisine} customPlaceholder="Your preferred cuisine..." /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><Label>Meals/Day</Label><ChipSelect options={['2', '3', '4', '5']} value={mealsPerDay} onChange={setMealsPerDay} customPlaceholder="Custom..." /></div>
                      <div><Label>Cooking</Label><ChipSelect options={['beginner', 'intermediate', 'advanced']} value={cookingSkill} onChange={setCookingSkill} customPlaceholder="Your level..." /></div>
                      <div><Label>Budget</Label><ChipSelect options={['low', 'medium', 'high']} value={budget} onChange={setBudget} customPlaceholder="Budget..." /></div>
                    </div>
                    <div><Label>Allergies</Label><Input placeholder="Nuts, dairy, shellfish..." value={allergies} onChange={e => setAllergies(e.target.value)} /></div>
                    <div><Label>Disliked Foods</Label><Input placeholder="Mushrooms, olives..." value={dislikedFoods} onChange={e => setDislikedFoods(e.target.value)} /></div>
                    <div><Label>Target Calories (optional)</Label><Input type="number" placeholder="2000" value={targetCalories} onChange={e => setTargetCalories(e.target.value)} /></div>
                    <div><Label>Current Water Intake (L/day)</Label><Input type="number" step="0.1" placeholder="2.0" value={waterIntake} onChange={e => setWaterIntake(e.target.value)} /></div>
                    <div><Label>Current Supplements</Label><Input placeholder="Whey protein, creatine, multivitamin..." value={supplements} onChange={e => setSupplements(e.target.value)} /></div>
                    <div><Label>Custom Diet Notes</Label><Textarea placeholder="Intermittent fasting, preferred snacks, specific calorie targets..." value={dietCustom} onChange={e => setDietCustom(e.target.value)} rows={2} /></div>
                  </div>
                </ScrollReveal>
              ) : (
                <ScrollReveal delay={0.2}>
                  <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4 hover:shadow-elevated transition-shadow duration-300">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Workout Preferences</h3>
                    <div><Label>Goal</Label><ChipSelect options={['strength', 'muscle-building', 'weight-loss', 'endurance', 'flexibility', 'general-fitness']} value={workoutGoal} onChange={setWorkoutGoal} customPlaceholder="Your specific workout goal..." /></div>
                    <div><Label>Level</Label><ChipSelect options={['beginner', 'intermediate', 'advanced', 'returning']} value={level} onChange={setLevel} customPlaceholder="Describe your level..." /></div>
                    <div><Label>Style</Label><ChipSelect options={['balanced', 'hypertrophy', 'HIIT', 'powerlifting', 'circuit']} value={trainingStyle} onChange={setTrainingStyle} customPlaceholder="Your preferred style..." /></div>
                    <div>
                      <Label>Target Muscles</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {muscleGroups.map(m => (
                          <button key={m} onClick={() => toggleMuscle(m)}
                            className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95",
                              muscles.includes(m) ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:shadow-soft')}>
                            {m}
                          </button>
                        ))}
                      </div>
                      <Input className="mt-2" placeholder="Other muscle groups..." value={customMuscle} onChange={e => setCustomMuscle(e.target.value)} />
                    </div>
                    <div><Label>Equipment</Label><ChipSelect options={['bodyweight', 'dumbbells', 'resistance-bands', 'full-gym', 'home-gym']} value={equipment} onChange={setEquipment} customPlaceholder="Your available equipment..." /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Days/Week</Label>
                        <div className="flex gap-2 mt-2">
                          {['2', '3', '4', '5', '6'].map(d => (
                            <button key={d} onClick={() => setDays(d)}
                              className={cn("w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 hover:scale-110 active:scale-95",
                                days === d ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-muted text-muted-foreground hover:shadow-soft')}>
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div><Label>Time (min)</Label><Input type="number" placeholder="60" value={time} onChange={e => setTime(e.target.value)} className="mt-2" /></div>
                    </div>
                    <div><Label>Cardio Preference</Label><ChipSelect options={['none', 'light', 'moderate', 'intense']} value={cardioPreference} onChange={setCardioPreference} customPlaceholder="Your cardio preference..." /></div>
                    <div><Label>Include Warmup/Cooldown?</Label><ChipSelect options={['yes', 'no']} value={warmupCooldown} onChange={setWarmupCooldown} allowCustom={false} /></div>
                    <div><Label>Rest Day Activities</Label><Input placeholder="Walking, yoga, swimming..." value={restDayActivity} onChange={e => setRestDayActivity(e.target.value)} /></div>
                    <div><Label>Custom Workout Notes</Label><Textarea placeholder="Focus on pull-ups, avoid running, include stretching, prefer supersets..." value={workoutCustom} onChange={e => setWorkoutCustom(e.target.value)} rows={2} /></div>
                  </div>
                </ScrollReveal>
              )}

              <ScrollReveal delay={0.3}>
                <Button onClick={tab === 'diet' ? handleDiet : handleWorkout} disabled={ai.isLoading} className="w-full hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200" size="lg">
                  {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate {tab === 'diet' ? 'Meal' : 'Workout'} Plan</>}
                </Button>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.15} direction="right">
              <AIResponseCard
                content={ai.response}
                isLoading={ai.isLoading}
                icon={tab === 'diet' ? <Apple className="h-5 w-5 text-primary" /> : <Dumbbell className="h-5 w-5 text-primary" />}
                title={tab === 'diet' ? 'Your Meal Plan' : 'Your Workout Plan'}
                maxHeight="700px"
                emptyIcon={tab === 'diet' ? <Apple className="h-16 w-16" /> : <Dumbbell className="h-16 w-16" />}
                emptyTitle="No Plan Generated"
                emptyDescription="Fill in your details and generate a plan"
                disclaimerText="Consult a healthcare provider before starting new diet or exercise programs."
              />
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
