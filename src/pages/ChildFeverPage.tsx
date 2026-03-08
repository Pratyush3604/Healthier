import { useState } from 'react';
import { motion } from 'framer-motion';
import { Baby, Loader2, AlertTriangle, Sparkles, Phone, Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

const otherSymptoms = ['Cough', 'Rash', 'Vomiting', 'Diarrhea', 'Ear pain', 'Crying/fussy', 'Not eating', 'Lethargy', 'Stiff neck', 'Difficulty breathing', 'Seizure', 'Dehydration'];

export default function ChildFeverPage() {
  const [form, setForm] = useState({ ageMonths: '', temperature: '', tempUnit: 'F', duration: 'less-than-24h' });
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleSymptom = (s: string) => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const getUrgency = () => {
    const temp = parseFloat(form.temperature);
    const age = parseInt(form.ageMonths);
    if (!temp || !age) return null;
    const tempF = form.tempUnit === 'C' ? temp * 9/5 + 32 : temp;
    if (age < 3 && tempF >= 100.4) return 'emergency';
    if (tempF >= 104) return 'emergency';
    if (symptoms.includes('Seizure') || symptoms.includes('Difficulty breathing') || symptoms.includes('Stiff neck')) return 'emergency';
    if (tempF >= 102 || symptoms.includes('Dehydration') || symptoms.includes('Lethargy')) return 'high';
    return 'moderate';
  };

  const urgency = getUrgency();

  const handleAnalyze = async () => {
    if (!form.ageMonths || !form.temperature) { toast({ title: 'Missing info', description: 'Enter age and temperature.', variant: 'destructive' }); return; }
    setIsLoading(true); setAnalysis(null);

    const prompt = `Pediatric fever assessment:\n- Child age: ${form.ageMonths} months\n- Temperature: ${form.temperature}°${form.tempUnit}\n- Duration: ${form.duration}\n- Other symptoms: ${symptoms.join(', ') || 'None'}\n\nProvide:\n1. Urgency assessment with clear badge\n2. Age-appropriate fever management steps\n3. Safe medication guidance (general, no specific dosages)\n4. Hydration and comfort measures\n5. Red flags to watch for\n6. When to go to the ER vs wait\n7. Recovery timeline expectations`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'child-fever' }),
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500"><Baby className="h-8 w-8 text-white" /></div>
          <h1 className="font-display text-3xl font-bold mb-2">Child Fever Guide</h1>
          <p className="text-muted-foreground">Age-appropriate fever management for children</p>
        </div>

        {urgency === 'emergency' && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 animate-urgent flex items-center justify-between">
            <div className="flex items-center gap-3"><AlertTriangle className="w-6 h-6 text-destructive" /><span className="font-bold text-destructive">Seek immediate medical attention!</span></div>
            <Link to="/emergency"><Button variant="destructive" size="sm"><Phone className="w-4 h-4 mr-1" />Emergency</Button></Link>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div><Label>Child's Age (months)</Label><Input type="number" placeholder="12" value={form.ageMonths} onChange={e => setForm({...form, ageMonths: e.target.value})} className="mt-1.5" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Temperature</Label><Input type="number" step="0.1" placeholder="101.5" value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} className="mt-1.5" /></div>
                <div><Label>Unit</Label>
                  <div className="flex gap-2 mt-1.5">
                    {['F', 'C'].map(u => (<button key={u} onClick={() => setForm({...form, tempUnit: u})} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${form.tempUnit === u ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>°{u}</button>))}
                  </div>
                </div>
              </div>
              <div><Label>Duration</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['less-than-24h', '1-2 days', '3-5 days', 'more-than-5-days'].map(d => (
                    <button key={d} onClick={() => setForm({...form, duration: d})} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.duration === d ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{d.replace(/-/g, ' ')}</button>
                  ))}
                </div>
              </div>
              <div><Label>Other Symptoms</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {otherSymptoms.map(s => (<button key={s} onClick={() => toggleSymptom(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${symptoms.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{s}</button>))}
                </div>
              </div>
            </div>

            {form.temperature && (
              <div className="bg-card rounded-2xl p-5 border border-border flex items-center gap-4">
                <Thermometer className={`w-8 h-8 ${urgency === 'emergency' ? 'text-destructive' : urgency === 'high' ? 'text-warning' : 'text-success'}`} />
                <div>
                  <p className="text-2xl font-bold">{form.temperature}°{form.tempUnit}</p>
                  <p className="text-sm text-muted-foreground">{urgency === 'emergency' ? 'High — Seek care' : urgency === 'high' ? 'Elevated — Monitor closely' : 'Moderate — Home care'}</p>
                </div>
              </div>
            )}

            <Button onClick={handleAnalyze} disabled={!form.ageMonths || !form.temperature || isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Fever Guide</>}
            </Button>
          </div>

          <div className="space-y-4">
            {analysis ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[600px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Baby className="h-5 w-5 text-accent" />Fever Assessment</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
              </motion.div>
            ) : (
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <Baby className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Fever Guide</h3>
                <p className="text-muted-foreground">Enter your child's details for age-appropriate guidance</p>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" /><p className="text-sm text-muted-foreground">Always consult a pediatrician for persistent or high fever. Call emergency services for infants under 3 months with fever ≥100.4°F.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
