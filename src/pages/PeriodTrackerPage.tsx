import { useState } from 'react';
import { Heart, Calendar, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { cn } from '@/lib/utils';

const symptomOptions = ['Cramps', 'Bloating', 'Headache', 'Mood swings', 'Fatigue', 'Back pain', 'Breast tenderness', 'Acne', 'Food cravings', 'Insomnia', 'Nausea', 'Irritability', 'Dizziness', 'Hot flashes', 'Heavy bleeding', 'Spotting'];

interface CycleEntry { startDate: string; cycleLength: number; periodDuration: number; symptoms: string[]; }

export default function PeriodTrackerPage() {
  const [form, setForm] = useState({
    lastPeriod: '', cycleLength: '28', periodDuration: '5',
    flow: 'moderate', painLevel: 'moderate', age: '',
    contraception: 'none', exerciseLevel: 'moderate',
    sleepQuality: 'fair', stressLevel: 'moderate',
    dietQuality: 'balanced', weight: '',
    conditions: '', medications: '', mood: 'neutral',
    additionalNotes: '',
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [history, setHistory] = useLocalStorage<CycleEntry[]>('healtify-period-history', []);
  const { toast } = useToast();
  const ai = useAIStream({ type: 'period-tracking' });

  const toggleSymptom = (s: string) => setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const getNextPeriod = () => {
    if (!form.lastPeriod) return null;
    const next = new Date(new Date(form.lastPeriod).getTime() + parseInt(form.cycleLength) * 86400000);
    return next.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getFertileWindow = () => {
    if (!form.lastPeriod) return null;
    const last = new Date(form.lastPeriod);
    const cl = parseInt(form.cycleLength);
    const ovulation = new Date(last.getTime() + (cl - 14) * 86400000);
    const fertileStart = new Date(ovulation.getTime() - 5 * 86400000);
    const fertileEnd = new Date(ovulation.getTime() + 1 * 86400000);
    return `${fertileStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${fertileEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const handleAnalyze = async () => {
    if (!form.lastPeriod) { toast({ title: 'Missing info', description: 'Enter your last period start date.', variant: 'destructive' }); return; }
    setHistory(prev => [{ startDate: form.lastPeriod, cycleLength: parseInt(form.cycleLength), periodDuration: parseInt(form.periodDuration), symptoms: selectedSymptoms }, ...prev.slice(0, 11)]);

    const prompt = `Analyze this menstrual cycle data in detail:
- Last period: ${form.lastPeriod}
- Cycle length: ${form.cycleLength} days
- Period duration: ${form.periodDuration} days
- Flow intensity: ${form.flow}
- Pain level: ${form.painLevel}
- Current mood: ${form.mood}
${form.age ? `- Age: ${form.age}` : ''}
${form.weight ? `- Weight: ${form.weight}kg` : ''}
- Contraception: ${form.contraception}
- Exercise level: ${form.exerciseLevel}
- Sleep quality: ${form.sleepQuality}
- Stress level: ${form.stressLevel}
- Diet quality: ${form.dietQuality}
${form.conditions ? `- Medical conditions: ${form.conditions}` : ''}
${form.medications ? `- Medications: ${form.medications}` : ''}
- Symptoms: ${selectedSymptoms.join(', ') || 'None reported'}
${form.additionalNotes ? `- Additional notes: ${form.additionalNotes}` : ''}

Provide:
1. **Next predicted period** date and fertile window
2. **Cycle regularity** assessment
3. **Flow & Pain Analysis** — is this normal?
4. **Symptom analysis** and relief tips for each reported symptom
5. **PMS Management** strategies
6. **Cycle Phase Nutrition** — what to eat during each phase
7. **Exercise Recommendations** by cycle phase
8. **Hormonal Health** indicators
9. **Lifestyle Tips** for cycle optimization
10. **When to See a Gynecologist** — warning signs`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', description: 'Failed to analyze.', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          icon={<Heart className="h-8 w-8 text-primary-foreground" />}
          title="Period Tracker"
          description="Track your cycle, predict periods & get personalized wellness advice"
          gradient="from-accent to-destructive"
        />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Cycle Details</h3>
              <div><Label>Last Period Start Date</Label><Input type="date" value={form.lastPeriod} onChange={e => setForm({...form, lastPeriod: e.target.value})} className="mt-1.5" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Cycle Length (days)</Label><Input type="number" value={form.cycleLength} onChange={e => setForm({...form, cycleLength: e.target.value})} className="mt-1.5" /></div>
                <div><Label>Period Duration (days)</Label><Input type="number" value={form.periodDuration} onChange={e => setForm({...form, periodDuration: e.target.value})} className="mt-1.5" /></div>
              </div>
              <div><Label>Flow Intensity</Label><ChipSelect options={['light', 'moderate', 'heavy', 'very-heavy']} value={form.flow} onChange={v => setForm({...form, flow: v})} /></div>
              <div><Label>Pain Level</Label><ChipSelect options={['none', 'mild', 'moderate', 'severe', 'debilitating']} value={form.painLevel} onChange={v => setForm({...form, painLevel: v})} /></div>
              <div><Label>Current Mood</Label><ChipSelect options={['happy', 'neutral', 'irritable', 'anxious', 'sad', 'energetic']} value={form.mood} onChange={v => setForm({...form, mood: v})} /></div>

              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide pt-2">Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {symptomOptions.map(s => (
                  <button key={s} onClick={() => toggleSymptom(s)}
                    className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      selectedSymptoms.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                    {s}
                  </button>
                ))}
              </div>

              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide pt-2">Lifestyle & Health</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Age</Label><Input type="number" placeholder="25" value={form.age} onChange={e => setForm({...form, age: e.target.value})} /></div>
                <div><Label>Weight (kg)</Label><Input type="number" placeholder="60" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} /></div>
              </div>
              <div><Label>Contraception</Label><ChipSelect options={['none', 'pill', 'IUD', 'implant', 'condom', 'other']} value={form.contraception} onChange={v => setForm({...form, contraception: v})} /></div>
              <div><Label>Exercise Level</Label><ChipSelect options={['none', 'light', 'moderate', 'intense']} value={form.exerciseLevel} onChange={v => setForm({...form, exerciseLevel: v})} /></div>
              <div><Label>Sleep Quality</Label><ChipSelect options={['poor', 'fair', 'good', 'excellent']} value={form.sleepQuality} onChange={v => setForm({...form, sleepQuality: v})} /></div>
              <div><Label>Stress Level</Label><ChipSelect options={['low', 'moderate', 'high', 'very-high']} value={form.stressLevel} onChange={v => setForm({...form, stressLevel: v})} /></div>
              <div><Label>Diet Quality</Label><ChipSelect options={['poor', 'unbalanced', 'balanced', 'very-healthy']} value={form.dietQuality} onChange={v => setForm({...form, dietQuality: v})} /></div>
              <div><Label>Medical Conditions</Label><Input placeholder="PCOS, endometriosis, thyroid..." value={form.conditions} onChange={e => setForm({...form, conditions: e.target.value})} /></div>
              <div><Label>Medications</Label><Input placeholder="Birth control, pain relievers..." value={form.medications} onChange={e => setForm({...form, medications: e.target.value})} /></div>
              <div><Label>Additional Notes</Label><Textarea placeholder="Anything else relevant..." value={form.additionalNotes} onChange={e => setForm({...form, additionalNotes: e.target.value})} rows={2} /></div>
            </div>

            {form.lastPeriod && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl p-5 border border-border text-center shadow-soft">
                  <Calendar className="w-6 h-6 text-accent mx-auto mb-2" />
                  <p className="text-sm font-bold">{getNextPeriod()}</p>
                  <p className="text-xs text-muted-foreground">Next Period</p>
                </div>
                <div className="bg-card rounded-2xl p-5 border border-border text-center shadow-soft">
                  <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
                  <p className="text-sm font-bold">{getFertileWindow()}</p>
                  <p className="text-xs text-muted-foreground">Fertile Window</p>
                </div>
              </div>
            )}

            <Button onClick={handleAnalyze} disabled={!form.lastPeriod || ai.isLoading} className="w-full" size="lg">
              {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Cycle Analysis</>}
            </Button>

            {history.length > 0 && (
              <div className="bg-card rounded-2xl p-5 border border-border">
                <h3 className="font-semibold mb-3">Cycle History</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {history.map((h, i) => (
                    <div key={i} className="flex justify-between py-2 px-3 rounded-lg bg-muted/30 text-sm">
                      <span className="text-muted-foreground">{h.startDate}</span>
                      <span>{h.cycleLength}d cycle / {h.periodDuration}d period</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <AIResponseCard
            content={ai.response}
            isLoading={ai.isLoading}
            icon={<Heart className="h-5 w-5 text-accent" />}
            title="Cycle Analysis"
            emptyIcon={<Heart className="h-16 w-16" />}
            emptyTitle="Track Your Cycle"
            emptyDescription="Enter your cycle details for predictions and personalized advice"
            disclaimerText="This is for informational purposes only. Consult a gynecologist for medical concerns."
          />
        </div>
      </div>
    </div>
  );
}
