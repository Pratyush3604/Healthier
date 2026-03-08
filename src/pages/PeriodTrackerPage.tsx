import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, Loader2, AlertTriangle, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

const symptomOptions = ['Cramps', 'Bloating', 'Headache', 'Mood swings', 'Fatigue', 'Back pain', 'Breast tenderness', 'Acne', 'Food cravings', 'Insomnia', 'Nausea', 'Irritability'];

interface CycleEntry { startDate: string; cycleLength: number; periodDuration: number; symptoms: string[]; }

export default function PeriodTrackerPage() {
  const [form, setForm] = useState({ lastPeriod: '', cycleLength: '28', periodDuration: '5' });
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useLocalStorage<CycleEntry[]>('healtify-period-history', []);
  const { toast } = useToast();

  const toggleSymptom = (s: string) => setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const getNextPeriod = () => {
    if (!form.lastPeriod) return null;
    const last = new Date(form.lastPeriod);
    const next = new Date(last.getTime() + parseInt(form.cycleLength) * 86400000);
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
    setIsLoading(true); setAnalysis(null);

    setHistory(prev => [{ startDate: form.lastPeriod, cycleLength: parseInt(form.cycleLength), periodDuration: parseInt(form.periodDuration), symptoms: selectedSymptoms }, ...prev.slice(0, 11)]);

    const prompt = `Analyze this menstrual cycle data:\n- Last period: ${form.lastPeriod}\n- Cycle length: ${form.cycleLength} days\n- Period duration: ${form.periodDuration} days\n- Symptoms: ${selectedSymptoms.join(', ') || 'None reported'}\n\nProvide:\n1. Next predicted period date and fertile window\n2. Cycle regularity assessment\n3. Symptom analysis and relief tips for each reported symptom\n4. PMS management strategies\n5. Lifestyle tips for cycle health\n6. When to see a gynecologist\n7. Nutrition advice for different cycle phases`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'period-tracking' }),
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
          try { const p = JSON.parse(jsonStr); const c = p.choices?.[0]?.delta?.content; if (c) { fullContent += c; setAnalysis(fullContent); } } catch { buffer = line + '\n' + buffer; break; }
        }
      }
    } catch { toast({ title: 'Error', description: 'Failed to analyze.', variant: 'destructive' }); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Period Tracker</h1>
          <p className="text-muted-foreground">Track your cycle, predict periods & get personalized wellness advice</p>
        </div>

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
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedSymptoms.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {form.lastPeriod && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl p-5 border border-border text-center">
                  <Calendar className="w-6 h-6 text-accent mx-auto mb-2" />
                  <p className="text-sm font-bold">{getNextPeriod()}</p>
                  <p className="text-xs text-muted-foreground">Next Period</p>
                </div>
                <div className="bg-card rounded-2xl p-5 border border-border text-center">
                  <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
                  <p className="text-sm font-bold">{getFertileWindow()}</p>
                  <p className="text-xs text-muted-foreground">Fertile Window</p>
                </div>
              </div>
            )}

            <Button onClick={handleAnalyze} disabled={!form.lastPeriod || isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Cycle Analysis</>}
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

          <div className="space-y-4">
            {analysis ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[600px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Heart className="h-5 w-5 text-accent" />Cycle Analysis</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
              </motion.div>
            ) : (
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Track Your Cycle</h3>
                <p className="text-muted-foreground">Enter your cycle details for predictions and personalized advice</p>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">This is for informational purposes only. Consult a gynecologist for medical concerns.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
