import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

export default function SleepAnalysisPage() {
  const [form, setForm] = useState({ bedtime: '23:00', wakeup: '07:00', quality: 'fair', wakeups: '1', caffeine: 'moderate', screen: 'yes', exercise: 'sometimes' });
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const qualities = ['poor', 'fair', 'good', 'excellent'];

  const handleAnalyze = async () => {
    setIsLoading(true); setAnalysis(null);
    const prompt = `Analyze my sleep: Bedtime ${form.bedtime}, Wake ${form.wakeup}, Quality: ${form.quality}, Night wakeups: ${form.wakeups}, Caffeine intake: ${form.caffeine}, Screen before bed: ${form.screen}, Exercise: ${form.exercise}. Give a sleep score out of 100, detailed analysis, and actionable tips.`;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500">
            <Moon className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">AI Sleep Analysis</h1>
          <p className="text-muted-foreground">Get a sleep score and actionable tips for better rest</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Bedtime</Label><Input type="time" value={form.bedtime} onChange={e => setForm({...form, bedtime: e.target.value})} /></div>
                <div><Label>Wake-up Time</Label><Input type="time" value={form.wakeup} onChange={e => setForm({...form, wakeup: e.target.value})} /></div>
              </div>
              <div>
                <Label>Sleep Quality</Label>
                <div className="flex gap-2 mt-2">
                  {qualities.map(q => (
                    <button key={q} onClick={() => setForm({...form, quality: q})}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex-1 capitalize ${form.quality === q ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <div><Label>Night Wakeups</Label><Input type="number" value={form.wakeups} onChange={e => setForm({...form, wakeups: e.target.value})} /></div>
              <div>
                <Label>Caffeine Intake</Label>
                <div className="flex gap-2 mt-2">
                  {['none', 'low', 'moderate', 'high'].map(c => (
                    <button key={c} onClick={() => setForm({...form, caffeine: c})}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex-1 capitalize ${form.caffeine === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Screen Before Bed?</Label>
                <div className="flex gap-2 mt-2">
                  {['yes', 'no'].map(s => (
                    <button key={s} onClick={() => setForm({...form, screen: s})}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex-1 capitalize ${form.screen === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Moon className="mr-2 h-4 w-4" />Analyze My Sleep</>}
            </Button>
          </div>

          <div className="space-y-4">
            {analysis ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[600px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Moon className="h-5 w-5 text-primary" />Sleep Analysis</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
              </motion.div>
            ) : (
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
