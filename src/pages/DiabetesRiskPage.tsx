import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

export default function DiabetesRiskPage() {
  const [form, setForm] = useState({
    age: '', gender: 'male', weight: '', height: '',
    familyHistory: 'no', physicalActivity: 'moderate',
    fruitVeg: 'sometimes', highBP: 'no', highGlucose: 'no',
    waistCirc: 'normal',
  });
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // FINDRISC-inspired score
  const calcScore = () => {
    let score = 0;
    const age = parseInt(form.age);
    if (age >= 45 && age < 55) score += 2;
    else if (age >= 55 && age < 65) score += 3;
    else if (age >= 65) score += 4;

    const w = parseFloat(form.weight), h = parseFloat(form.height) / 100;
    if (w && h) { const bmi = w / (h * h); if (bmi >= 25 && bmi < 30) score += 1; else if (bmi >= 30) score += 3; }

    if (form.waistCirc === 'high') score += 3; else if (form.waistCirc === 'very-high') score += 4;
    if (form.physicalActivity === 'low') score += 2; else if (form.physicalActivity === 'none') score += 3;
    if (form.fruitVeg === 'rarely') score += 1;
    if (form.highBP === 'yes') score += 2;
    if (form.highGlucose === 'yes') score += 5;
    if (form.familyHistory === 'parent-sibling') score += 5; else if (form.familyHistory === 'grandparent') score += 3;
    return score;
  };

  const score = calcScore();
  const getRisk = () => {
    if (score < 7) return { label: 'Low', color: 'text-success', pct: '~1%' };
    if (score < 12) return { label: 'Slightly Elevated', color: 'text-primary', pct: '~4%' };
    if (score < 15) return { label: 'Moderate', color: 'text-warning', pct: '~17%' };
    if (score < 21) return { label: 'High', color: 'text-destructive', pct: '~33%' };
    return { label: 'Very High', color: 'text-destructive', pct: '~50%' };
  };
  const risk = getRisk();

  const ChipSelect = ({ options, value, onChange }: { options: { key: string; label: string }[]; value: string; onChange: (v: string) => void }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map(o => (<button key={o.key} onClick={() => onChange(o.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${value === o.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{o.label}</button>))}
    </div>
  );

  const handleAnalyze = async () => {
    if (!form.age || !form.weight || !form.height) { toast({ title: 'Fill required fields', variant: 'destructive' }); return; }
    setIsLoading(true); setAnalysis(null);
    const prompt = `Diabetes (Type 2) risk assessment:\n- Score: ${score} (${risk.label}, 10-year risk ~${risk.pct})\n- Age: ${form.age}, Gender: ${form.gender}\n- Weight: ${form.weight}kg, Height: ${form.height}cm\n- Family history: ${form.familyHistory}\n- Physical activity: ${form.physicalActivity}\n- Fruit/veg intake: ${form.fruitVeg}\n- High BP history: ${form.highBP}\n- Previous high glucose: ${form.highGlucose}\n- Waist circumference: ${form.waistCirc}\n\nProvide:\n1. Score interpretation and risk level\n2. Contributing factors breakdown\n3. Prevention strategies (diet, exercise, weight)\n4. Recommended screening tests\n5. Dietary guidelines for diabetes prevention\n6. Exercise recommendations\n7. Warning signs of diabetes\n8. When to see a doctor`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'diabetes-risk' }),
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-500"><Activity className="h-8 w-8 text-white" /></div>
          <h1 className="font-display text-3xl font-bold mb-2">Diabetes Risk Calculator</h1>
          <p className="text-muted-foreground">Estimate your Type 2 diabetes risk based on FINDRISC methodology</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Age</Label><Input type="number" placeholder="45" value={form.age} onChange={e => setForm({...form, age: e.target.value})} /></div>
                <div><Label>Weight (kg)</Label><Input type="number" placeholder="75" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} /></div>
                <div><Label>Height (cm)</Label><Input type="number" placeholder="170" value={form.height} onChange={e => setForm({...form, height: e.target.value})} /></div>
              </div>
              <div><Label>Gender</Label><ChipSelect options={[{key:'male',label:'Male'},{key:'female',label:'Female'}]} value={form.gender} onChange={v => setForm({...form, gender: v})} /></div>
              <div><Label>Family History of Diabetes</Label><ChipSelect options={[{key:'no',label:'No'},{key:'grandparent',label:'Grandparent/uncle/aunt'},{key:'parent-sibling',label:'Parent/sibling'}]} value={form.familyHistory} onChange={v => setForm({...form, familyHistory: v})} /></div>
              <div><Label>Physical Activity</Label><ChipSelect options={[{key:'daily',label:'Daily 30min+'},{key:'moderate',label:'3-4x/week'},{key:'low',label:'1-2x/week'},{key:'none',label:'None'}]} value={form.physicalActivity} onChange={v => setForm({...form, physicalActivity: v})} /></div>
              <div><Label>Fruit & Vegetable Intake</Label><ChipSelect options={[{key:'daily',label:'Daily'},{key:'sometimes',label:'Sometimes'},{key:'rarely',label:'Rarely'}]} value={form.fruitVeg} onChange={v => setForm({...form, fruitVeg: v})} /></div>
              <div><Label>Waist Circumference</Label><ChipSelect options={[{key:'normal',label:'Normal'},{key:'high',label:'High (M:94-102/F:80-88cm)'},{key:'very-high',label:'Very High (M:>102/F:>88cm)'}]} value={form.waistCirc} onChange={v => setForm({...form, waistCirc: v})} /></div>
              <div><Label>History of High Blood Pressure</Label><ChipSelect options={[{key:'no',label:'No'},{key:'yes',label:'Yes'}]} value={form.highBP} onChange={v => setForm({...form, highBP: v})} /></div>
              <div><Label>Ever Had High Blood Glucose</Label><ChipSelect options={[{key:'no',label:'No'},{key:'yes',label:'Yes'}]} value={form.highGlucose} onChange={v => setForm({...form, highGlucose: v})} /></div>
            </div>

            <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border bg-card`}>
              <span className={`text-3xl font-bold ${risk.color}`}>{score}</span>
              <div><p className={`font-semibold ${risk.color}`}>{risk.label} Risk</p><p className="text-xs text-muted-foreground">10-year probability: {risk.pct}</p></div>
            </div>

            <Button onClick={handleAnalyze} disabled={!form.age || !form.weight || !form.height || isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Risk Analysis</>}
            </Button>
          </div>
          <div className="space-y-4">
            {analysis ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[600px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Risk Analysis</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
              </motion.div>
            ) : (
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <Activity className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Diabetes Risk</h3>
                <p className="text-muted-foreground">Complete the form to calculate your risk score</p>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" /><p className="text-sm text-muted-foreground">This is a screening tool, not a diagnosis. See a doctor for blood glucose testing.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
