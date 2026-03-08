import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, AlertTriangle, Sparkles, Heart, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

const questions = [
  { id: 'interest', text: 'Little interest or pleasure in doing things?' },
  { id: 'feeling_down', text: 'Feeling down, depressed, or hopeless?' },
  { id: 'sleep', text: 'Trouble falling or staying asleep, or sleeping too much?' },
  { id: 'energy', text: 'Feeling tired or having little energy?' },
  { id: 'appetite', text: 'Poor appetite or overeating?' },
  { id: 'self_image', text: 'Feeling bad about yourself?' },
  { id: 'concentration', text: 'Trouble concentrating on things?' },
  { id: 'movement', text: 'Moving or speaking noticeably slowly or being fidgety?' },
];

const options = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half' },
  { value: 3, label: 'Nearly every day' },
];

export default function StressCheckPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxScore = questions.length * 3;
  const allAnswered = Object.keys(answers).length === questions.length;

  const getSeverity = () => {
    if (totalScore <= 4) return { label: 'Minimal', color: 'text-success', bg: 'bg-success/10 border-success/30' };
    if (totalScore <= 9) return { label: 'Mild', color: 'text-primary', bg: 'bg-primary/10 border-primary/30' };
    if (totalScore <= 14) return { label: 'Moderate', color: 'text-warning', bg: 'bg-warning/10 border-warning/30' };
    return { label: 'Severe', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30' };
  };

  const handleAnalyze = async () => {
    if (!allAnswered) { toast({ title: 'Incomplete', description: 'Please answer all questions.', variant: 'destructive' }); return; }
    setIsLoading(true); setAnalysis(null);

    const severity = getSeverity();
    const answersText = questions.map(q => `${q.text} → ${options[answers[q.id]].label}`).join('\n');
    const prompt = `Analyze this mental wellness assessment (PHQ-8 style, score ${totalScore}/${maxScore}, severity: ${severity.label}):\n\n${answersText}\n\nProvide:\n1. Score interpretation and what it means\n2. 5+ immediate coping techniques (breathing, grounding, journaling)\n3. Lifestyle modifications for mental wellness\n4. When to seek professional help\n5. Crisis resources (general hotline numbers)\n6. Daily wellness routine suggestion\n\nBe empathetic, supportive, and encouraging.`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'stress-check' }),
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
    } catch { toast({ title: 'Error', description: 'Failed to analyze. Please try again.', variant: 'destructive' }); }
    finally { setIsLoading(false); }
  };

  const severity = getSeverity();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-500">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Mental Wellness Check</h1>
          <p className="text-muted-foreground">Assess your stress and mental well-being with AI-powered insights</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-5">
              <p className="text-sm text-muted-foreground">Over the last 2 weeks, how often have you been bothered by the following?</p>
              {questions.map((q, qi) => (
                <div key={q.id}>
                  <p className="text-sm font-medium mb-2">{qi + 1}. {q.text}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {options.map(opt => (
                      <button key={opt.value} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.value }))}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${answers[q.id] === opt.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {allAnswered && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${severity.bg}`}>
                <Brain className={`w-5 h-5 ${severity.color}`} />
                <div>
                  <span className={`font-semibold ${severity.color}`}>Score: {totalScore}/{maxScore} — {severity.label}</span>
                </div>
              </div>
            )}

            <Button onClick={handleAnalyze} disabled={!allAnswered || isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Wellness Insights</>}
            </Button>
          </div>

          <div className="space-y-4">
            {!analysis && !allAnswered && (
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <Brain className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Answer All Questions</h3>
                <p className="text-muted-foreground">Complete the questionnaire to receive your wellness assessment</p>
              </div>
            )}

            {!analysis && allAnswered && (
              <div className="space-y-4">
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="font-semibold mb-4">Quick Coping Techniques</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                      <Wind className="w-5 h-5 text-primary mt-0.5" />
                      <div><p className="text-sm font-medium">4-7-8 Breathing</p><p className="text-xs text-muted-foreground">Inhale 4s, hold 7s, exhale 8s. Repeat 4 times.</p></div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                      <Heart className="w-5 h-5 text-accent mt-0.5" />
                      <div><p className="text-sm font-medium">5-4-3-2-1 Grounding</p><p className="text-xs text-muted-foreground">5 things you see, 4 touch, 3 hear, 2 smell, 1 taste.</p></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analysis && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[600px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Brain className="h-5 w-5 text-primary" />Wellness Analysis</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
              </motion.div>
            )}

            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">This is not a clinical diagnosis. If you're in crisis, please call your local emergency number or a crisis hotline immediately.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
