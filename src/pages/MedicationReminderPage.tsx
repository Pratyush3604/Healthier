import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Plus, Trash2, Clock, Bell, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';

interface Medication {
  id: string;
  name: string;
  times: string[]; // e.g. ["08:00", "20:00"]
}

export default function MedicationReminderPage() {
  const [medications, setMedications] = useLocalStorage<Medication[]>('healthier-medications', []);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [alarmActive, setAlarmActive] = useState<string | null>(null);
  const { toast } = useToast();

  const addTime = () => setTimes(prev => [...prev, '12:00']);
  const removeTime = (i: number) => setTimes(prev => prev.filter((_, idx) => idx !== i));
  const updateTime = (i: number, val: string) => setTimes(prev => prev.map((t, idx) => idx === i ? val : t));

  const handleAdd = () => {
    if (!name.trim()) { toast({ title: 'Enter medication name', variant: 'destructive' }); return; }
    const med: Medication = { id: Date.now().toString(), name: name.trim(), times: [...times] };
    setMedications(prev => [...prev, med]);
    // Auto-save to reports
    const existing = JSON.parse(localStorage.getItem('healthier-reports') || '[]');
    existing.push({ id: `med-${med.id}`, type: 'medication', title: `Medication: ${med.name}`, date: new Date().toISOString().split('T')[0], summary: `Times: ${med.times.join(', ')}`, details: `Medication ${med.name} reminders set for ${med.times.join(', ')}` });
    localStorage.setItem('healthier-reports', JSON.stringify(existing));
    setName(''); setTimes(['08:00']); setShowForm(false);
    toast({ title: 'Added', description: `${med.name} reminder set.` });
  };

  const handleDelete = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    toast({ title: 'Removed' });
  };

  // Simple alarm check every 30 seconds
  const checkAlarms = useCallback(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    medications.forEach(med => {
      if (med.times.includes(currentTime)) {
        setAlarmActive(med.name);
        toast({ title: `💊 Time for ${med.name}!`, description: `It's ${currentTime} — take your medication.` });
        // Try to play a beep
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = 800; gain.gain.value = 0.3;
          osc.start(); osc.stop(ctx.currentTime + 0.5);
          setTimeout(() => ctx.close(), 1000);
        } catch {}
      }
    });
  }, [medications, toast]);

  useEffect(() => {
    const interval = setInterval(checkAlarms, 30000);
    return () => clearInterval(interval);
  }, [checkAlarms]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          icon={<Pill className="h-8 w-8 text-primary-foreground" />}
          title="Medication Reminders"
          description="Add your meds and times — get alerted when it's time"
          gradient="from-primary to-secondary"
          showEmergency={false}
        />

        <div className="flex justify-end mb-6">
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Medication
          </Button>
        </div>

        {/* Alarm banner */}
        <AnimatePresence>
          {alarmActive && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-6 h-6 text-primary animate-pulse" />
                <span className="font-semibold">Time to take: {alarmActive}</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setAlarmActive(null)}>Dismiss</Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-soft mb-6 overflow-hidden space-y-4">
              <h3 className="font-semibold text-lg">Add Medication</h3>
              <div>
                <Label>Medication Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Aspirin, Vitamin D" className="mt-1.5" />
              </div>
              <div>
                <Label>Reminder Times</Label>
                <div className="space-y-2 mt-2">
                  {times.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input type="time" value={t} onChange={e => updateTime(i, e.target.value)} className="w-40" />
                      {times.length > 1 && (
                        <button onClick={() => removeTime(i)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={addTime} className="mt-2 text-primary"><Plus className="w-3 h-3 mr-1" />Add another time</Button>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAdd}>Save</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {medications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No medications added</h3>
            <p className="text-muted-foreground text-sm">Add your meds to get reminded at the right times.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {medications.map((med, i) => (
              <motion.div key={med.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-5 border border-border shadow-soft flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Pill className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{med.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {med.times.map((t, j) => (
                        <span key={j} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                          <Clock className="w-3 h-3" />{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(med.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
