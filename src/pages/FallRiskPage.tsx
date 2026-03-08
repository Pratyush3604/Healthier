import { useState } from 'react';
import { UserCheck, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { cn } from '@/lib/utils';

const riskFactors = [
  { id: 'falls', text: 'History of falls in the past year', weight: 3 },
  { id: 'meds', text: 'Takes 4+ medications', weight: 2 },
  { id: 'dizzy_meds', text: 'Medications causing dizziness', weight: 2 },
  { id: 'vision', text: 'Vision problems', weight: 2 },
  { id: 'balance', text: 'Balance or walking difficulties', weight: 3 },
  { id: 'clutter', text: 'Home has clutter or loose rugs', weight: 1 },
  { id: 'lighting', text: 'Poor lighting at home', weight: 1 },
  { id: 'bathroom', text: 'No grab bars in bathroom', weight: 1 },
  { id: 'footwear', text: 'Wears loose/slippery footwear', weight: 1 },
  { id: 'weakness', text: 'Lower body weakness', weight: 2 },
  { id: 'fear', text: 'Fear of falling limits activity', weight: 2 },
  { id: 'incontinence', text: 'Urinary urgency/incontinence', weight: 1 },
  { id: 'arthritis', text: 'Arthritis or joint pain', weight: 1 },
  { id: 'hearing', text: 'Hearing impairment', weight: 1 },
  { id: 'cognitive', text: 'Memory or cognitive difficulties', weight: 2 },
];

export default function FallRiskPage() {
  const [age, setAge] = useState('');
  const [mobility, setMobility] = useState('independent');
  const [livingAlone, setLivingAlone] = useState('no');
  const [exerciseLevel, setExerciseLevel] = useState('sometimes');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const ai = useAIStream({ type: 'fall-risk' });

  const score = riskFactors.reduce((sum, f) => sum + (checked[f.id] ? f.weight : 0), 0);
  const riskLevel = score <= 3 ? 'Low' : score <= 8 ? 'Moderate' : 'High';
  const riskColor = score <= 3 ? 'text-success' : score <= 8 ? 'text-warning' : 'text-destructive';

  const handleAnalyze = async () => {
    if (!age) { toast({ title: 'Enter age', variant: 'destructive' }); return; }
    const activeFactors = riskFactors.filter(f => checked[f.id]).map(f => f.text);
    const prompt = `Senior fall risk assessment:
- Age: ${age}
- Mobility: ${mobility}
- Living alone: ${livingAlone}
- Exercise level: ${exerciseLevel}
- Risk Score: ${score} (${riskLevel})
- Risk Factors: ${activeFactors.join(', ') || 'None identified'}

Provide a comprehensive analysis:
1. **Risk Level Interpretation** — what score ${score} means
2. **Personalized Prevention Plan** based on identified factors
3. **Home Safety Audit Checklist** (15+ items room-by-room)
4. **Balance & Strength Exercises** (8+ exercises with descriptions, hold times, reps)
5. **Medication Review** recommendations
6. **Vision & Hearing** check reminders
7. **Mobility Aid** recommendations if applicable
8. **Emergency Preparedness** — what to do if a fall occurs
9. **Daily Routine Adjustments** for safety
10. **When to discuss with a doctor**`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={<UserCheck className="h-8 w-8 text-primary-foreground" />}
          title="Fall Risk Assessment"
          description="Evaluate fall risk for seniors and get a personalized prevention plan"
          gradient="from-warning to-accent"
        />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div><Label>Age</Label><Input type="number" placeholder="75" value={age} onChange={e => setAge(e.target.value)} /></div>
              <div><Label>Mobility Level</Label><ChipSelect options={['independent', 'uses-cane', 'uses-walker', 'wheelchair']} value={mobility} onChange={setMobility} /></div>
              <div><Label>Living Alone?</Label><ChipSelect options={['no', 'yes']} value={livingAlone} onChange={setLivingAlone} /></div>
              <div><Label>Exercise Level</Label><ChipSelect options={['none', 'sometimes', 'regularly', 'daily']} value={exerciseLevel} onChange={setExerciseLevel} /></div>
              <div>
                <Label>Check all that apply:</Label>
                <div className="space-y-2 mt-3">
                  {riskFactors.map(f => (
                    <button key={f.id} onClick={() => setChecked(prev => ({ ...prev, [f.id]: !prev[f.id] }))}
                      className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all",
                        checked[f.id] ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30 border border-transparent hover:bg-muted/50')}>
                      <CheckCircle className={cn("w-4 h-4 shrink-0", checked[f.id] ? 'text-primary' : 'text-muted-foreground/30')} />
                      <span className={checked[f.id] ? 'text-foreground' : 'text-muted-foreground'}>{f.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card">
              <span className={cn("text-2xl font-bold font-display", riskColor)}>{score}</span>
              <div>
                <p className={cn("font-semibold", riskColor)}>{riskLevel} Risk</p>
                <p className="text-xs text-muted-foreground">{riskFactors.filter(f => checked[f.id]).length} factors identified</p>
              </div>
            </div>

            <Button onClick={handleAnalyze} disabled={!age || ai.isLoading} className="w-full" size="lg">
              {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Prevention Plan</>}
            </Button>
          </div>

          <AIResponseCard
            content={ai.response}
            isLoading={ai.isLoading}
            icon={<UserCheck className="h-5 w-5 text-primary" />}
            title="Prevention Plan"
            maxHeight="700px"
            emptyIcon={<UserCheck className="h-16 w-16" />}
            emptyTitle="Fall Prevention"
            emptyDescription="Complete the assessment for a personalized prevention plan"
            disclaimerText="Discuss results with a healthcare provider. If you've had a recent fall, seek medical evaluation."
          />
        </div>
      </div>
    </div>
  );
}