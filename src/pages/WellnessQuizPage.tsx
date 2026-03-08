import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, AlertTriangle, Star, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

const dimensions = [
  { id: 'physical', label: 'Physical Activity', question: 'How often do you exercise (30+ min)?', options: ['Rarely', '1-2x/week', '3-4x/week', '5+/week'] },
  { id: 'nutrition', label: 'Nutrition', question: 'How would you rate your overall diet?', options: ['Poor', 'Fair', 'Good', 'Excellent'] },
  { id: 'sleep', label: 'Sleep', question: 'How well do you sleep most nights?', options: ['Poorly', 'Fair', 'Well', 'Very Well'] },
  { id: 'stress', label: 'Stress Management', question: 'How well do you manage stress?', options: ['Not well', 'Somewhat', 'Well', 'Very well'] },
  { id: 'social', label: 'Social Connection', question: 'How connected do you feel to others?', options: ['Isolated', 'Somewhat', 'Connected', 'Very connected'] },
  { id: 'purpose', label: 'Purpose & Meaning', question: 'Do you feel a sense of purpose in life?', options: ['Rarely', 'Sometimes', 'Often', 'Almost always'] },
  { id: 'hydration', label: 'Hydration', question: 'How much water do you drink daily?', options: ['< 4 cups', '4-6 cups', '6-8 cups', '8+ cups'] },
  { id: 'mental', label: 'Mental Health', question: 'How often do you feel happy and content?', options: ['Rarely', 'Sometimes', 'Often', 'Most of the time'] },
];

export default function WellnessQuizPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const allAnswered = Object.keys(answers).length === dimensions.length;
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxScore = dimensions.length * 3;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const getGrade = () => {
    if (percentage >= 85) return { label: 'Excellent', color: 'text-success', emoji: '🌟' };
    if (percentage >= 70) return { label: 'Good', color: 'text-primary', emoji: '👍' };
    if (percentage >= 50) return { label: 'Fair', color: 'text-warning', emoji: '⚡' };
    return { label: 'Needs Improvement', color: 'text-destructive', emoji: '🎯' };
  };

  const handleAnalyze = async () => {
    if (!allAnswered) { toast({ title: 'Complete all questions', variant: 'destructive' }); return; }
    setIsLoading(true); setAnalysis(null);
    const grade = getGrade();
    const answersText = dimensions.map(d => `${d.label}: ${d.options[answers[d.id]]} (${answers[d.id] + 1}/4)`).join('\n');
    const prompt = `Holistic wellness assessment (Score: ${totalScore}/${maxScore}, ${percentage}%, ${grade.label}):\n\n${answersText}\n\nProvide:\n1. Overall wellness score interpretation\n2. Strength areas to celebrate\n3. Top 3 areas for improvement with specific action plans\n4. 30-day wellness challenge tailored to weak areas\n5. Daily wellness routine suggestion\n6. Resources and activities for each dimension\n7. Motivational advice for sustained wellness\n\nBe encouraging and practical.`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'wellness-quiz' }),
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

  const grade = getGrade();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-500"><Star className="h-8 w-8 text-white" /></div>
          <h1 className="font-display text-3xl font-bold mb-2">Wellness Quiz</h1>
          <p className="text-muted-foreground">Assess your overall wellness across 8 dimensions</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-5">
              {dimensions.map((d, di) => (
                <div key={d.id}>
                  <p className="text-sm font-medium mb-2">{di + 1}. {d.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {d.options.map((opt, oi) => (
                      <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [d.id]: oi }))}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${answers[d.id] === oi ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {allAnswered && (
              <div className="bg-card rounded-2xl p-6 border border-border text-center">
                <p className="text-5xl mb-2">{grade.emoji}</p>
                <p className={`text-3xl font-bold ${grade.color}`}>{percentage}%</p>
                <p className={`font-semibold ${grade.color}`}>{grade.label}</p>
                <div className="mt-4 h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${percentage}%` }} />
                </div>
                <div className="grid grid-cols-4 gap-1 mt-3">
                  {dimensions.map(d => (
                    <div key={d.id} className="text-center">
                      <div className="text-xs font-bold">{((answers[d.id] ?? 0) + 1) * 25}%</div>
                      <div className="text-[9px] text-muted-foreground truncate">{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleAnalyze} disabled={!allAnswered || isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Wellness Report</>}
            </Button>
          </div>
          <div className="space-y-4">
            {analysis ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[600px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Wellness Report</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
              </motion.div>
            ) : (
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <Star className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your Wellness Score</h3>
                <p className="text-muted-foreground">Answer all 8 questions to get your personalized wellness report</p>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" /><p className="text-sm text-muted-foreground">This is a general wellness assessment, not a medical evaluation. For health concerns, consult a professional.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
