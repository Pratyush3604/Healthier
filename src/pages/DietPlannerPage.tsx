import { useState } from 'react';
import { Apple, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';

export default function DietPlannerPage() {
  const [form, setForm] = useState({
    age: '', gender: 'male', weight: '', height: '', bmi: '',
    goal: 'weight-loss', diet: 'no-preference', allergies: '',
    conditions: '', activity: 'moderate', budget: 'medium', cuisine: 'any',
  });
  const { toast } = useToast();
  const ai = useAIStream({ type: 'diet-plan' });

  const goals = ['weight-loss', 'weight-gain', 'muscle-building', 'maintenance', 'heart-health', 'diabetes-friendly'];
  const diets = ['no-preference', 'vegetarian', 'vegan', 'keto', 'mediterranean', 'paleo', 'gluten-free'];
  const activityLevels = ['sedentary', 'light', 'moderate', 'active', 'very-active'];
  const budgets = ['low', 'medium', 'high'];
  const cuisines = ['any', 'indian', 'western', 'asian', 'mediterranean', 'mexican'];

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

    const prompt = `Create a comprehensive **7-day meal plan** for:
- Age: ${form.age}, Gender: ${form.gender}
- Weight: ${form.weight}kg, Height: ${form.height}cm, BMI: ${form.bmi}
- Goal: ${form.goal}, Diet: ${form.diet}
- Activity Level: ${form.activity}
- Budget: ${form.budget}, Cuisine: ${form.cuisine}
${form.allergies ? `- Allergies: ${form.allergies}` : ''}
${form.conditions ? `- Medical Conditions: ${form.conditions}` : ''}

Include for EACH day: **Breakfast**, **Morning Snack**, **Lunch**, **Evening Snack**, **Dinner**.
For each meal: name, key ingredients, approximate calories, protein estimate.
Also include: daily calorie total, hydration advice, vitamin suggestions, and a **weekly grocery summary** at the end.`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', description: 'Failed to generate plan.', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={<Apple className="h-8 w-8 text-primary-foreground" />}
          title="AI Diet Planner"
          description="Get a personalized 7-day meal plan with calories, protein, and grocery list"
          gradient="from-success to-primary"
        />

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
                  <ChipSelect options={['male', 'female']} value={form.gender} onChange={v => updateField('gender', v)} />
                </div>
                <div>
                  <Label>BMI (auto)</Label>
                  <div className="mt-2 px-4 py-2 rounded-lg bg-muted text-center font-bold text-lg">{form.bmi || '—'}</div>
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
            <Button onClick={handleGenerate} disabled={ai.isLoading} className="w-full" size="lg">
              {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="mr-2 h-4 w-4" />Generate Meal Plan</>}
            </Button>
          </div>

          <AIResponseCard
            content={ai.response}
            isLoading={ai.isLoading}
            icon={<Apple className="h-5 w-5 text-primary" />}
            title="Your Personalized Meal Plan"
            maxHeight="700px"
            emptyIcon={<Apple className="h-16 w-16" />}
            emptyTitle="No Plan Generated"
            emptyDescription="Fill in your details and click generate"
            disclaimerText="This is general guidance. Consult a nutritionist for medical dietary needs."
          />
        </div>
      </div>
    </div>
  );
}
