import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

export default function MensHealthPage() {
  const [form, setForm] = useState({ age: '', sleep: 'fair', exercise: 'sometimes', stress: 'moderate', diet: 'average', symptoms: [] as string[] });
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const symptomOptions = ['Low energy', 'Low libido', 'Fatigue', 'Mood changes', 'Weight gain', 'Muscle loss', 'Poor sleep', 'Brain fog', 'Hair loss', 'Irritability'];
  const toggleSymptom = (s: string) => setForm(prev => ({ ...prev, symptoms: prev.symptoms.includes(s) ? prev.symptoms.filter(x => x !== s) : [...prev.symptoms, s] }));

  const ChipSelect = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${value === o ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{o}</button>
      ))}
    </div>
  );

  const handleAnalyze = async () => {
    if (!form.age) { toast({ title: 'Missing age', variant: 'destructive' }); return; }
    setIsLoading(true); setAnalysis(null);
    const prompt = `Men's health vitality assessment:\n- Age: ${form.age}\n- Sleep Quality: ${form.sleep}\n- Exercise: ${form.exercise}\n- Stress: ${form.stress}\n- Diet Quality: ${form.diet}\n- Symptoms: ${form.symptoms.join(', ') || 'None'}\n\nProvide:\n1. Vitality score estimation (1-100)\n2. Factor analysis for each area\n3. Exercise recommendations (types, frequency)\n4. Nutrition advice (testosterone-supporting foods)\n5. Sleep optimization tips\n6. Stress management techniques\n7. When to see a doctor for bloodwork\n8. Age-specific health screening recommendations`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'mens-health' }),
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600"><Shield className="h-8 w-8 text-white" /></div>
          <h1 className="font-display text-3xl font-bold mb-2">Men's Health & Vitality</h1>
          <p className="text-muted-foreground">Assess lifestyle factors affecting your energy, vitality and overall health</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div><Label>Age</Label><Input type="number" placeholder="30" value={form.age} onChange={e => setForm({...form, age: e.target.value})} className="mt-1.5" /></div>
              <div><Label>Sleep Quality</Label><ChipSelect options={['poor', 'fair', 'good', 'excellent']} value={form.sleep} onChange={v => setForm({...form, sleep: v})} /></div>
              <div><Label>Exercise Frequency</Label><ChipSelect options={['never', 'sometimes', 'regularly', 'daily']} value={form.exercise} onChange={v => setForm({...form, exercise: v})} /></div>
              <div><Label>Stress Level</Label><ChipSelect options={['low', 'moderate', 'high', 'very high']} value={form.stress} onChange={v => setForm({...form, stress: v})} /></div>
              <div><Label>Diet Quality</Label><ChipSelect options={['poor', 'average', 'good', 'excellent']} value={form.diet} onChange={v => setForm({...form, diet: v})} /></div>
              <div>
                <Label>Symptoms (if any)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {symptomOptions.map(s => (
                    <button key={s} onClick={() => toggleSymptom(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.symptoms.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={handleAnalyze} disabled={!form.age || isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Vitality Assessment</>}
            </Button>
          </div>
          <div className="space-y-4">
            {analysis ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[600px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Vitality Report</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
              </motion.div>
            ) : (
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <Shield className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Vitality Check</h3>
                <p className="text-muted-foreground">Fill in your details for a personalized health assessment</p>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" /><p className="text-sm text-muted-foreground">This is informational only. Consult a doctor for medical concerns or bloodwork.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
