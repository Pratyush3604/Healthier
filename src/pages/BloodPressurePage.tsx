import { useState } from 'react';
import { Heart, Loader2, Sparkles, TrendingUp, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { cn } from '@/lib/utils';

interface BPEntry { date: string; time: string; systolic: number; diastolic: number; heartRate?: number; notes: string; category: string; arm: string; position: string; }

const getBPCategory = (sys: number, dia: number) => {
  if (sys < 120 && dia < 80) return { label: 'Normal', color: 'text-success', bg: 'bg-success/10' };
  if (sys < 130 && dia < 80) return { label: 'Elevated', color: 'text-warning', bg: 'bg-warning/10' };
  if (sys < 140 || dia < 90) return { label: 'High (Stage 1)', color: 'text-warning', bg: 'bg-warning/10' };
  if (sys >= 140 || dia >= 90) return { label: 'High (Stage 2)', color: 'text-destructive', bg: 'bg-destructive/10' };
  return { label: 'Unknown', color: 'text-muted-foreground', bg: 'bg-muted' };
};

export default function BloodPressurePage() {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [notes, setNotes] = useState('');
  const [arm, setArm] = useState('left');
  const [position, setPosition] = useState('sitting');
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [mealStatus, setMealStatus] = useState('fasting');
  const [caffeine, setCaffeine] = useState('no');
  const [exercise, setExercise] = useState('no');
  const [stress, setStress] = useState('relaxed');
  const [medications, setMedications] = useState('');
  const [history, setHistory] = useLocalStorage<BPEntry[]>('healtify-bp-history', []);
  const { toast } = useToast();
  const ai = useAIStream({ type: 'bp-analysis' });

  const currentCategory = systolic && diastolic ? getBPCategory(parseInt(systolic), parseInt(diastolic)) : null;

  const handleLog = () => {
    const sys = parseInt(systolic), dia = parseInt(diastolic);
    if (!sys || !dia) { toast({ title: 'Enter BP values', variant: 'destructive' }); return; }
    const entry: BPEntry = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      systolic: sys, diastolic: dia,
      heartRate: heartRate ? parseInt(heartRate) : undefined,
      notes, category: getBPCategory(sys, dia).label, arm, position,
    };
    setHistory(prev => [entry, ...prev.slice(0, 49)]);
    toast({ title: 'Logged', description: `${sys}/${dia} mmHg recorded.` });
    setSystolic(''); setDiastolic(''); setHeartRate(''); setNotes('');
  };

  const handleAnalyze = async () => {
    if (history.length === 0) { toast({ title: 'No data', description: 'Log at least one reading first.', variant: 'destructive' }); return; }
    const readings = history.slice(0, 10).map(h => `${h.date} ${h.time}: ${h.systolic}/${h.diastolic} mmHg ${h.heartRate ? `HR:${h.heartRate}` : ''} (${h.arm} arm, ${h.position}) ${h.notes ? `— ${h.notes}` : ''}`).join('\n');
    const prompt = `Analyze these blood pressure readings:
${readings}

Context: Time of day: ${timeOfDay}, Meal status: ${mealStatus}, Caffeine: ${caffeine}, Recent exercise: ${exercise}, Stress: ${stress}
${medications ? `Current BP medications: ${medications}` : ''}

Provide detailed analysis:
1. **Overall BP Trend** — improving, worsening, or stable
2. **Category Breakdown** — normal/elevated/high distribution
3. **Time-of-Day Patterns** — morning vs evening differences
4. **Heart Rate Correlation** — relationship with BP
5. **Risk Factors** to consider
6. **Lifestyle Modifications** — DASH diet, exercise, stress management, sodium intake
7. **Measurement Accuracy Tips** — proper technique
8. **When to See a Doctor** — warning signs
9. **Medication Considerations** — if applicable
10. **7-Day BP Improvement Plan**`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          icon={<Heart className="h-8 w-8 text-primary-foreground" />}
          title="Blood Pressure Tracker"
          description="Log readings with context, track trends & get AI insights"
          gradient="from-destructive to-accent"
        />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Reading</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Systolic (top)</Label><Input type="number" placeholder="120" value={systolic} onChange={e => setSystolic(e.target.value)} className="mt-1.5 text-lg" /></div>
                <div><Label>Diastolic (bottom)</Label><Input type="number" placeholder="80" value={diastolic} onChange={e => setDiastolic(e.target.value)} className="mt-1.5 text-lg" /></div>
              </div>
              <div><Label>Heart Rate (bpm)</Label><Input type="number" placeholder="72" value={heartRate} onChange={e => setHeartRate(e.target.value)} className="mt-1.5" /></div>

              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide pt-2">Measurement Context</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Arm</Label><ChipSelect options={['left', 'right']} value={arm} onChange={setArm} /></div>
                <div><Label>Position</Label><ChipSelect options={['sitting', 'standing', 'lying-down']} value={position} onChange={setPosition} /></div>
              </div>
              <div><Label>Time of Day</Label><ChipSelect options={['morning', 'afternoon', 'evening', 'night']} value={timeOfDay} onChange={setTimeOfDay} /></div>
              <div><Label>Meal Status</Label><ChipSelect options={['fasting', 'after-meal', 'between-meals']} value={mealStatus} onChange={setMealStatus} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Had Caffeine?</Label><ChipSelect options={['no', 'yes-recently', 'yes-hours-ago']} value={caffeine} onChange={setCaffeine} /></div>
                <div><Label>Recent Exercise?</Label><ChipSelect options={['no', 'light', 'intense']} value={exercise} onChange={setExercise} /></div>
              </div>
              <div><Label>Current Mood/Stress</Label><ChipSelect options={['relaxed', 'normal', 'stressed', 'anxious']} value={stress} onChange={setStress} /></div>
              <div><Label>BP Medications (if any)</Label><Input placeholder="Amlodipine, Losartan..." value={medications} onChange={e => setMedications(e.target.value)} className="mt-1.5" /></div>
              <div><Label>Notes</Label><Input placeholder="After walking, felt dizzy, etc." value={notes} onChange={e => setNotes(e.target.value)} className="mt-1.5" /></div>

              {currentCategory && (
                <div className={cn("flex items-center gap-2 px-4 py-3 rounded-xl border", currentCategory.bg)}>
                  <Heart className={cn("w-5 h-5", currentCategory.color)} />
                  <span className={cn("font-semibold", currentCategory.color)}>{systolic}/{diastolic} — {currentCategory.label}</span>
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={handleLog} className="flex-1"><Plus className="w-4 h-4 mr-2" />Log Reading</Button>
                <Button onClick={handleAnalyze} variant="outline" disabled={history.length === 0 || ai.isLoading} className="flex-1">
                  {ai.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" />Analyze</>}
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border">
              <h3 className="font-semibold mb-3">BP Categories</h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Normal', range: '< 120/80', color: 'bg-success' },
                  { label: 'Elevated', range: '120-129 / < 80', color: 'bg-warning' },
                  { label: 'High (Stage 1)', range: '130-139 / 80-89', color: 'bg-warning' },
                  { label: 'High (Stage 2)', range: '≥ 140 / ≥ 90', color: 'bg-destructive' },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-3">
                    <span className={cn("w-3 h-3 rounded-full", c.color)} />
                    <span className="font-medium">{c.label}</span>
                    <span className="text-muted-foreground ml-auto">{c.range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <AIResponseCard
              content={ai.response}
              isLoading={ai.isLoading}
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              title="BP Analysis"
              maxHeight="400px"
              showDisclaimer={!!ai.response}
              disclaimerText="Consult your doctor for persistent high BP. Home readings should complement, not replace, clinical measurements."
              emptyIcon={null} emptyTitle="" emptyDescription=""
            />

            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Clock className="w-5 h-5 text-primary" />Reading History</h3>
              {history.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {history.map((h, i) => {
                    const cat = getBPCategory(h.systolic, h.diastolic);
                    return (
                      <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-sm">
                        <span className="text-muted-foreground">{h.date} {h.time}</span>
                        <span className="font-medium">{h.systolic}/{h.diastolic}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", cat.bg, cat.color)}>{cat.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No readings logged yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
