import { useState } from 'react';
import { Shield, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { cn } from '@/lib/utils';

const symptomOptions = ['Low energy', 'Low libido', 'Fatigue', 'Mood changes', 'Weight gain', 'Muscle loss', 'Poor sleep', 'Brain fog', 'Hair loss', 'Irritability', 'Joint pain', 'Reduced stamina', 'Night sweats', 'Difficulty concentrating'];

export default function MensHealthPage() {
  const [form, setForm] = useState({
    age: '', weight: '', height: '', sleep: 'fair',
    exercise: 'sometimes', stress: 'moderate', diet: 'average',
    alcohol: 'moderate', smoking: 'no', waterIntake: 'moderate',
    screenTime: 'moderate', supplements: 'none',
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const { toast } = useToast();
  const ai = useAIStream({ type: 'mens-health' });

  const toggleSymptom = (s: string) => setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleAnalyze = async () => {
    if (!form.age) { toast({ title: 'Missing age', variant: 'destructive' }); return; }
    const prompt = `Men's health vitality assessment:
- Age: ${form.age}, Weight: ${form.weight || 'N/A'}kg, Height: ${form.height || 'N/A'}cm
- Sleep Quality: ${form.sleep}
- Exercise: ${form.exercise}
- Stress: ${form.stress}
- Diet Quality: ${form.diet}
- Alcohol: ${form.alcohol}
- Smoking: ${form.smoking}
- Water Intake: ${form.waterIntake}
- Screen Time: ${form.screenTime}
- Supplements: ${form.supplements}
- Symptoms: ${selectedSymptoms.join(', ') || 'None'}

Provide comprehensive analysis:
1. **Vitality Score** estimation (1-100) with breakdown
2. **Hormonal Health** — factors affecting testosterone naturally
3. **Exercise Recommendations** — types, frequency, compound movements
4. **Nutrition Advice** — testosterone-supporting foods, micronutrients
5. **Sleep Optimization** — impact on hormone production
6. **Stress Management** — cortisol and its effects
7. **Supplement Overview** — evidence-based options (zinc, D3, magnesium)
8. **Lifestyle Modifications** — screen time, alcohol, smoking impacts
9. **Age-Specific Screening** — PSA, cholesterol, blood sugar
10. **When to See a Doctor** for bloodwork and evaluation`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={<Shield className="h-8 w-8 text-primary-foreground" />}
          title="Men's Health & Vitality"
          description="Assess lifestyle factors affecting your energy, vitality and overall health"
          gradient="from-secondary to-primary"
        />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Age *</Label><Input type="number" placeholder="30" value={form.age} onChange={e => setForm({...form, age: e.target.value})} /></div>
                <div><Label>Weight (kg)</Label><Input type="number" placeholder="80" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} /></div>
                <div><Label>Height (cm)</Label><Input type="number" placeholder="178" value={form.height} onChange={e => setForm({...form, height: e.target.value})} /></div>
              </div>
              <div><Label>Sleep Quality</Label><ChipSelect options={['poor', 'fair', 'good', 'excellent']} value={form.sleep} onChange={v => setForm({...form, sleep: v})} /></div>
              <div><Label>Exercise Frequency</Label><ChipSelect options={['never', 'sometimes', 'regularly', 'daily']} value={form.exercise} onChange={v => setForm({...form, exercise: v})} /></div>
              <div><Label>Stress Level</Label><ChipSelect options={['low', 'moderate', 'high', 'very-high']} value={form.stress} onChange={v => setForm({...form, stress: v})} /></div>
              <div><Label>Diet Quality</Label><ChipSelect options={['poor', 'average', 'good', 'excellent']} value={form.diet} onChange={v => setForm({...form, diet: v})} /></div>
              <div><Label>Alcohol Intake</Label><ChipSelect options={['none', 'moderate', 'heavy']} value={form.alcohol} onChange={v => setForm({...form, alcohol: v})} /></div>
              <div><Label>Smoking</Label><ChipSelect options={['no', 'occasionally', 'yes']} value={form.smoking} onChange={v => setForm({...form, smoking: v})} /></div>
              <div><Label>Water Intake</Label><ChipSelect options={['low', 'moderate', 'high']} value={form.waterIntake} onChange={v => setForm({...form, waterIntake: v})} /></div>
              <div><Label>Daily Screen Time</Label><ChipSelect options={['low', 'moderate', 'high', 'excessive']} value={form.screenTime} onChange={v => setForm({...form, screenTime: v})} /></div>
              <div><Label>Supplements</Label><ChipSelect options={['none', 'multivitamin', 'specific', 'multiple']} value={form.supplements} onChange={v => setForm({...form, supplements: v})} /></div>
              <div>
                <Label>Symptoms (if any)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {symptomOptions.map(s => (
                    <button key={s} onClick={() => toggleSymptom(s)}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        selectedSymptoms.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={handleAnalyze} disabled={!form.age || ai.isLoading} className="w-full" size="lg">
              {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Vitality Assessment</>}
            </Button>
          </div>

          <AIResponseCard
            content={ai.response}
            isLoading={ai.isLoading}
            icon={<Shield className="h-5 w-5 text-primary" />}
            title="Vitality Report"
            maxHeight="700px"
            emptyIcon={<Shield className="h-16 w-16" />}
            emptyTitle="Vitality Check"
            emptyDescription="Fill in your details for a personalized health assessment"
            disclaimerText="This is informational only. Consult a doctor for medical concerns or bloodwork."
          />
        </div>
      </div>
    </div>
  );
}