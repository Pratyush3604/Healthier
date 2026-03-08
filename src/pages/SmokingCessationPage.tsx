import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wind, Loader2, AlertTriangle, Sparkles, TrendingUp, DollarSign, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

const triggers = ['Stress', 'Social situations', 'After meals', 'Boredom', 'Alcohol', 'Morning routine', 'Driving', 'Work breaks', 'Anxiety', 'Habit'];

export default function SmokingCessationPage() {
  const [form, setForm] = useState({ cigarettesPerDay: '', yearsSmoking: '', previousAttempts: '0', costPerPack: '10' });
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [quitDate, setQuitDate] = useLocalStorage<string>('healtify-quit-date', '');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleTrigger = (t: string) => setSelectedTriggers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const daysSmokeFree = quitDate ? Math.max(0, Math.floor((Date.now() - new Date(quitDate).getTime()) / 86400000)) : 0;
  const moneySaved = quitDate ? (daysSmokeFree * (parseInt(form.cigarettesPerDay) || 0) / 20 * parseFloat(form.costPerPack || '10')).toFixed(2) : '0';
  const cigarettesAvoided = quitDate ? daysSmokeFree * (parseInt(form.cigarettesPerDay) || 0) : 0;

  const handleAnalyze = async () => {
    if (!form.cigarettesPerDay) { toast({ title: 'Enter daily cigarettes', variant: 'destructive' }); return; }
    setIsLoading(true); setAnalysis(null);
    const prompt = `Smoking cessation plan:\n- Cigarettes/day: ${form.cigarettesPerDay}\n- Years smoking: ${form.yearsSmoking || 'Not specified'}\n- Previous quit attempts: ${form.previousAttempts}\n- Triggers: ${selectedTriggers.join(', ') || 'Not specified'}\n${quitDate ? `- Quit date: ${quitDate} (${daysSmokeFree} days smoke-free)` : '- Has not set quit date yet'}\n\nProvide:\n1. Personalized quit plan with timeline\n2. Nicotine replacement options overview\n3. Coping strategy for each identified trigger\n4. Health benefits timeline (20min, 12hrs, 2weeks, 1month, 1year, etc.)\n5. Dealing with withdrawal symptoms\n6. Motivation and mindset tips\n7. Relapse prevention strategies\n8. Support resources`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'smoking-cessation' }),
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
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500"><Wind className="h-8 w-8 text-white" /></div>
          <h1 className="font-display text-3xl font-bold mb-2">Quit Smoking Assistant</h1>
          <p className="text-muted-foreground">Get a personalized plan, track progress & stay motivated</p>
        </div>

        {quitDate && daysSmokeFree > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-2xl p-5 border border-border text-center">
              <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{daysSmokeFree}</p>
              <p className="text-xs text-muted-foreground">Days Smoke-Free</p>
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border text-center">
              <DollarSign className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold">${moneySaved}</p>
              <p className="text-xs text-muted-foreground">Money Saved</p>
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border text-center">
              <Heart className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">{cigarettesAvoided}</p>
              <p className="text-xs text-muted-foreground">Cigarettes Avoided</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Cigarettes/Day</Label><Input type="number" placeholder="10" value={form.cigarettesPerDay} onChange={e => setForm({...form, cigarettesPerDay: e.target.value})} className="mt-1.5" /></div>
                <div><Label>Years Smoking</Label><Input type="number" placeholder="5" value={form.yearsSmoking} onChange={e => setForm({...form, yearsSmoking: e.target.value})} className="mt-1.5" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Previous Quit Attempts</Label><Input type="number" placeholder="0" value={form.previousAttempts} onChange={e => setForm({...form, previousAttempts: e.target.value})} className="mt-1.5" /></div>
                <div><Label>Cost Per Pack ($)</Label><Input type="number" step="0.5" placeholder="10" value={form.costPerPack} onChange={e => setForm({...form, costPerPack: e.target.value})} className="mt-1.5" /></div>
              </div>
              <div><Label>Quit Date</Label><Input type="date" value={quitDate} onChange={e => setQuitDate(e.target.value)} className="mt-1.5" /></div>
              <div><Label>Smoking Triggers</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {triggers.map(t => (<button key={t} onClick={() => toggleTrigger(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedTriggers.includes(t) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t}</button>))}
                </div>
              </div>
            </div>
            <Button onClick={handleAnalyze} disabled={!form.cigarettesPerDay || isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Plan...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Quit Plan</>}
            </Button>
          </div>
          <div className="space-y-4">
            {analysis ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[600px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Your Quit Plan</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
              </motion.div>
            ) : (
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <Wind className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ready to Quit?</h3>
                <p className="text-muted-foreground">Fill in your details for a personalized cessation plan</p>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" /><p className="text-sm text-muted-foreground">Consider consulting a doctor for prescription cessation aids. You don't have to do this alone.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
