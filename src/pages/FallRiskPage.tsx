import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Loader2, AlertTriangle, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

const riskFactors = [
  { id: 'falls', text: 'History of falls in the past year', weight: 3 },
  { id: 'meds', text: 'Takes 4+ medications', weight: 2 },
  { id: 'dizzy_meds', text: 'Medications causing dizziness', weight: 2 },
  { id: 'vision', text: 'Vision problems', weight: 2 },
  { id: 'balance', text: 'Balance or walking difficulties', weight: 3 },
  { id: 'clutter', text: 'Home has clutter or loose rugs', weight: 1 },
  { id: 'lighting', text: 'Poor lighting at home', weight: 1 },
  { id: 'bathroom', text: 'No grab bars in bathroom', weight: 1 },
  { id: 'footwear', text: 'Wears loose/slippery footwear', weight: 1 },
  { id: 'weakness', text: 'Lower body weakness', weight: 2 },
  { id: 'fear', text: 'Fear of falling limits activity', weight: 2 },
  { id: 'incontinence', text: 'Urinary urgency/incontinence', weight: 1 },
];

export default function FallRiskPage() {
  const [age, setAge] = useState('');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const score = riskFactors.reduce((sum, f) => sum + (checked[f.id] ? f.weight : 0), 0);
  const riskLevel = score <= 3 ? 'Low' : score <= 8 ? 'Moderate' : 'High';
  const riskColor = score <= 3 ? 'text-success' : score <= 8 ? 'text-warning' : 'text-destructive';

  const handleAnalyze = async () => {
    if (!age) { toast({ title: 'Enter age', variant: 'destructive' }); return; }
    setIsLoading(true); setAnalysis(null);
    const activeFactors = riskFactors.filter(f => checked[f.id]).map(f => f.text);
    const prompt = `Senior fall risk assessment:\n- Age: ${age}\n- Risk Score: ${score} (${riskLevel})\n- Risk Factors: ${activeFactors.join(', ') || 'None identified'}\n\nProvide:\n1. Risk level interpretation\n2. Personalized prevention plan\n3. Home safety checklist (10+ items)\n4. Balance and strength exercises (5+ exercises with descriptions)\n5. Medication review recommendations\n6. When to discuss with a doctor\n7. Emergency preparedness tips`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'fall-risk' }),
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500"><UserCheck className="h-8 w-8 text-white" /></div>
          <h1 className="font-display text-3xl font-bold mb-2">Fall Risk Assessment</h1>
          <p className="text-muted-foreground">Evaluate fall risk for seniors and get prevention strategies</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div><Label>Age</Label><Input type="number" placeholder="75" value={age} onChange={e => setAge(e.target.value)} className="mt-1.5" /></div>
              <div><Label>Check all that apply:</Label>
                <div className="space-y-2 mt-3">
                  {riskFactors.map(f => (
                    <button key={f.id} onClick={() => setChecked(prev => ({ ...prev, [f.id]: !prev[f.id] }))}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all ${checked[f.id] ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30 border border-transparent hover:bg-muted/50'}`}>
                      <CheckCircle className={`w-4 h-4 shrink-0 ${checked[f.id] ? 'text-primary' : 'text-muted-foreground/30'}`} />
                      <span className={checked[f.id] ? 'text-foreground' : 'text-muted-foreground'}>{f.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-card ${riskColor}`}>
              <span className="text-2xl font-bold">{score}</span>
              <div><p className="font-semibold">{riskLevel} Risk</p><p className="text-xs text-muted-foreground">{riskFactors.filter(f => checked[f.id]).length} factors identified</p></div>
            </div>
            <Button onClick={handleAnalyze} disabled={!age || isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Prevention Plan</>}
            </Button>
          </div>
          <div className="space-y-4">
            {analysis ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[600px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><UserCheck className="h-5 w-5 text-primary" />Prevention Plan</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
              </motion.div>
            ) : (
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <UserCheck className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Fall Prevention</h3>
                <p className="text-muted-foreground">Complete the assessment for a personalized prevention plan</p>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" /><p className="text-sm text-muted-foreground">Discuss results with a healthcare provider. If you've had a recent fall, seek medical evaluation.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
