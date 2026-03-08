import { useState } from 'react';
import { Apple, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    mealsPerDay: '3', snacking: 'moderate', cookingSkill: 'intermediate',
    cookingTime: '30-60min', supplements: '', waterIntake: 'moderate',
    currentDiet: '', dislikedFoods: '', targetCalories: '',
    proteinGoal: '', carbPreference: 'balanced', mealPrepDay: 'no',
  });
  const { toast } = useToast();
  const ai = useAIStream({ type: 'diet-plan' });

  const goals = ['weight-loss', 'weight-gain', 'muscle-building', 'maintenance', 'heart-health', 'diabetes-friendly', 'anti-inflammatory', 'gut-health'];
  const diets = ['no-preference', 'vegetarian', 'vegan', 'keto', 'mediterranean', 'paleo', 'gluten-free', 'low-fodmap', 'pescatarian', 'whole30'];
  const activityLevels = ['sedentary', 'light', 'moderate', 'active', 'very-active'];
  const budgets = ['low', 'medium', 'high'];
  const cuisines = ['any', 'indian', 'western', 'asian', 'mediterranean', 'mexican', 'middle-eastern', 'african'];

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
- Meals Per Day: ${form.mealsPerDay}, Snacking Habit: ${form.snacking}
- Cooking Skill: ${form.cookingSkill}, Time Available: ${form.cookingTime}
- Carb Preference: ${form.carbPreference}
- Water Intake: ${form.waterIntake}
- Meal Prep Willing: ${form.mealPrepDay}
${form.allergies ? `- Allergies: ${form.allergies}` : ''}
${form.conditions ? `- Medical Conditions: ${form.conditions}` : ''}
${form.supplements ? `- Current Supplements: ${form.supplements}` : ''}
${form.currentDiet ? `- Current Diet Description: ${form.currentDiet}` : ''}
${form.dislikedFoods ? `- Disliked Foods: ${form.dislikedFoods}` : ''}
${form.targetCalories ? `- Target Calories: ${form.targetCalories}` : ''}
${form.proteinGoal ? `- Protein Goal: ${form.proteinGoal}g/day` : ''}

Include for EACH day: **Breakfast**, **Morning Snack**, **Lunch**, **Evening Snack**, **Dinner**.
For each meal: name, key ingredients, approximate calories, protein & carb estimate.
Also include:
- Daily calorie & macro totals
- Hydration plan
- Vitamin/supplement suggestions
- **Weekly grocery summary** with estimated cost
- **Meal prep guide** (what to prepare ahead)
- **Eating schedule** (optimal meal timing)`;

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
          description="Get a personalized 7-day meal plan with calories, macros, grocery list & meal prep guide"
          gradient="from-success to-primary"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Body Metrics</h3>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Age</Label><Input type="number" placeholder="25" value={form.age} onChange={e => updateField('age', e.target.value)} /></div>
                <div><Label>Weight (kg)</Label><Input type="number" placeholder="70" value={form.weight} onChange={e => updateField('weight', e.target.value)} /></div>
                <div><Label>Height (cm)</Label><Input type="number" placeholder="175" value={form.height} onChange={e => updateField('height', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Gender</Label><ChipSelect options={['male', 'female']} value={form.gender} onChange={v => updateField('gender', v)} /></div>
                <div><Label>BMI (auto)</Label><div className="mt-2 px-4 py-2 rounded-lg bg-muted text-center font-bold text-lg">{form.bmi || '—'}</div></div>
              </div>

              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide pt-2">Goals & Preferences</h3>
              <div><Label>Goal</Label><ChipSelect options={goals} value={form.goal} onChange={v => updateField('goal', v)} /></div>
              <div><Label>Diet Preference</Label><ChipSelect options={diets} value={form.diet} onChange={v => updateField('diet', v)} /></div>
              <div><Label>Activity Level</Label><ChipSelect options={activityLevels} value={form.activity} onChange={v => updateField('activity', v)} /></div>
              <div><Label>Carb Preference</Label><ChipSelect options={['low-carb', 'balanced', 'high-carb']} value={form.carbPreference} onChange={v => updateField('carbPreference', v)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Target Calories/day</Label><Input type="number" placeholder="2000 (optional)" value={form.targetCalories} onChange={e => updateField('targetCalories', e.target.value)} /></div>
                <div><Label>Protein Goal (g/day)</Label><Input type="number" placeholder="120 (optional)" value={form.proteinGoal} onChange={e => updateField('proteinGoal', e.target.value)} /></div>
              </div>

              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide pt-2">Eating Habits</h3>
              <div><Label>Meals Per Day</Label><ChipSelect options={['2', '3', '4', '5', '6']} value={form.mealsPerDay} onChange={v => updateField('mealsPerDay', v)} /></div>
              <div><Label>Snacking Habit</Label><ChipSelect options={['none', 'light', 'moderate', 'frequent']} value={form.snacking} onChange={v => updateField('snacking', v)} /></div>
              <div><Label>Water Intake</Label><ChipSelect options={['low', 'moderate', 'good', 'excellent']} value={form.waterIntake} onChange={v => updateField('waterIntake', v)} /></div>

              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide pt-2">Practical Details</h3>
              <div><Label>Cooking Skill</Label><ChipSelect options={['beginner', 'intermediate', 'advanced']} value={form.cookingSkill} onChange={v => updateField('cookingSkill', v)} /></div>
              <div><Label>Cooking Time Available</Label><ChipSelect options={['15min', '30-60min', '1hr+', 'no-cooking']} value={form.cookingTime} onChange={v => updateField('cookingTime', v)} /></div>
              <div><Label>Budget</Label><ChipSelect options={budgets} value={form.budget} onChange={v => updateField('budget', v)} /></div>
              <div><Label>Cuisine Preference</Label><ChipSelect options={cuisines} value={form.cuisine} onChange={v => updateField('cuisine', v)} /></div>
              <div><Label>Willing to Meal Prep?</Label><ChipSelect options={['no', 'yes-weekends', 'yes-any-day']} value={form.mealPrepDay} onChange={v => updateField('mealPrepDay', v)} /></div>

              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide pt-2">Additional Info</h3>
              <div><Label>Allergies / Intolerances</Label><Input placeholder="Nuts, dairy, shellfish, soy..." value={form.allergies} onChange={e => updateField('allergies', e.target.value)} /></div>
              <div><Label>Foods You Dislike</Label><Input placeholder="Mushrooms, olives, tofu..." value={form.dislikedFoods} onChange={e => updateField('dislikedFoods', e.target.value)} /></div>
              <div><Label>Medical Conditions</Label><Input placeholder="Diabetes, hypertension, PCOS..." value={form.conditions} onChange={e => updateField('conditions', e.target.value)} /></div>
              <div><Label>Current Supplements</Label><Input placeholder="Vitamin D, Omega-3, Protein powder..." value={form.supplements} onChange={e => updateField('supplements', e.target.value)} /></div>
              <div><Label>Describe Your Current Diet</Label><Textarea placeholder="I usually skip breakfast, eat out for lunch, snack a lot in the evening..." value={form.currentDiet} onChange={e => updateField('currentDiet', e.target.value)} rows={2} /></div>
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
