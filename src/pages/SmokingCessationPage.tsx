import { useState } from 'react';
import { Wind, Sparkles, Loader2, TrendingUp, DollarSign, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { cn } from '@/lib/utils';

const triggers = ['Stress', 'Social situations', 'After meals', 'Boredom', 'Alcohol', 'Morning routine', 'Driving', 'Work breaks', 'Anxiety', 'Habit', 'Coffee', 'Loneliness'];

export default function SmokingCessationPage() {
  const [form, setForm] = useState({
    cigarettesPerDay: '', yearsSmoking: '', previousAttempts: '0',
    costPerPack: '10', motivation: 'health', nrtUsed: 'none',
    exerciseLevel: 'sometimes', supportSystem: 'some',
  });
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [quitDate, setQuitDate] = useLocalStorage<string>('healtify-quit-date', '');
  const { toast } = useToast();
  const ai = useAIStream({ type: 'smoking-cessation' });

  const toggleTrigger = (t: string) => setSelectedTriggers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const daysSmokeFree = quitDate ? Math.max(0, Math.floor((Date.now() - new Date(quitDate).getTime()) / 86400000)) : 0;
  const moneySaved = quitDate ? (daysSmokeFree * (parseInt(form.cigarettesPerDay) || 0) / 20 * parseFloat(form.costPerPack || '10')).toFixed(2) : '0';
  const cigarettesAvoided = quitDate ? daysSmokeFree * (parseInt(form.cigarettesPerDay) || 0) : 0;

  const handleAnalyze = async () => {
    if (!form.cigarettesPerDay) { toast({ title: 'Enter daily cigarettes', variant: 'destructive' }); return; }
    const prompt = `Smoking cessation plan:
- Cigarettes/day: ${form.cigarettesPerDay}
- Years smoking: ${form.yearsSmoking || 'Not specified'}
- Previous quit attempts: ${form.previousAttempts}
- Primary motivation: ${form.motivation}
- NRT previously used: ${form.nrtUsed}
- Exercise level: ${form.exerciseLevel}
- Support system: ${form.supportSystem}
- Triggers: ${selectedTriggers.join(', ') || 'Not specified'}
${quitDate ? `- Quit date: ${quitDate} (${daysSmokeFree} days smoke-free)` : '- Has not set quit date yet'}
- Money saved so far: $${moneySaved}

Provide a comprehensive quit plan:
1. **Personalized Quit Plan** with day-by-day timeline for first 2 weeks
2. **Nicotine Replacement Options** — patches, gum, lozenges, inhalers
3. **Coping Strategy** for EACH identified trigger (specific techniques)
4. **Health Benefits Timeline** — 20min, 12hrs, 2 weeks, 1 month, 3 months, 1 year, 5 years, 10 years
5. **Withdrawal Symptoms** — what to expect and how to manage each
6. **Exercise Plan** — how physical activity helps quit smoking
7. **Dietary Changes** — foods that reduce cravings
8. **Mindfulness & Breathing** techniques for urges
9. **Relapse Prevention** — strategies and what to do if you slip
10. **Support Resources** — apps, hotlines, support groups
11. **Financial Motivation** — projected savings at 1 month, 6 months, 1 year
12. **Long-term Wellness** plan post-quitting`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={<Wind className="h-8 w-8 text-primary-foreground" />}
          title="Quit Smoking Assistant"
          description="Get a personalized plan, track progress & stay motivated"
          gradient="from-success to-primary"
          showEmergency={false}
        />

        {quitDate && daysSmokeFree > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-2xl p-5 border border-border text-center">
              <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold font-display">{daysSmokeFree}</p>
              <p className="text-xs text-muted-foreground">Days Smoke-Free</p>
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border text-center">
              <DollarSign className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold font-display">${moneySaved}</p>
              <p className="text-xs text-muted-foreground">Money Saved</p>
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border text-center">
              <Heart className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold font-display">{cigarettesAvoided}</p>
              <p className="text-xs text-muted-foreground">Cigarettes Avoided</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Cigarettes/Day *</Label><Input type="number" placeholder="10" value={form.cigarettesPerDay} onChange={e => setForm({...form, cigarettesPerDay: e.target.value})} /></div>
                <div><Label>Years Smoking</Label><Input type="number" placeholder="5" value={form.yearsSmoking} onChange={e => setForm({...form, yearsSmoking: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Previous Quit Attempts</Label><Input type="number" placeholder="0" value={form.previousAttempts} onChange={e => setForm({...form, previousAttempts: e.target.value})} /></div>
                <div><Label>Cost Per Pack ($)</Label><Input type="number" step="0.5" placeholder="10" value={form.costPerPack} onChange={e => setForm({...form, costPerPack: e.target.value})} /></div>
              </div>
              <div><Label>Quit Date</Label><Input type="date" value={quitDate} onChange={e => setQuitDate(e.target.value)} /></div>
              <div><Label>Primary Motivation</Label><ChipSelect options={['health', 'family', 'money', 'fitness', 'appearance']} value={form.motivation} onChange={v => setForm({...form, motivation: v})} /></div>
              <div><Label>NRT Previously Used</Label><ChipSelect options={['none', 'patches', 'gum', 'lozenges', 'vaping', 'medication']} value={form.nrtUsed} onChange={v => setForm({...form, nrtUsed: v})} /></div>
              <div><Label>Exercise Level</Label><ChipSelect options={['none', 'sometimes', 'regularly', 'daily']} value={form.exerciseLevel} onChange={v => setForm({...form, exerciseLevel: v})} /></div>
              <div><Label>Support System</Label><ChipSelect options={['none', 'some', 'strong']} value={form.supportSystem} onChange={v => setForm({...form, supportSystem: v})} /></div>
              <div>
                <Label>Smoking Triggers</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {triggers.map(t => (
                    <button key={t} onClick={() => toggleTrigger(t)}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        selectedTriggers.includes(t) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={handleAnalyze} disabled={!form.cigarettesPerDay || ai.isLoading} className="w-full" size="lg">
              {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Plan...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Quit Plan</>}
            </Button>
          </div>

          <AIResponseCard
            content={ai.response}
            isLoading={ai.isLoading}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            title="Your Quit Plan"
            maxHeight="700px"
            emptyIcon={<Wind className="h-16 w-16" />}
            emptyTitle="Ready to Quit?"
            emptyDescription="Fill in your details for a personalized cessation plan"
            disclaimerText="Consider consulting a doctor for prescription cessation aids. You don't have to do this alone."
          />
        </div>
      </div>
    </div>
  );
}