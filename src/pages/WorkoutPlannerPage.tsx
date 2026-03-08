import { useState } from 'react';
import { Dumbbell, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { cn } from '@/lib/utils';

export default function WorkoutPlannerPage() {
  const [form, setForm] = useState({
    age: '', weight: '', height: '', gender: 'male',
    goal: 'strength', level: 'beginner',
    muscles: [] as string[], days: '3', injuries: '',
    equipment: 'full-gym', time: '60', location: 'gym',
    sleepQuality: 'good', stressLevel: 'moderate',
    cardioPreference: 'moderate', flexibilityGoal: 'yes',
    trainingStyle: 'balanced', restDayActivity: 'light-walk',
    supplements: '', currentRoutine: '', fitnessGoalTimeline: '3-months',
    bodyFatGoal: '', warmupPreference: 'dynamic',
  });
  const { toast } = useToast();
  const ai = useAIStream({ type: 'workout-plan' });

  const goals = ['strength', 'muscle-building', 'weight-loss', 'endurance', 'flexibility', 'general-fitness', 'athletic-performance', 'rehabilitation'];
  const levels = ['beginner', 'intermediate', 'advanced', 'returning-after-break'];
  const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes', 'Calves', 'Forearms', 'Full Body'];
  const equipments = ['bodyweight', 'dumbbells', 'resistance-bands', 'full-gym', 'home-gym', 'kettlebells'];
  const locations = ['gym', 'home', 'outdoor', 'hotel', 'office'];

  const toggleMuscle = (m: string) => setForm(prev => ({
    ...prev, muscles: prev.muscles.includes(m) ? prev.muscles.filter(x => x !== m) : [...prev.muscles, m],
  }));

  const handleGenerate = async () => {
    const prompt = `Create a comprehensive **${form.days}-day weekly workout plan**:
- Age: ${form.age || 'Not specified'}, Gender: ${form.gender}
- Weight: ${form.weight || 'Not specified'}kg, Height: ${form.height || 'Not specified'}cm
- Goal: ${form.goal}, Level: ${form.level}
- Target Muscles: ${form.muscles.length > 0 ? form.muscles.join(', ') : 'Full Body'}
- Equipment: ${form.equipment}, Location: ${form.location}
- Time Available: ${form.time} minutes per session
- Training Style: ${form.trainingStyle}
- Cardio Preference: ${form.cardioPreference}
- Flexibility Training: ${form.flexibilityGoal}
- Sleep Quality: ${form.sleepQuality}
- Stress Level: ${form.stressLevel}
- Rest Day Activity: ${form.restDayActivity}
- Warmup Style: ${form.warmupPreference}
- Timeline: ${form.fitnessGoalTimeline}
${form.injuries ? `- Injury History: ${form.injuries}` : ''}
${form.supplements ? `- Supplements: ${form.supplements}` : ''}
${form.currentRoutine ? `- Current Routine: ${form.currentRoutine}` : ''}
${form.bodyFatGoal ? `- Body Fat Goal: ${form.bodyFatGoal}%` : ''}

For EACH day include:
1. **Warmup** (5-10 min with specific movements)
2. **Main exercises** with sets, reps, rest periods, tempo, and form tips
3. **Supersets/circuits** where appropriate
4. **Cool down** and stretching
5. **Progressive overload** notes

Also include:
- Weekly volume breakdown per muscle group
- Cardio integration plan
- Recovery & mobility routine
- Nutrition timing around workouts
- 4-week progression protocol
- Deload week guidance
- Safety notes`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', description: 'Failed to generate workout plan.', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={<Dumbbell className="h-8 w-8 text-primary-foreground" />}
          title="AI Workout Planner"
          description="Get a customized workout routine with warmup, exercises, progression & recovery"
          gradient="from-warning to-accent"
          showEmergency={false}
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-5">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Body Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Age</Label><Input type="number" placeholder="25" value={form.age} onChange={e => setForm({...form, age: e.target.value})} /></div>
                <div><Label>Gender</Label><ChipSelect options={['male', 'female']} value={form.gender} onChange={v => setForm({...form, gender: v})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Weight (kg)</Label><Input type="number" placeholder="70" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} /></div>
                <div><Label>Height (cm)</Label><Input type="number" placeholder="175" value={form.height} onChange={e => setForm({...form, height: e.target.value})} /></div>
              </div>
              <div><Label>Body Fat Goal (%)</Label><Input type="number" placeholder="15 (optional)" value={form.bodyFatGoal} onChange={e => setForm({...form, bodyFatGoal: e.target.value})} /></div>

              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide pt-2">Training Preferences</h3>
              <div><Label>Goal</Label><ChipSelect options={goals} value={form.goal} onChange={v => setForm({...form, goal: v})} /></div>
              <div><Label>Fitness Level</Label><ChipSelect options={levels} value={form.level} onChange={v => setForm({...form, level: v})} /></div>
              <div><Label>Training Style</Label><ChipSelect options={['strength-focused', 'balanced', 'hypertrophy', 'circuit-training', 'HIIT', 'powerlifting']} value={form.trainingStyle} onChange={v => setForm({...form, trainingStyle: v})} /></div>
              <div><Label>Timeline</Label><ChipSelect options={['1-month', '3-months', '6-months', '1-year']} value={form.fitnessGoalTimeline} onChange={v => setForm({...form, fitnessGoalTimeline: v})} /></div>

              <div>
                <Label>Target Muscles</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {muscleGroups.map(m => (
                    <button key={m} onClick={() => toggleMuscle(m)}
                      className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                        form.muscles.includes(m) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div><Label>Equipment</Label><ChipSelect options={equipments} value={form.equipment} onChange={v => setForm({...form, equipment: v})} /></div>
              <div><Label>Location</Label><ChipSelect options={locations} value={form.location} onChange={v => setForm({...form, location: v})} /></div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Days per Week</Label>
                  <div className="flex gap-2 mt-2">
                    {['2', '3', '4', '5', '6'].map(d => (
                      <button key={d} onClick={() => setForm({...form, days: d})}
                        className={cn("w-10 h-10 rounded-full text-sm font-medium transition-all",
                          form.days === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div><Label>Time (min)</Label><Input type="number" placeholder="60" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="mt-2" /></div>
              </div>

              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide pt-2">Recovery & Lifestyle</h3>
              <div><Label>Cardio Preference</Label><ChipSelect options={['none', 'light', 'moderate', 'intense']} value={form.cardioPreference} onChange={v => setForm({...form, cardioPreference: v})} /></div>
              <div><Label>Include Flexibility/Mobility?</Label><ChipSelect options={['yes', 'no', 'yoga-style']} value={form.flexibilityGoal} onChange={v => setForm({...form, flexibilityGoal: v})} /></div>
              <div><Label>Warmup Preference</Label><ChipSelect options={['dynamic', 'static', 'foam-rolling', 'minimal']} value={form.warmupPreference} onChange={v => setForm({...form, warmupPreference: v})} /></div>
              <div><Label>Rest Day Activity</Label><ChipSelect options={['complete-rest', 'light-walk', 'yoga', 'stretching', 'swimming']} value={form.restDayActivity} onChange={v => setForm({...form, restDayActivity: v})} /></div>
              <div><Label>Sleep Quality</Label><ChipSelect options={['poor', 'fair', 'good', 'excellent']} value={form.sleepQuality} onChange={v => setForm({...form, sleepQuality: v})} /></div>
              <div><Label>Stress Level</Label><ChipSelect options={['low', 'moderate', 'high']} value={form.stressLevel} onChange={v => setForm({...form, stressLevel: v})} /></div>

              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide pt-2">Additional Info</h3>
              <div><Label>Injury History</Label><Input placeholder="Bad knee, lower back issues, shoulder impingement..." value={form.injuries} onChange={e => setForm({...form, injuries: e.target.value})} /></div>
              <div><Label>Current Supplements</Label><Input placeholder="Creatine, protein powder, BCAAs..." value={form.supplements} onChange={e => setForm({...form, supplements: e.target.value})} /></div>
              <div><Label>Current Routine (if any)</Label><Textarea placeholder="Describe what you currently do for exercise..." value={form.currentRoutine} onChange={e => setForm({...form, currentRoutine: e.target.value})} rows={2} /></div>
            </div>
            <Button onClick={handleGenerate} disabled={ai.isLoading} className="w-full" size="lg">
              {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Workout Plan</>}
            </Button>
          </div>

          <AIResponseCard
            content={ai.response}
            isLoading={ai.isLoading}
            icon={<Dumbbell className="h-5 w-5 text-primary" />}
            title="Your Workout Plan"
            maxHeight="700px"
            emptyIcon={<Dumbbell className="h-16 w-16" />}
            emptyTitle="No Plan Generated"
            emptyDescription="Set your preferences and click generate"
            disclaimerText="Consult a healthcare provider before starting a new exercise program, especially if you have health conditions."
          />
        </div>
      </div>
    </div>
  );
}
