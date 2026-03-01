import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

export default function WorkoutPlannerPage() {
  const [goal, setGoal] = useState('strength');
  const [level, setLevel] = useState('beginner');
  const [muscles, setMuscles] = useState<string[]>([]);
  const [days, setDays] = useState('3');
  const [plan, setPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const goals = ['strength', 'muscle-building', 'weight-loss', 'endurance', 'flexibility', 'general-fitness'];
  const levels = ['beginner', 'intermediate', 'advanced'];
  const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes', 'Full Body'];

  const toggleMuscle = (m: string) => setMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  const handleGenerate = async () => {
    setIsLoading(true); setPlan(null);
    const prompt = `Create a ${days}-day weekly workout plan. Goal: ${goal}. Level: ${level}. Target muscles: ${muscles.length > 0 ? muscles.join(', ') : 'Full Body'}. Include sets, reps, rest periods, warm-up and cool-down for each day.`;
    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'workout-plan' }),
      });
      if (!response.ok || !response.body) throw new Error('Failed');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '', fullContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx); buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ') || line.trim() === '') continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try { const p = JSON.parse(jsonStr); const c = p.choices?.[0]?.delta?.content; if (c) { fullContent += c; setPlan(fullContent); } } catch { buffer = line + '\n' + buffer; break; }
        }
      }
    } catch { toast({ title: 'Error', description: 'Failed to generate workout plan.', variant: 'destructive' }); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-yellow-500">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">AI Workout Planner</h1>
          <p className="text-muted-foreground">Get a customized workout routine for your fitness goals</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">Goal</label>
                <div className="flex flex-wrap gap-2">
                  {goals.map(g => (
                    <button key={g} onClick={() => setGoal(g)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${goal === g ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {g.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Fitness Level</label>
                <div className="flex gap-2">
                  {levels.map(l => (
                    <button key={l} onClick={() => setLevel(l)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex-1 ${level === l ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Target Muscles</label>
                <div className="flex flex-wrap gap-2">
                  {muscleGroups.map(m => (
                    <button key={m} onClick={() => toggleMuscle(m)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${muscles.includes(m) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Days per Week</label>
                <div className="flex gap-2">
                  {['2', '3', '4', '5', '6'].map(d => (
                    <button key={d} onClick={() => setDays(d)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${days === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Dumbbell className="mr-2 h-4 w-4" />Generate Workout Plan</>}
            </Button>
          </div>

          <div className="space-y-4">
            {plan ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[600px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Dumbbell className="h-5 w-5 text-primary" />Your Workout Plan</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{plan}</p>
              </motion.div>
            ) : (
              <div className="bg-card rounded-2xl p-12 border border-border shadow-soft text-center">
                <Dumbbell className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Plan Generated</h3>
                <p className="text-muted-foreground">Set your preferences and click generate</p>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">Consult a healthcare provider before starting a new exercise program, especially if you have health conditions.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
