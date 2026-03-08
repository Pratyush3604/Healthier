import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Loader2, AlertTriangle, Sparkles, TrendingUp, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

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
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    setIsLoading(true); setAnalysis(null);
    const readings = history.slice(0, 10).map(h => `${h.date} ${h.time}: ${h.systolic}/${h.diastolic} mmHg ${h.heartRate ? `HR:${h.heartRate}` : ''} ${h.notes ? `(${h.notes})` : ''}`).join('\n');
    const prompt = `Analyze these blood pressure readings:\n${readings}\n\nProvide:\n1. Overall BP trend analysis\n2. Category breakdown (normal/elevated/high)\n3. Risk factors to consider\n4. Lifestyle modifications (diet, exercise, stress)\n5. DASH diet overview\n6. When to see a doctor\n7. Tips for accurate BP measurement`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'bp-analysis' }),
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-500"><Heart className="h-8 w-8 text-white" /></div>
          <h1 className="font-display text-3xl font-bold mb-2">Blood Pressure Tracker</h1>
          <p className="text-muted-foreground">Log readings, track trends & get AI insights</p>
        </div>
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
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${currentCategory.bg} border`}>
                  <Heart className={`w-5 h-5 ${currentCategory.color}`} />
                  <span className={`font-semibold ${currentCategory.color}`}>{systolic}/{diastolic} — {currentCategory.label}</span>
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={handleLog} className="flex-1"><Plus className="w-4 h-4 mr-2" />Log Reading</Button>
                <Button onClick={handleAnalyze} variant="outline" disabled={history.length === 0 || isLoading} className="flex-1">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" />Analyze</>}
                </Button>
              </div>
            </div>

            {/* BP Scale */}
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
                    <span className={`w-3 h-3 rounded-full ${c.color}`} />
                    <span className="font-medium">{c.label}</span>
                    <span className="text-muted-foreground ml-auto">{c.range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {analysis && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[400px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />BP Analysis</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
              </motion.div>
            )}

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
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cat.bg} ${cat.color}`}>{cat.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No readings logged yet</p>
              )}
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" /><p className="text-sm text-muted-foreground">Consult your doctor for persistent high BP. Home readings should complement, not replace, clinical measurements.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
