import { useState } from 'react';
import { motion } from 'framer-motion';
import { Apple, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

export default function DietPlannerPage() {
  const [form, setForm] = useState({
    age: '', gender: 'male', weight: '', height: '', bmi: '',
    goal: 'weight-loss', diet: 'no-preference', allergies: '',
    conditions: '', activity: 'moderate', budget: 'medium', cuisine: 'any',
  });
  const [plan, setPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const goals = ['weight-loss', 'weight-gain', 'muscle-building', 'maintenance', 'heart-health', 'diabetes-friendly'];
  const diets = ['no-preference', 'vegetarian', 'vegan', 'keto', 'mediterranean', 'paleo', 'gluten-free'];
  const activityLevels = ['sedentary', 'light', 'moderate', 'active', 'very-active'];
  const budgets = ['low', 'medium', 'high'];
  const cuisines = ['any', 'indian', 'western', 'asian', 'mediterranean', 'mexican'];

  // Auto-calculate BMI
  const calcBMI = (w: string, h: string) => {
    const wn = parseFloat(w), hn = parseFloat(h) / 100;
    if (wn && hn) return (wn / (hn * hn)).toFixed(1);
    return '';
  };

  const updateField = (key: string, value: string) => {
    const next = { ...form, [key]: value };
    if (key === 'weight' || key === 'height') next.bmi = calcBMI(key === 'weight' ? value : form.weight, key === 'height' ? value : form.height);
    setForm(next);
  };

  const handleGenerate = async () => {
    if (!form.age || !form.weight || !form.height) {
      toast({ title: 'Missing info', description: 'Please fill in age, weight, and height.', variant: 'destructive' });
      return;
    }
    setIsLoading(true); setPlan(null);

    const prompt = `Create a comprehensive 7-day meal plan for:
- Age: ${form.age}, Gender: ${form.gender}
- Weight: ${form.weight}kg, Height: ${form.height}cm, BMI: ${form.bmi}
- Goal: ${form.goal}, Diet: ${form.diet}
- Activity Level: ${form.activity}
- Budget: ${form.budget}, Cuisine: ${form.cuisine}
${form.allergies ? `- Allergies: ${form.allergies}` : ''}
${form.conditions ? `- Medical Conditions: ${form.conditions}` : ''}

Include for EACH day: Breakfast, Morning Snack, Lunch, Evening Snack, Dinner.
For each meal include: name, ingredients, approximate calories, protein estimate.
Also include: daily calorie total, hydration advice, vitamin suggestions, and a weekly grocery summary at the end.
Format with clear day headers and meal sections.`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'diet-plan' }),
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
    } catch { toast({ title: 'Error', description: 'Failed to generate plan.', variant: 'destructive' }); }
    finally { setIsLoading(false); }
  };

  const ChipSelect = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${value === o ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
          {o.replace(/-/g, ' ')}
        </button>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500">
            <Apple className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">AI Diet Planner</h1>
          <p className="text-muted-foreground">Get a personalized 7-day meal plan with calories, protein, and grocery list</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Age</Label><Input type="number" placeholder="25" value={form.age} onChange={e => updateField('age', e.target.value)} /></div>
                <div><Label>Weight (kg)</Label><Input type="number" placeholder="70" value={form.weight} onChange={e => updateField('weight', e.target.value)} /></div>
                <div><Label>Height (cm)</Label><Input type="number" placeholder="175" value={form.height} onChange={e => updateField('height', e.target.value)} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Gender</Label>
                  <div className="flex gap-2 mt-2">
                    {['male', 'female'].map(g => (
                      <button key={g} onClick={() => updateField('gender', g)}
                        className={`flex-1 px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${form.gender === g ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>BMI (auto)</Label>
                  <div className="mt-2 px-4 py-2 rounded-lg bg-muted text-center font-bold text-lg">
                    {form.bmi || '—'}
                  </div>
                </div>
              </div>

              <div><Label>Goal</Label><ChipSelect options={goals} value={form.goal} onChange={v => updateField('goal', v)} /></div>
              <div><Label>Diet Preference</Label><ChipSelect options={diets} value={form.diet} onChange={v => updateField('diet', v)} /></div>
              <div><Label>Activity Level</Label><ChipSelect options={activityLevels} value={form.activity} onChange={v => updateField('activity', v)} /></div>
              <div><Label>Budget</Label><ChipSelect options={budgets} value={form.budget} onChange={v => updateField('budget', v)} /></div>
              <div><Label>Cuisine Preference</Label><ChipSelect options={cuisines} value={form.cuisine} onChange={v => updateField('cuisine', v)} /></div>
              <div><Label>Allergies (optional)</Label><Input placeholder="Nuts, dairy, shellfish..." value={form.allergies} onChange={e => updateField('allergies', e.target.value)} /></div>
              <div><Label>Medical Conditions (optional)</Label><Input placeholder="Diabetes, hypertension..." value={form.conditions} onChange={e => updateField('conditions', e.target.value)} /></div>
            </div>
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Meal Plan</>}
            </Button>
          </div>

          <div className="space-y-4">
            {plan ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[700px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Apple className="h-5 w-5 text-primary" />Your Personalized Meal Plan</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{plan}</p>
              </motion.div>
            ) : (
              <div className="bg-card rounded-2xl p-12 border border-border shadow-soft text-center">
                <Apple className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Plan Generated</h3>
                <p className="text-muted-foreground">Fill in your details and click generate</p>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">This is general guidance. Consult a nutritionist for medical dietary needs.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
