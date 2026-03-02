import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Loader2, AlertTriangle, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

export default function SleepAnalysisPage() {
  const [form, setForm] = useState({
    bedtime: '23:00', wakeup: '07:00', quality: 'fair',
    wakeups: '1', caffeine: 'moderate', screen: 'yes',
    exercise: 'sometimes', stress: 'moderate', naps: 'no',
    room: 'dark', mattress: 'good',
  });
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const calcSleepHours = () => {
    const [bh, bm] = form.bedtime.split(':').map(Number);
    const [wh, wm] = form.wakeup.split(':').map(Number);
    let diff = (wh * 60 + wm) - (bh * 60 + bm);
    if (diff < 0) diff += 24 * 60;
    return Math.round(diff / 6) / 10;
  };

  const handleAnalyze = async () => {
    setIsLoading(true); setAnalysis(null);
    const hours = calcSleepHours();
    setSleepHours(hours);

    const prompt = `Analyze my sleep in detail:
- Bedtime: ${form.bedtime}, Wake: ${form.wakeup} (${hours} hours)
- Perceived Quality: ${form.quality}
- Night Wakeups: ${form.wakeups}
- Caffeine Intake: ${form.caffeine}
- Screen Before Bed: ${form.screen}
- Exercise Routine: ${form.exercise}
- Stress Level: ${form.stress}
- Daytime Naps: ${form.naps}
- Room Environment: ${form.room}
- Mattress Quality: ${form.mattress}

Provide:
1. Sleep Score out of 100 with breakdown
2. Sleep Duration Assessment
3. Sleep Consistency Score
4. Detailed analysis of each factor
5. Personalized improvement plan (at least 8 actionable tips)
6. Relaxation techniques for better sleep
7. Circadian rhythm advice
8. When to see a sleep specialist`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'sleep-analysis' }),
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
    } catch { toast({ title: 'Error', description: 'Failed to analyze sleep.', variant: 'destructive' }); }
    finally { setIsLoading(false); }
  };

  const ChipSelect = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${value === o ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          {o}
        </button>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500">
            <Moon className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">AI Sleep Analysis</h1>
          <p className="text-muted-foreground">Get a detailed sleep score and improvement plan</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Bedtime</Label><Input type="time" value={form.bedtime} onChange={e => setForm({...form, bedtime: e.target.value})} /></div>
                <div><Label>Wake-up</Label><Input type="time" value={form.wakeup} onChange={e => setForm({...form, wakeup: e.target.value})} /></div>
              </div>

              <div><Label>Sleep Quality</Label><ChipSelect options={['poor', 'fair', 'good', 'excellent']} value={form.quality} onChange={v => setForm({...form, quality: v})} /></div>
              <div><Label>Night Wakeups</Label><Input type="number" min="0" value={form.wakeups} onChange={e => setForm({...form, wakeups: e.target.value})} /></div>
              <div><Label>Caffeine Intake</Label><ChipSelect options={['none', 'low', 'moderate', 'high']} value={form.caffeine} onChange={v => setForm({...form, caffeine: v})} /></div>
              <div><Label>Screen Before Bed</Label><ChipSelect options={['yes', 'no']} value={form.screen} onChange={v => setForm({...form, screen: v})} /></div>
              <div><Label>Exercise Routine</Label><ChipSelect options={['never', 'sometimes', 'regularly', 'daily']} value={form.exercise} onChange={v => setForm({...form, exercise: v})} /></div>
              <div><Label>Stress Level</Label><ChipSelect options={['low', 'moderate', 'high', 'very-high']} value={form.stress} onChange={v => setForm({...form, stress: v})} /></div>
              <div><Label>Daytime Naps</Label><ChipSelect options={['no', 'short', 'long']} value={form.naps} onChange={v => setForm({...form, naps: v})} /></div>
              <div><Label>Room Environment</Label><ChipSelect options={['dark', 'dim', 'bright']} value={form.room} onChange={v => setForm({...form, room: v})} /></div>
              <div><Label>Mattress Comfort</Label><ChipSelect options={['poor', 'okay', 'good', 'excellent']} value={form.mattress} onChange={v => setForm({...form, mattress: v})} /></div>
            </div>
            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Analyze My Sleep</>}
            </Button>
          </div>

          <div className="space-y-4">
            {sleepHours !== null && (
              <div className="glass-card rounded-2xl p-6 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-4xl font-bold">{sleepHours}h</p>
                <p className="text-sm text-muted-foreground">Estimated Sleep Duration</p>
              </div>
            )}

            {analysis ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[600px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Moon className="h-5 w-5 text-primary" />Sleep Analysis</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
              </motion.div>
            ) : !sleepHours && (
              <div className="bg-card rounded-2xl p-12 border border-border shadow-soft text-center">
                <Moon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Analysis Yet</h3>
                <p className="text-muted-foreground">Enter your sleep details and click analyze</p>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">For persistent sleep issues, consult a healthcare provider or sleep specialist.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
