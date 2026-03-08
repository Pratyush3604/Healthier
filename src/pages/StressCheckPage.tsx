import { useState } from 'react';
import { Brain, Loader2, Sparkles, Heart, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';

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
  const { toast } = useToast();
  const ai = useAIStream({ type: 'stress-check' });

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

    const severity = getSeverity();
    const answersText = questions.map(q => `${q.text} → ${options[answers[q.id]].label}`).join('\n');
    const prompt = `Analyze this mental wellness assessment (PHQ-8 style, score ${totalScore}/${maxScore}, severity: ${severity.label}):\n\n${answersText}\n\nProvide:\n1. **Score interpretation** and what it means\n2. **5+ immediate coping techniques** (breathing, grounding, journaling)\n3. **Lifestyle modifications** for mental wellness\n4. **When to seek professional help**\n5. **Crisis resources** (general hotline numbers)\n6. **Daily wellness routine** suggestion\n\nBe empathetic, supportive, and encouraging.`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', description: 'Failed to analyze.', variant: 'destructive' }); }
  };

  const severity = getSeverity();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          icon={<Brain className="h-8 w-8 text-primary-foreground" />}
          title="Mental Wellness Check"
          description="Assess your stress and mental well-being with AI-powered insights"
          gradient="from-accent to-secondary"
        />

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
                        className={cn("px-3 py-2 rounded-lg text-xs font-medium transition-all",
                          answers[q.id] === opt.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {allAnswered && (
              <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border", severity.bg)}>
                <Brain className={cn("w-5 h-5", severity.color)} />
                <span className={cn("font-semibold", severity.color)}>Score: {totalScore}/{maxScore} — {severity.label}</span>
              </div>
            )}

            <Button onClick={handleAnalyze} disabled={!allAnswered || ai.isLoading} className="w-full" size="lg">
              {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Wellness Insights</>}
            </Button>
          </div>

          <div className="space-y-4">
            {!ai.response && !allAnswered && (
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <Brain className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Answer All Questions</h3>
                <p className="text-muted-foreground">Complete the questionnaire to receive your wellness assessment</p>
              </div>
            )}

            {!ai.response && allAnswered && (
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
            )}

            <AIResponseCard
              content={ai.response}
              isLoading={ai.isLoading}
              icon={<Brain className="h-5 w-5 text-primary" />}
              title="Wellness Analysis"
              showDisclaimer={!!ai.response}
              disclaimerText="This is not a clinical diagnosis. If you're in crisis, please call your local emergency number or a crisis hotline immediately."
              emptyIcon={null}
              emptyTitle=""
              emptyDescription=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}
