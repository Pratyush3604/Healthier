import { useState } from 'react';
import { Heart, Calendar, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';

const symptomOptions = ['Cramps', 'Bloating', 'Headache', 'Mood swings', 'Fatigue', 'Back pain', 'Breast tenderness', 'Acne', 'Food cravings', 'Insomnia', 'Nausea', 'Irritability'];

interface CycleEntry { startDate: string; cycleLength: number; periodDuration: number; symptoms: string[]; }

export default function PeriodTrackerPage() {
  const [form, setForm] = useState({ lastPeriod: '', cycleLength: '28', periodDuration: '5' });
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

    const prompt = `Analyze this menstrual cycle data:\n- Last period: ${form.lastPeriod}\n- Cycle length: ${form.cycleLength} days\n- Period duration: ${form.periodDuration} days\n- Symptoms: ${selectedSymptoms.join(', ') || 'None reported'}\n\nProvide:\n1. **Next predicted period** date and fertile window\n2. **Cycle regularity** assessment\n3. **Symptom analysis** and relief tips for each reported symptom\n4. **PMS management** strategies\n5. **Lifestyle tips** for cycle health\n6. **When to see a gynecologist**\n7. **Nutrition advice** for different cycle phases`;

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
              <div><Label>Last Period Start Date</Label><Input type="date" value={form.lastPeriod} onChange={e => setForm({...form, lastPeriod: e.target.value})} className="mt-1.5" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Cycle Length (days)</Label><Input type="number" value={form.cycleLength} onChange={e => setForm({...form, cycleLength: e.target.value})} className="mt-1.5" /></div>
                <div><Label>Period Duration (days)</Label><Input type="number" value={form.periodDuration} onChange={e => setForm({...form, periodDuration: e.target.value})} className="mt-1.5" /></div>
              </div>
              <div>
                <Label>Symptoms</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {symptomOptions.map(s => (
                    <button key={s} onClick={() => toggleSymptom(s)}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        selectedSymptoms.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
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
