import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, Sparkles, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

const postureIssues = ['Rounded shoulders', 'Forward head', 'Lower back pain', 'Upper back pain', 'Neck stiffness', 'Slouching', 'Anterior pelvic tilt', 'Kyphosis', 'Scoliosis concerns', 'Tech neck'];
const occupations = ['Desk job (8+ hrs)', 'Standing job', 'Manual labor', 'Driver', 'Student', 'Remote worker', 'Healthcare worker', 'Retail/Service'];
const painAreas = ['Neck', 'Upper back', 'Lower back', 'Shoulders', 'Hips', 'Wrists', 'Knees', 'None'];

export default function PostureCorrectorPage() {
  const [issues, setIssues] = useState<string[]>([]);
  const [occupation, setOccupation] = useState('');
  const [pain, setPain] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggleArr = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  };

  const handleAnalyze = async () => {
    if (issues.length === 0) { toast({ title: 'Select at least one posture issue', variant: 'destructive' }); return; }
    setIsLoading(true); setAnalysis(null);

    const prompt = `Posture correction plan:\n- Issues: ${issues.join(', ')}\n- Occupation: ${occupation || 'Not specified'}\n- Pain areas: ${pain.join(', ') || 'None'}\n\nProvide:\n1. Posture assessment based on reported issues\n2. 10+ targeted stretches and exercises with detailed descriptions (hold times, reps, sets)\n3. Daily routine (morning, midday, evening exercises)\n4. Ergonomic workspace setup tips (monitor height, chair, keyboard)\n5. Posture reminders and habits to develop\n6. Strengthening exercises for postural muscles\n7. When to see a physical therapist\n8. Progression plan (week 1-4)`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'posture-correction' }),
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500"><Monitor className="h-8 w-8 text-white" /></div>
          <h1 className="font-display text-3xl font-bold mb-2">Posture Corrector</h1>
          <p className="text-muted-foreground">Get personalized exercises & ergonomic tips for better posture</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div><Label>Posture Issues</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {postureIssues.map(i => (<button key={i} onClick={() => toggleArr(issues, i, setIssues)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${issues.includes(i) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i}</button>))}
                </div>
              </div>
              <div><Label>Occupation</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {occupations.map(o => (<button key={o} onClick={() => setOccupation(o)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${occupation === o ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{o}</button>))}
                </div>
              </div>
              <div><Label>Pain Areas</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {painAreas.map(p => (<button key={p} onClick={() => toggleArr(pain, p, setPain)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${pain.includes(p) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{p}</button>))}
                </div>
              </div>
            </div>
            <Button onClick={handleAnalyze} disabled={issues.length === 0 || isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Plan...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Exercise Plan</>}
            </Button>
          </div>
          <div className="space-y-4">
            {analysis ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[600px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Monitor className="h-5 w-5 text-primary" />Your Posture Plan</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
              </motion.div>
            ) : (
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <Monitor className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Posture Improvement</h3>
                <p className="text-muted-foreground">Select your issues to get a personalized exercise and ergonomic plan</p>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" /><p className="text-sm text-muted-foreground">Stop exercises if you feel sharp pain. Consult a physical therapist for chronic issues.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
