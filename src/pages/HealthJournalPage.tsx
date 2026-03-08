import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Calendar, Trash2, Sparkles, Loader2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { cn } from '@/lib/utils';

interface JournalEntry {
  id: string; date: string; mood: number; symptoms: string;
  notes: string; sleep: string; energy: number; water: string;
  exercise: string; stress: string; gratitude: string;
}

const moods = ['😞', '😐', '🙂', '😊', '🤩'];
const energyLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];

export default function HealthJournalPage() {
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('healtify-journal', []);
  const [showForm, setShowForm] = useState(false);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [sleep, setSleep] = useState('');
  const [water, setWater] = useState('moderate');
  const [exercise, setExercise] = useState('none');
  const [stress, setStress] = useState('moderate');
  const [gratitude, setGratitude] = useState('');
  const { toast } = useToast();
  const ai = useAIStream({ type: 'health-journal' });

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(e => e.date === today);

  const handleSave = () => {
    const entry: JournalEntry = {
      id: Date.now().toString(), date: today,
      mood, energy, symptoms: symptoms.trim(), notes: notes.trim(),
      sleep: sleep.trim(), water, exercise, stress, gratitude: gratitude.trim(),
    };
    setEntries(prev => {
      const filtered = prev.filter(e => e.date !== today);
      return [entry, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
    });
    setShowForm(false);
    toast({ title: 'Journal saved', description: 'Today\'s entry has been recorded.' });
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    toast({ title: 'Entry deleted' });
  };

  const handleAnalyze = async () => {
    if (entries.length < 3) { toast({ title: 'Need at least 3 entries for analysis', variant: 'destructive' }); return; }
    const recent = entries.slice(0, 14);
    const data = recent.map(e => `${e.date}: Mood ${e.mood}/5, Energy ${e.energy}/5, Sleep ${e.sleep || 'N/A'}h, Stress ${e.stress}, Exercise ${e.exercise}, Water ${e.water}${e.symptoms ? `, Symptoms: ${e.symptoms}` : ''}`).join('\n');
    const prompt = `Analyze my health journal entries:\n${data}\n\nProvide:\n1. **Overall Wellness Trend** — improving, declining, or stable?\n2. **Mood Patterns** — correlations with sleep, exercise, stress\n3. **Energy Analysis** — what factors boost or drain energy\n4. **Sleep Impact** — how sleep quality affects other metrics\n5. **Symptom Patterns** — recurring symptoms and possible triggers\n6. **Stress Management** — effectiveness of current coping\n7. **Personalized Recommendations** — 8+ actionable tips\n8. **Wellness Score** — estimated 0-100 based on patterns`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const last7 = entries.slice(0, 7);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={<BookOpen className="h-8 w-8 text-primary-foreground" />}
          title="Health Journal"
          description="Track your daily mood, symptoms, energy levels & get AI insights"
          gradient="from-accent to-secondary"
          showEmergency={false}
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {/* Mood Trend */}
            {last7.length > 0 && (
              <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
                <h3 className="font-semibold mb-4">7-Day Mood Trend</h3>
                <div className="flex items-end gap-2 h-24">
                  {[...last7].reverse().map((entry) => (
                    <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-lg">{moods[entry.mood - 1]}</span>
                      <div className="w-full rounded-t-lg bg-gradient-to-t from-primary/30 to-primary/60" style={{ height: `${entry.mood * 20}%` }} />
                      <span className="text-[10px] text-muted-foreground">{new Date(entry.date).toLocaleDateString('en', { weekday: 'short' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Entry */}
            {!todayEntry && (
              <Button onClick={() => setShowForm(!showForm)} className="w-full" variant={showForm ? 'outline' : 'default'}>
                <Plus className="w-4 h-4 mr-2" /> {showForm ? 'Cancel' : "Today's Entry"}
              </Button>
            )}

            {showForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-5">
                <h3 className="font-semibold text-lg">Today's Health Check-In</h3>
                <div>
                  <Label className="mb-2 block">How are you feeling?</Label>
                  <div className="flex gap-3">
                    {moods.map((emoji, i) => (
                      <button key={i} onClick={() => setMood(i + 1)}
                        className={cn("text-3xl p-2 rounded-xl transition-all",
                          mood === i + 1 ? 'bg-primary/20 scale-125 ring-2 ring-primary' : 'hover:bg-muted/50')}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Energy Level</Label>
                  <div className="flex gap-2">
                    {energyLabels.map((label, i) => (
                      <button key={i} onClick={() => setEnergy(i + 1)}
                        className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          energy === i + 1 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground')}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Hours of Sleep</Label><Input value={sleep} onChange={e => setSleep(e.target.value)} placeholder="e.g., 7.5" className="mt-1.5" /></div>
                  <div><Label>Symptoms (if any)</Label><Input value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="e.g., Headache, fatigue" className="mt-1.5" /></div>
                </div>
                <div><Label>Water Intake</Label><ChipSelect options={['low', 'moderate', 'good', 'excellent']} value={water} onChange={setWater} /></div>
                <div><Label>Exercise Today</Label><ChipSelect options={['none', 'light', 'moderate', 'intense']} value={exercise} onChange={setExercise} /></div>
                <div><Label>Stress Level</Label><ChipSelect options={['low', 'moderate', 'high', 'very-high']} value={stress} onChange={setStress} /></div>
                <div><Label>Gratitude / Positive Moment</Label><Textarea value={gratitude} onChange={e => setGratitude(e.target.value)} placeholder="What went well today?" className="mt-1.5" rows={2} /></div>
                <div><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How was your day? Any observations?" className="mt-1.5" rows={2} /></div>
                <div className="flex gap-3">
                  <Button onClick={handleSave}>Save Entry</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </motion.div>
            )}

            {/* AI Analysis Button */}
            {entries.length >= 3 && (
              <Button onClick={handleAnalyze} disabled={ai.isLoading} variant="outline" className="w-full" size="lg">
                {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Brain className="mr-2 h-4 w-4" />Analyze Journal Trends ({entries.length} entries)</>}
              </Button>
            )}

            {/* Entries List */}
            {entries.length === 0 && !showForm ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No journal entries yet</h3>
                <p className="text-muted-foreground text-sm">Start tracking your daily health to spot patterns over time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry, i) => (
                  <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-card rounded-2xl p-5 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{moods[entry.mood - 1]}</span>
                        <div>
                          <p className="font-semibold">{new Date(entry.date).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                          <p className="text-xs text-muted-foreground">
                            Energy: {energyLabels[entry.energy - 1]}
                            {entry.sleep ? ` • Sleep: ${entry.sleep}h` : ''}
                            {entry.exercise && entry.exercise !== 'none' ? ` • Exercise: ${entry.exercise}` : ''}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(entry.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {entry.symptoms && <p className="text-sm text-warning"><span className="font-medium">Symptoms:</span> {entry.symptoms}</p>}
                    {entry.gratitude && <p className="text-sm text-success"><span className="font-medium">Gratitude:</span> {entry.gratitude}</p>}
                    {entry.notes && <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <AIResponseCard
              content={ai.response}
              isLoading={ai.isLoading}
              icon={<Brain className="h-5 w-5 text-primary" />}
              title="Journal Analysis"
              maxHeight="700px"
              emptyIcon={<BookOpen className="h-16 w-16" />}
              emptyTitle="Track & Analyze"
              emptyDescription="Log at least 3 daily entries, then click 'Analyze Journal Trends' for AI insights into your patterns"
              showDisclaimer={!!ai.response}
              disclaimerText="This analysis is for self-reflection only. Consult a healthcare provider for medical concerns."
            />
          </div>
        </div>
      </div>
    </div>
  );
}