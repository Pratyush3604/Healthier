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
import { cn } from '@/lib/utils';

interface BPEntry { date: string; time: string; systolic: number; diastolic: number; heartRate?: number; notes: string; category: string; }

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
      notes, category: getBPCategory(sys, dia).label,
    };
    setHistory(prev => [entry, ...prev.slice(0, 49)]);
    toast({ title: 'Logged', description: `${sys}/${dia} mmHg recorded.` });
    setSystolic(''); setDiastolic(''); setHeartRate(''); setNotes('');
  };

  const handleAnalyze = async () => {
    if (history.length === 0) { toast({ title: 'No data', description: 'Log at least one reading first.', variant: 'destructive' }); return; }
    const readings = history.slice(0, 10).map(h => `${h.date} ${h.time}: ${h.systolic}/${h.diastolic} mmHg ${h.heartRate ? `HR:${h.heartRate}` : ''} ${h.notes ? `(${h.notes})` : ''}`).join('\n');
    const prompt = `Analyze these blood pressure readings:\n${readings}\n\nProvide:\n1. **Overall BP trend** analysis\n2. **Category breakdown** (normal/elevated/high)\n3. **Risk factors** to consider\n4. **Lifestyle modifications** (diet, exercise, stress)\n5. **DASH diet** overview\n6. **When to see a doctor**\n7. **Tips for accurate BP measurement**`;

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
          description="Log readings, track trends & get AI insights"
          gradient="from-destructive to-accent"
        />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Systolic (top)</Label><Input type="number" placeholder="120" value={systolic} onChange={e => setSystolic(e.target.value)} className="mt-1.5 text-lg" /></div>
                <div><Label>Diastolic (bottom)</Label><Input type="number" placeholder="80" value={diastolic} onChange={e => setDiastolic(e.target.value)} className="mt-1.5 text-lg" /></div>
              </div>
              <div><Label>Heart Rate (optional)</Label><Input type="number" placeholder="72" value={heartRate} onChange={e => setHeartRate(e.target.value)} className="mt-1.5" /></div>
              <div><Label>Notes (optional)</Label><Input placeholder="After exercise, resting, etc." value={notes} onChange={e => setNotes(e.target.value)} className="mt-1.5" /></div>
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
              showDisclaimer={false}
              emptyIcon={null}
              emptyTitle=""
              emptyDescription=""
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

            {(ai.response || history.length > 0) && (
              <AIResponseCard content={null} isLoading={false} showDisclaimer={true}
                disclaimerText="Consult your doctor for persistent high BP. Home readings should complement, not replace, clinical measurements."
                emptyIcon={null} emptyTitle="" emptyDescription="" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
