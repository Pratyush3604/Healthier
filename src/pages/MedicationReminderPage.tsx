import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Plus, Trash2, Clock, Bell, Volume2, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';

interface Medication {
  id: string;
  name: string;
  times: string[];
  days: string[]; // e.g. ['Mon','Tue','Wed']
}

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_MAP: Record<number, string> = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 0: 'Sun' };

export default function MedicationReminderPage() {
  const [medications, setMedications] = useLocalStorage<Medication[]>('healthier-medications', []);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [days, setDays] = useState<string[]>([...ALL_DAYS]);
  const [alarmActive, setAlarmActive] = useState<string | null>(null);
  const { toast } = useToast();

  const addTime = () => setTimes(prev => [...prev, '12:00']);
  const removeTime = (i: number) => setTimes(prev => prev.filter((_, idx) => idx !== i));
  const updateTime = (i: number, val: string) => setTimes(prev => prev.map((t, idx) => idx === i ? val : t));
  const toggleDay = (d: string) => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const resetForm = () => { setName(''); setTimes(['08:00']); setDays([...ALL_DAYS]); setShowForm(false); setEditId(null); };

  const handleSave = () => {
    if (!name.trim()) { toast({ title: 'Enter medication name', variant: 'destructive' }); return; }
    if (days.length === 0) { toast({ title: 'Select at least one day', variant: 'destructive' }); return; }

    if (editId) {
      setMedications(prev => prev.map(m => m.id === editId ? { ...m, name: name.trim(), times: [...times], days: [...days] } : m));
      toast({ title: 'Updated', description: `${name} reminder updated.` });
    } else {
      const med: Medication = { id: Date.now().toString(), name: name.trim(), times: [...times], days: [...days] };
      setMedications(prev => [...prev, med]);
      const existing = JSON.parse(localStorage.getItem('healthier-reports') || '[]');
      existing.push({ id: `med-${med.id}`, type: 'medication', title: `Medication: ${med.name}`, date: new Date().toISOString().split('T')[0], summary: `Times: ${med.times.join(', ')} | Days: ${med.days.join(', ')}`, details: `Medication ${med.name} reminders set for ${med.times.join(', ')} on ${med.days.join(', ')}` });
      localStorage.setItem('healthier-reports', JSON.stringify(existing));
      toast({ title: 'Added', description: `${med.name} reminder set.` });
    }
    resetForm();
  };

  const handleEdit = (med: Medication) => {
    setName(med.name); setTimes([...med.times]); setDays([...(med.days || ALL_DAYS)]); setEditId(med.id); setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    toast({ title: 'Removed' });
  };

  const checkAlarms = useCallback(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const todayDay = DAY_MAP[now.getDay()];
    medications.forEach(med => {
      const medDays = med.days || ALL_DAYS;
      if (med.times.includes(currentTime) && medDays.includes(todayDay)) {
        setAlarmActive(med.name);
        toast({ title: `💊 Time for ${med.name}!`, description: `It's ${currentTime} — take your medication.` });
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
          description="Add your meds, times, and days — get alerted when it's time"
          gradient="from-primary to-secondary"
          showEmergency={false}
        />

        <div className="flex justify-end mb-6">
          <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Medication
          </Button>
        </div>

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
              <h3 className="font-semibold text-lg">{editId ? 'Edit' : 'Add'} Medication</h3>
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
                <Button variant="ghost" size="sm" onClick={addTime} className="mt-2 text-primary"><Plus className="w-3 h-3 mr-1" />Add time</Button>
              </div>
              <div>
                <Label>Days of the Week</Label>
                <div className="flex gap-2 mt-2">
                  {ALL_DAYS.map(d => (
                    <button key={d} onClick={() => toggleDay(d)}
                      className={cn("w-10 h-10 rounded-full text-xs font-semibold transition-all",
                        days.includes(d) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                      {d}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => setDays([...ALL_DAYS])} className="text-xs text-primary">All days</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDays(['Mon','Tue','Wed','Thu','Fri'])} className="text-xs text-primary">Weekdays</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDays(['Sat','Sun'])} className="text-xs text-primary">Weekends</Button>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave}><Check className="w-4 h-4 mr-1" />{editId ? 'Update' : 'Save'}</Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
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
                className="bg-card rounded-2xl p-5 border border-border shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Pill className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{med.name}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {med.times.map((t, j) => (
                          <span key={j} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            <Clock className="w-3 h-3" />{t}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(med.days || ALL_DAYS).map(d => (
                          <span key={d} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-medium">{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(med)} className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(med.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
