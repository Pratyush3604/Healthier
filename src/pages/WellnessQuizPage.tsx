import { useState } from 'react';
import { Sparkles, Loader2, Star, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';

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
  const { toast } = useToast();
  const ai = useAIStream({ type: 'wellness-quiz' });

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
    const grade = getGrade();
    const answersText = dimensions.map(d => `${d.label}: ${d.options[answers[d.id]]} (${answers[d.id] + 1}/4)`).join('\n');
    const prompt = `Holistic wellness assessment (Score: ${totalScore}/${maxScore}, ${percentage}%, ${grade.label}):\n\n${answersText}\n\nProvide:\n1. **Overall wellness score** interpretation\n2. **Strength areas** to celebrate\n3. **Top 3 areas** for improvement with specific action plans\n4. **30-day wellness challenge** tailored to weak areas\n5. **Daily wellness routine** suggestion\n6. **Resources and activities** for each dimension\n7. **Motivational advice** for sustained wellness\n\nBe encouraging and practical.`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const grade = getGrade();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          icon={<Star className="h-8 w-8 text-primary-foreground" />}
          title="Wellness Quiz"
          description="Assess your overall wellness across 8 dimensions"
          gradient="from-accent to-primary"
        />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-5">
              {dimensions.map((d, di) => (
                <div key={d.id}>
                  <p className="text-sm font-medium mb-2">{di + 1}. {d.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {d.options.map((opt, oi) => (
                      <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [d.id]: oi }))}
                        className={cn("px-3 py-2 rounded-lg text-xs font-medium transition-all",
                          answers[d.id] === oi ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
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
                <p className={cn("text-3xl font-bold font-display", grade.color)}>{percentage}%</p>
                <p className={cn("font-semibold", grade.color)}>{grade.label}</p>
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

            <Button onClick={handleAnalyze} disabled={!allAnswered || ai.isLoading} className="w-full" size="lg">
              {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Wellness Report</>}
            </Button>
          </div>
          <div className="space-y-4">
            <AIResponseCard
              content={ai.response}
              isLoading={ai.isLoading}
              icon={<Target className="h-5 w-5 text-primary" />}
              title="Wellness Report"
              emptyIcon={<Star className="h-16 w-16" />}
              emptyTitle="Your Wellness Score"
              emptyDescription="Answer all 8 questions to get your personalized wellness report"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
