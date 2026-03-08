import { useState } from 'react';
import { Dumbbell, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { cn } from '@/lib/utils';

export default function WorkoutPlannerPage() {
  const [form, setForm] = useState({
    age: '', weight: '', goal: 'strength', level: 'beginner',
    muscles: [] as string[], days: '3', injuries: '',
    equipment: 'full-gym', time: '60', location: 'gym',
  });
  const { toast } = useToast();
  const ai = useAIStream({ type: 'workout-plan' });

  const goals = ['strength', 'muscle-building', 'weight-loss', 'endurance', 'flexibility', 'general-fitness'];
  const levels = ['beginner', 'intermediate', 'advanced'];
  const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes', 'Full Body'];
  const equipments = ['bodyweight', 'dumbbells', 'resistance-bands', 'full-gym', 'home-gym'];
  const locations = ['gym', 'home', 'outdoor', 'hotel'];

  const toggleMuscle = (m: string) => setForm(prev => ({
    ...prev, muscles: prev.muscles.includes(m) ? prev.muscles.filter(x => x !== m) : [...prev.muscles, m],
  }));

  const handleGenerate = async () => {
    const prompt = `Create a comprehensive **${form.days}-day weekly workout plan**:
- Age: ${form.age || 'Not specified'}, Weight: ${form.weight || 'Not specified'}kg
- Goal: ${form.goal}, Level: ${form.level}
- Target Muscles: ${form.muscles.length > 0 ? form.muscles.join(', ') : 'Full Body'}
- Equipment: ${form.equipment}, Location: ${form.location}
- Time Available: ${form.time} minutes per session
${form.injuries ? `- Injury History: ${form.injuries}` : ''}

For EACH day include:
1. **Warmup** (5-10 min with specific movements)
2. **Main exercises** with sets, reps, rest periods, and form tips
3. **Cool down** and stretching
4. **Progressive overload** notes

Also include: weekly progression plan, safety notes, and recovery recommendations.`;

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
          description="Get a customized workout routine with warmup, exercises, and progression"
          gradient="from-warning to-accent"
          showEmergency={false}
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Age</Label><Input type="number" placeholder="25" value={form.age} onChange={e => setForm({...form, age: e.target.value})} /></div>
                <div><Label>Weight (kg)</Label><Input type="number" placeholder="70" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} /></div>
              </div>

              <div><Label>Goal</Label><ChipSelect options={goals} value={form.goal} onChange={v => setForm({...form, goal: v})} /></div>
              <div><Label>Fitness Level</Label><ChipSelect options={levels} value={form.level} onChange={v => setForm({...form, level: v})} /></div>

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

              <div><Label>Injury History (optional)</Label><Input placeholder="Bad knee, lower back issues..." value={form.injuries} onChange={e => setForm({...form, injuries: e.target.value})} /></div>
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
