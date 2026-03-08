import { useState } from 'react';
import { Moon, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { Loader2 } from 'lucide-react';

export default function SleepAnalysisPage() {
  const [form, setForm] = useState({
    bedtime: '23:00', wakeup: '07:00', quality: 'fair',
    wakeups: '1', caffeine: 'moderate', screen: 'yes',
    exercise: 'sometimes', stress: 'moderate', naps: 'no',
    room: 'dark', mattress: 'good',
  });
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const { toast } = useToast();
  const ai = useAIStream({ type: 'sleep-analysis' });

  const calcSleepHours = () => {
    const [bh, bm] = form.bedtime.split(':').map(Number);
    const [wh, wm] = form.wakeup.split(':').map(Number);
    let diff = (wh * 60 + wm) - (bh * 60 + bm);
    if (diff < 0) diff += 24 * 60;
    return Math.round(diff / 6) / 10;
  };

  const handleAnalyze = async () => {
    const hours = calcSleepHours();
    setSleepHours(hours);

    const prompt = `Analyze my sleep in detail:
- Bedtime: ${form.bedtime}, Wake: ${form.wakeup} (${hours} hours)
- Perceived Quality: ${form.quality}
- Night Wakeups: ${form.wakeups}
- Caffeine Intake: ${form.caffeine}
- Screen Before Bed: ${form.screen}
- Exercise Routine: ${form.exercise}
- Stress Level: ${form.stress}
- Daytime Naps: ${form.naps}
- Room Environment: ${form.room}
- Mattress Quality: ${form.mattress}

Provide:
1. **Sleep Score** out of 100 with breakdown
2. **Sleep Duration Assessment**
3. **Detailed analysis** of each factor
4. **Personalized improvement plan** (at least 8 actionable tips)
5. **Relaxation techniques** for better sleep
6. **Circadian rhythm advice**
7. **When to see a sleep specialist**`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', description: 'Failed to analyze sleep.', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={<Moon className="h-8 w-8 text-primary-foreground" />}
          title="AI Sleep Analysis"
          description="Get a detailed sleep score and improvement plan"
          gradient="from-secondary to-primary"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Bedtime</Label><Input type="time" value={form.bedtime} onChange={e => setForm({...form, bedtime: e.target.value})} /></div>
                <div><Label>Wake-up</Label><Input type="time" value={form.wakeup} onChange={e => setForm({...form, wakeup: e.target.value})} /></div>
              </div>
              <div><Label>Sleep Quality</Label><ChipSelect options={['poor', 'fair', 'good', 'excellent']} value={form.quality} onChange={v => setForm({...form, quality: v})} /></div>
              <div><Label>Night Wakeups</Label><Input type="number" min="0" value={form.wakeups} onChange={e => setForm({...form, wakeups: e.target.value})} /></div>
              <div><Label>Caffeine Intake</Label><ChipSelect options={['none', 'low', 'moderate', 'high']} value={form.caffeine} onChange={v => setForm({...form, caffeine: v})} /></div>
              <div><Label>Screen Before Bed</Label><ChipSelect options={['yes', 'no']} value={form.screen} onChange={v => setForm({...form, screen: v})} /></div>
              <div><Label>Exercise Routine</Label><ChipSelect options={['never', 'sometimes', 'regularly', 'daily']} value={form.exercise} onChange={v => setForm({...form, exercise: v})} /></div>
              <div><Label>Stress Level</Label><ChipSelect options={['low', 'moderate', 'high', 'very-high']} value={form.stress} onChange={v => setForm({...form, stress: v})} /></div>
              <div><Label>Daytime Naps</Label><ChipSelect options={['no', 'short', 'long']} value={form.naps} onChange={v => setForm({...form, naps: v})} /></div>
              <div><Label>Room Environment</Label><ChipSelect options={['dark', 'dim', 'bright']} value={form.room} onChange={v => setForm({...form, room: v})} /></div>
              <div><Label>Mattress Comfort</Label><ChipSelect options={['poor', 'okay', 'good', 'excellent']} value={form.mattress} onChange={v => setForm({...form, mattress: v})} /></div>
            </div>
            <Button onClick={handleAnalyze} disabled={ai.isLoading} className="w-full" size="lg">
              {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Analyze My Sleep</>}
            </Button>
          </div>

          <div className="space-y-4">
            {sleepHours !== null && (
              <div className="bg-card rounded-2xl p-6 border border-border text-center shadow-soft">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-4xl font-bold font-display">{sleepHours}h</p>
                <p className="text-sm text-muted-foreground">Estimated Sleep Duration</p>
              </div>
            )}

            <AIResponseCard
              content={ai.response}
              isLoading={ai.isLoading}
              icon={<Moon className="h-5 w-5 text-primary" />}
              title="Sleep Analysis"
              emptyIcon={<Moon className="h-16 w-16" />}
              emptyTitle="No Analysis Yet"
              emptyDescription="Enter your sleep details and click analyze"
              disclaimerText="For persistent sleep issues, consult a healthcare provider or sleep specialist."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
