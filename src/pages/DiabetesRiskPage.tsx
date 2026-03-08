import { useState } from 'react';
import { Activity, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { cn } from '@/lib/utils';

export default function DiabetesRiskPage() {
  const [form, setForm] = useState({
    age: '', gender: 'male', weight: '', height: '',
    familyHistory: 'no', physicalActivity: 'moderate',
    fruitVeg: 'sometimes', highBP: 'no', highGlucose: 'no',
    waistCirc: 'normal', smoking: 'no', alcohol: 'moderate',
    sleepHours: '7', stressLevel: 'moderate', ethnicity: 'other',
  });
  const { toast } = useToast();
  const ai = useAIStream({ type: 'diabetes-risk' });

  const calcScore = () => {
    let score = 0;
    const age = parseInt(form.age);
    if (age >= 45 && age < 55) score += 2;
    else if (age >= 55 && age < 65) score += 3;
    else if (age >= 65) score += 4;
    const w = parseFloat(form.weight), h = parseFloat(form.height) / 100;
    if (w && h) { const bmi = w / (h * h); if (bmi >= 25 && bmi < 30) score += 1; else if (bmi >= 30) score += 3; }
    if (form.waistCirc === 'high') score += 3; else if (form.waistCirc === 'very-high') score += 4;
    if (form.physicalActivity === 'low') score += 2; else if (form.physicalActivity === 'none') score += 3;
    if (form.fruitVeg === 'rarely') score += 1;
    if (form.highBP === 'yes') score += 2;
    if (form.highGlucose === 'yes') score += 5;
    if (form.familyHistory === 'parent-sibling') score += 5; else if (form.familyHistory === 'grandparent') score += 3;
    if (form.smoking === 'yes') score += 2;
    return score;
  };

  const score = calcScore();
  const getRisk = () => {
    if (score < 7) return { label: 'Low', color: 'text-success', pct: '~1%' };
    if (score < 12) return { label: 'Slightly Elevated', color: 'text-primary', pct: '~4%' };
    if (score < 15) return { label: 'Moderate', color: 'text-warning', pct: '~17%' };
    if (score < 21) return { label: 'High', color: 'text-destructive', pct: '~33%' };
    return { label: 'Very High', color: 'text-destructive', pct: '~50%' };
  };
  const risk = getRisk();

  const handleAnalyze = async () => {
    if (!form.age || !form.weight || !form.height) { toast({ title: 'Fill required fields', variant: 'destructive' }); return; }
    const prompt = `Diabetes (Type 2) risk assessment (FINDRISC-based):
- Score: ${score} (${risk.label}, 10-year risk ~${risk.pct})
- Age: ${form.age}, Gender: ${form.gender}, Ethnicity: ${form.ethnicity}
- Weight: ${form.weight}kg, Height: ${form.height}cm, BMI: ${(parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1)}
- Family history: ${form.familyHistory}
- Physical activity: ${form.physicalActivity}
- Fruit/veg intake: ${form.fruitVeg}
- Waist circumference: ${form.waistCirc}
- High BP history: ${form.highBP}
- Previous high glucose: ${form.highGlucose}
- Smoking: ${form.smoking}
- Alcohol intake: ${form.alcohol}
- Average sleep: ${form.sleepHours} hours
- Stress level: ${form.stressLevel}

Provide a detailed analysis:
1. **FINDRISC Score Interpretation** — what ${score} points means
2. **Contributing Factors Breakdown** — analyze each risk factor
3. **BMI & Body Composition** impact on diabetes risk
4. **Prevention Strategies** — diet, exercise, weight management
5. **Recommended Screening Tests** — HbA1c, fasting glucose, OGTT
6. **Dietary Guidelines** — glycemic index, fiber, specific foods
7. **Exercise Recommendations** — types, duration, frequency
8. **Sleep & Stress** impact on insulin resistance
9. **Warning Signs** of prediabetes and diabetes
10. **Action Plan** — next steps based on risk level`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={<Activity className="h-8 w-8 text-primary-foreground" />}
          title="Diabetes Risk Calculator"
          description="Estimate your Type 2 diabetes risk based on FINDRISC methodology"
          gradient="from-warning to-destructive"
        />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Age *</Label><Input type="number" placeholder="45" value={form.age} onChange={e => setForm({...form, age: e.target.value})} /></div>
                <div><Label>Weight (kg) *</Label><Input type="number" placeholder="75" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} /></div>
                <div><Label>Height (cm) *</Label><Input type="number" placeholder="170" value={form.height} onChange={e => setForm({...form, height: e.target.value})} /></div>
              </div>
              <div><Label>Gender</Label><ChipSelect options={['male', 'female']} value={form.gender} onChange={v => setForm({...form, gender: v})} /></div>
              <div><Label>Ethnicity</Label><ChipSelect options={['south-asian', 'african', 'hispanic', 'east-asian', 'caucasian', 'other']} value={form.ethnicity} onChange={v => setForm({...form, ethnicity: v})} /></div>
              <div><Label>Family History of Diabetes</Label><ChipSelect options={['no', 'grandparent', 'parent-sibling']} value={form.familyHistory} onChange={v => setForm({...form, familyHistory: v})} formatLabel={v => v === 'no' ? 'No' : v === 'grandparent' ? 'Grandparent/uncle' : 'Parent/sibling'} /></div>
              <div><Label>Physical Activity</Label><ChipSelect options={['daily', 'moderate', 'low', 'none']} value={form.physicalActivity} onChange={v => setForm({...form, physicalActivity: v})} formatLabel={v => v === 'daily' ? 'Daily 30min+' : v === 'moderate' ? '3-4x/week' : v === 'low' ? '1-2x/week' : 'None'} /></div>
              <div><Label>Fruit & Vegetable Intake</Label><ChipSelect options={['daily', 'sometimes', 'rarely']} value={form.fruitVeg} onChange={v => setForm({...form, fruitVeg: v})} /></div>
              <div><Label>Waist Circumference</Label><ChipSelect options={['normal', 'high', 'very-high']} value={form.waistCirc} onChange={v => setForm({...form, waistCirc: v})} formatLabel={v => v === 'normal' ? 'Normal' : v === 'high' ? 'High (M:94-102/F:80-88cm)' : 'Very High (M:>102/F:>88cm)'} /></div>
              <div><Label>High Blood Pressure History</Label><ChipSelect options={['no', 'yes']} value={form.highBP} onChange={v => setForm({...form, highBP: v})} /></div>
              <div><Label>Ever Had High Blood Glucose</Label><ChipSelect options={['no', 'yes']} value={form.highGlucose} onChange={v => setForm({...form, highGlucose: v})} /></div>
              <div><Label>Do You Smoke?</Label><ChipSelect options={['no', 'occasionally', 'yes']} value={form.smoking} onChange={v => setForm({...form, smoking: v})} /></div>
              <div><Label>Alcohol Intake</Label><ChipSelect options={['none', 'moderate', 'heavy']} value={form.alcohol} onChange={v => setForm({...form, alcohol: v})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Avg Sleep (hours)</Label><Input type="number" placeholder="7" value={form.sleepHours} onChange={e => setForm({...form, sleepHours: e.target.value})} /></div>
                <div><Label>Stress Level</Label><ChipSelect options={['low', 'moderate', 'high']} value={form.stressLevel} onChange={v => setForm({...form, stressLevel: v})} /></div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-border bg-card">
              <span className={cn("text-3xl font-bold font-display", risk.color)}>{score}</span>
              <div>
                <p className={cn("font-semibold", risk.color)}>{risk.label} Risk</p>
                <p className="text-xs text-muted-foreground">10-year probability: {risk.pct}</p>
              </div>
            </div>

            <Button onClick={handleAnalyze} disabled={!form.age || !form.weight || !form.height || ai.isLoading} className="w-full" size="lg">
              {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Risk Analysis</>}
            </Button>
          </div>

          <AIResponseCard
            content={ai.response}
            isLoading={ai.isLoading}
            icon={<Activity className="h-5 w-5 text-primary" />}
            title="Risk Analysis"
            maxHeight="700px"
            emptyIcon={<Activity className="h-16 w-16" />}
            emptyTitle="Diabetes Risk"
            emptyDescription="Complete the form to calculate your risk score and get AI analysis"
            disclaimerText="This is a screening tool, not a diagnosis. See a doctor for blood glucose testing."
          />
        </div>
      </div>
    </div>
  );
}