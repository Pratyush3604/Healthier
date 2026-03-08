import { useState } from 'react';
import { Monitor, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { cn } from '@/lib/utils';

const postureIssues = ['Rounded shoulders', 'Forward head', 'Lower back pain', 'Upper back pain', 'Neck stiffness', 'Slouching', 'Anterior pelvic tilt', 'Kyphosis', 'Scoliosis concerns', 'Tech neck', 'Uneven shoulders', 'Tight hip flexors'];
const occupations = ['Desk job (8+ hrs)', 'Standing job', 'Manual labor', 'Driver', 'Student', 'Remote worker', 'Healthcare worker', 'Retail/Service'];
const painAreas = ['Neck', 'Upper back', 'Lower back', 'Shoulders', 'Hips', 'Wrists', 'Knees', 'None'];

export default function PostureCorrectorPage() {
  const [issues, setIssues] = useState<string[]>([]);
  const [occupation, setOccupation] = useState('');
  const [pain, setPain] = useState<string[]>([]);
  const [painDuration, setPainDuration] = useState('recent');
  const [exerciseLevel, setExerciseLevel] = useState('sometimes');
  const [workSetup, setWorkSetup] = useState('basic');
  const [hoursSeated, setHoursSeated] = useState('');
  const { toast } = useToast();
  const ai = useAIStream({ type: 'posture-correction' });

  const toggleArr = (item: string, arr: string[], setter: (v: string[]) => void) =>
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);

  const handleAnalyze = async () => {
    if (issues.length === 0) { toast({ title: 'Select at least one posture issue', variant: 'destructive' }); return; }
    const prompt = `Posture correction plan:
- Issues: ${issues.join(', ')}
- Occupation: ${occupation || 'Not specified'}
- Hours seated daily: ${hoursSeated || 'Not specified'}
- Pain areas: ${pain.join(', ') || 'None'}
- Pain duration: ${painDuration}
- Exercise level: ${exerciseLevel}
- Workspace setup: ${workSetup}

Provide a comprehensive posture improvement plan:
1. **Posture Assessment** — analysis of reported issues and likely causes
2. **12+ Targeted Stretches & Exercises** with descriptions, hold times, reps, sets
3. **Daily Routine** — morning (10min), midday (5min), evening (10min)
4. **Ergonomic Workspace Setup** — monitor height, chair, keyboard, mouse, lighting
5. **Posture Habits** — reminders, cues, phone posture
6. **Strengthening Exercises** for weak postural muscles (10+ exercises)
7. **Mobility Work** for tight areas
8. **Standing Desk** tips and transition plan
9. **Sleeping Position** recommendations
10. **4-Week Progression Plan** — week-by-week goals
11. **When to See a Physical Therapist**
12. **Apps & Tools** that can help with posture reminders`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={<Monitor className="h-8 w-8 text-primary-foreground" />}
          title="Posture Corrector"
          description="Get personalized exercises & ergonomic tips for better posture"
          gradient="from-primary to-success"
        />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div>
                <Label>Posture Issues *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {postureIssues.map(i => (
                    <button key={i} onClick={() => toggleArr(i, issues, setIssues)}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        issues.includes(i) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Occupation</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {occupations.map(o => (
                    <button key={o} onClick={() => setOccupation(o)}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        occupation === o ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div><Label>Hours Seated Daily</Label><Input type="number" placeholder="8" value={hoursSeated} onChange={e => setHoursSeated(e.target.value)} /></div>
              <div>
                <Label>Pain Areas</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {painAreas.map(p => (
                    <button key={p} onClick={() => toggleArr(p, pain, setPain)}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        pain.includes(p) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div><Label>Pain Duration</Label><ChipSelect options={['recent', 'weeks', 'months', 'years']} value={painDuration} onChange={setPainDuration} /></div>
              <div><Label>Exercise Level</Label><ChipSelect options={['none', 'sometimes', 'regularly', 'daily']} value={exerciseLevel} onChange={setExerciseLevel} /></div>
              <div><Label>Workspace Setup</Label><ChipSelect options={['basic', 'ergonomic-chair', 'standing-desk', 'full-ergonomic']} value={workSetup} onChange={setWorkSetup} /></div>
            </div>
            <Button onClick={handleAnalyze} disabled={issues.length === 0 || ai.isLoading} className="w-full" size="lg">
              {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Plan...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Exercise Plan</>}
            </Button>
          </div>

          <AIResponseCard
            content={ai.response}
            isLoading={ai.isLoading}
            icon={<Monitor className="h-5 w-5 text-primary" />}
            title="Your Posture Plan"
            maxHeight="700px"
            emptyIcon={<Monitor className="h-16 w-16" />}
            emptyTitle="Posture Improvement"
            emptyDescription="Select your issues to get a personalized exercise and ergonomic plan"
            disclaimerText="Stop exercises if you feel sharp pain. Consult a physical therapist for chronic issues."
          />
        </div>
      </div>
    </div>
  );
}