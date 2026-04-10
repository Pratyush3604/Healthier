import { useState } from 'react';
import { Monitor, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { FloatingBackground } from '@/components/FloatingBackground';
import { ScrollReveal } from '@/components/ScrollReveal';
import { cn } from '@/lib/utils';

const postureIssues = ['Rounded shoulders', 'Forward head', 'Lower back pain', 'Upper back pain', 'Neck stiffness', 'Slouching', 'Anterior pelvic tilt', 'Kyphosis', 'Scoliosis concerns', 'Tech neck', 'Uneven shoulders', 'Tight hip flexors'];
const occupations = ['Desk job (8+ hrs)', 'Standing job', 'Manual labor', 'Driver', 'Student', 'Remote worker', 'Healthcare worker', 'Retail/Service'];
const painAreas = ['Neck', 'Upper back', 'Lower back', 'Shoulders', 'Hips', 'Wrists', 'Knees', 'None'];

export default function PostureCorrectorPage() {
  const [issues, setIssues] = useState<string[]>([]);
  const [occupation, setOccupation] = useState('');
  const [customOccupation, setCustomOccupation] = useState('');
  const [pain, setPain] = useState<string[]>([]);
  const [customPainArea, setCustomPainArea] = useState('');
  const [painDuration, setPainDuration] = useState('recent');
  const [exerciseLevel, setExerciseLevel] = useState('sometimes');
  const [workSetup, setWorkSetup] = useState('basic');
  const [hoursSeated, setHoursSeated] = useState('');
  const [age, setAge] = useState('');
  const [customIssues, setCustomIssues] = useState('');
  const [sleepPosition, setSleepPosition] = useState('side');
  const [stressLevel, setStressLevel] = useState('moderate');
  const [previousTreatment, setPreviousTreatment] = useState('');
  const [goals, setGoals] = useState('');
  const [screenTime, setScreenTime] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [footwear, setFootwear] = useState('');
  const [hobbyActivities, setHobbyActivities] = useState('');
  const { toast } = useToast();
  const ai = useAIStream({ type: 'posture-correction' });

  const toggleArr = (item: string, arr: string[], setter: (v: string[]) => void) =>
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);

  const handleAnalyze = async () => {
    if (issues.length === 0 && !customIssues) { toast({ title: 'Select at least one posture issue or describe it', variant: 'destructive' }); return; }
    const allIssues = [...issues, ...(customIssues ? [customIssues] : [])].join(', ');
    const allPain = [...pain, ...(customPainArea ? [customPainArea] : [])].join(', ') || 'None';
    const occ = occupation || customOccupation || 'Not specified';

    const prompt = `Posture correction plan:
- Issues: ${allIssues}
- Age: ${age || 'Not specified'}
- Weight: ${weight || 'Not specified'}kg, Height: ${height || 'Not specified'}cm
- Occupation: ${occ}
- Hours seated daily: ${hoursSeated || 'Not specified'}
- Screen time daily: ${screenTime || 'Not specified'} hours
- Pain areas: ${allPain}
- Pain duration: ${painDuration}
- Exercise level: ${exerciseLevel}
- Workspace setup: ${workSetup}
- Sleep position: ${sleepPosition}
- Stress level: ${stressLevel}
- Footwear type: ${footwear || 'Not specified'}
- Hobbies/Activities: ${hobbyActivities || 'Not specified'}
${previousTreatment ? `- Previous treatment: ${previousTreatment}` : ''}
${goals ? `- Personal goals: ${goals}` : ''}

IMPORTANT: Do NOT prescribe medications. Only recommend exercises, stretches, and ergonomic adjustments.

Provide EXACTLY these 4 sections:

## 🔍 Posture Assessment
Analyze the reported issues, identify the root causes, how the issues are connected, and what muscle groups are affected.

## 🏋️ Targeted Exercises (3-4 exercises)
For each exercise provide: name, description with proper form, hold time or reps, sets, and which muscle group it targets. Keep it to 3-4 most effective exercises for the specific issues.

## 📅 Daily Routine
A simple morning (5min) and evening (5min) routine incorporating the exercises above with timing.

## 🩺 When to See a Professional
Clear signs that indicate the person should consult a physiotherapist or orthopedist.`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="relative">
      <FloatingBackground variant="posture" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            icon={<Monitor className="h-8 w-8 text-primary-foreground" />}
            title="Posture Corrector"
            description="Get personalized exercises & ergonomic tips for better posture"
            gradient="from-primary to-success"
          />
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <ScrollReveal delay={0.1}>
                <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4 hover:shadow-elevated transition-shadow duration-300">
                  <div>
                    <Label>Posture Issues *</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {postureIssues.map(i => (
                        <button key={i} onClick={() => toggleArr(i, issues, setIssues)}
                          className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95",
                            issues.includes(i) ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:shadow-soft')}>
                          {i}
                        </button>
                      ))}
                    </div>
                    <Input className="mt-2" placeholder="Other issues not listed above..." value={customIssues} onChange={e => setCustomIssues(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Age</Label><Input type="number" placeholder="30" value={age} onChange={e => setAge(e.target.value)} /></div>
                    <div><Label>Weight (kg)</Label><Input type="number" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)} /></div>
                    <div><Label>Height (cm)</Label><Input type="number" placeholder="175" value={height} onChange={e => setHeight(e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Hours Seated Daily</Label><Input type="number" placeholder="8" value={hoursSeated} onChange={e => setHoursSeated(e.target.value)} /></div>
                    <div><Label>Screen Time (hrs)</Label><Input type="number" placeholder="6" value={screenTime} onChange={e => setScreenTime(e.target.value)} /></div>
                  </div>
                  <div>
                    <Label>Occupation</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {occupations.map(o => (
                        <button key={o} onClick={() => setOccupation(o)}
                          className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95",
                            occupation === o ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:shadow-soft')}>
                          {o}
                        </button>
                      ))}
                    </div>
                    <Input className="mt-2" placeholder="Or type your occupation..." value={customOccupation} onChange={e => setCustomOccupation(e.target.value)} />
                  </div>
                  <div>
                    <Label>Pain Areas</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {painAreas.map(p => (
                        <button key={p} onClick={() => toggleArr(p, pain, setPain)}
                          className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95",
                            pain.includes(p) ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:shadow-soft')}>
                          {p}
                        </button>
                      ))}
                    </div>
                    <Input className="mt-2" placeholder="Other pain areas..." value={customPainArea} onChange={e => setCustomPainArea(e.target.value)} />
                  </div>
                  <div><Label>Pain Duration</Label><ChipSelect options={['recent', 'weeks', 'months', 'years']} value={painDuration} onChange={setPainDuration} customPlaceholder="How long..." /></div>
                  <div><Label>Exercise Level</Label><ChipSelect options={['none', 'sometimes', 'regularly', 'daily']} value={exerciseLevel} onChange={setExerciseLevel} customPlaceholder="Describe your exercise level..." /></div>
                  <div><Label>Workspace Setup</Label><ChipSelect options={['basic', 'ergonomic-chair', 'standing-desk', 'full-ergonomic']} value={workSetup} onChange={setWorkSetup} customPlaceholder="Describe your workspace..." /></div>
                  <div><Label>Sleep Position</Label><ChipSelect options={['back', 'side', 'stomach', 'varies']} value={sleepPosition} onChange={setSleepPosition} customPlaceholder="Your sleep position..." /></div>
                  <div><Label>Stress Level</Label><ChipSelect options={['low', 'moderate', 'high', 'very-high']} value={stressLevel} onChange={setStressLevel} customPlaceholder="Describe your stress..." /></div>
                  <div><Label>Footwear Type</Label><Input placeholder="Flat shoes, heels, sneakers, barefoot..." value={footwear} onChange={e => setFootwear(e.target.value)} /></div>
                  <div><Label>Hobbies / Physical Activities</Label><Input placeholder="Gaming, yoga, swimming, guitar..." value={hobbyActivities} onChange={e => setHobbyActivities(e.target.value)} /></div>
                  <div><Label>Previous Treatment</Label><Input placeholder="Physical therapy, chiropractor, none..." value={previousTreatment} onChange={e => setPreviousTreatment(e.target.value)} /></div>
                  <div><Label>Your Goals</Label><Textarea placeholder="Pain-free desk work, better athletic performance, fix rounded shoulders..." value={goals} onChange={e => setGoals(e.target.value)} rows={2} /></div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <Button onClick={handleAnalyze} disabled={(issues.length === 0 && !customIssues) || ai.isLoading} className="w-full hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200" size="lg">
                  {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Plan...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Exercise Plan</>}
                </Button>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.15} direction="right">
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
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
