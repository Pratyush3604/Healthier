import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

interface JournalEntry {
  id: string;
  date: string;
  mood: number; // 1-5
  symptoms: string;
  notes: string;
  sleep: string;
  energy: number; // 1-5
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
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(e => e.date === today);

  const handleSave = () => {
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: today,
      mood, energy,
      symptoms: symptoms.trim(),
      notes: notes.trim(),
      sleep: sleep.trim(),
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

  const last7 = entries.slice(0, 7);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-500">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Health Journal</h1>
              <p className="text-muted-foreground">Track your daily mood, symptoms, and energy levels</p>
            </div>
          </div>
          {!todayEntry && (
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="w-4 h-4" /> Today's Entry
            </Button>
          )}
        </div>

        {/* Mood Trend */}
        {last7.length > 0 && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h3 className="font-semibold mb-4">7-Day Mood Trend</h3>
            <div className="flex items-end gap-2 h-24">
              {last7.reverse().map((entry) => (
                <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-lg">{moods[entry.mood - 1]}</span>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-primary/30 to-primary/60" style={{ height: `${entry.mood * 20}%` }} />
                  <span className="text-[10px] text-muted-foreground">{new Date(entry.date).toLocaleDateString('en', { weekday: 'short' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Entry Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">Today's Health Check-In</h3>
            <div className="space-y-5">
              <div>
                <Label className="mb-2 block">How are you feeling?</Label>
                <div className="flex gap-3">
                  {moods.map((emoji, i) => (
                    <button key={i} onClick={() => setMood(i + 1)}
                      className={`text-3xl p-2 rounded-xl transition-all ${mood === i + 1 ? 'bg-primary/20 scale-125 ring-2 ring-primary' : 'hover:bg-muted/50'}`}>
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${energy === i + 1 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Hours of Sleep</Label>
                  <Input value={sleep} onChange={e => setSleep(e.target.value)} placeholder="e.g., 7.5" className="mt-1.5" />
                </div>
                <div>
                  <Label>Symptoms (if any)</Label>
                  <Input value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="e.g., Headache, fatigue" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="How was your day?" className="mt-1.5" />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave}>Save Entry</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
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
                className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{moods[entry.mood - 1]}</span>
                    <div>
                      <p className="font-semibold">{new Date(entry.date).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                      <p className="text-xs text-muted-foreground">Energy: {energyLabels[entry.energy - 1]}{entry.sleep ? ` • Sleep: ${entry.sleep}h` : ''}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(entry.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {entry.symptoms && <p className="text-sm text-warning"><span className="font-medium">Symptoms:</span> {entry.symptoms}</p>}
                {entry.notes && <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
