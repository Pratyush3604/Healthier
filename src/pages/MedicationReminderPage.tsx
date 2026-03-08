import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Plus, Trash2, Clock, Bell, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  frequency: 'daily' | 'twice' | 'thrice' | 'weekly';
  notes: string;
}

const frequencyLabels: Record<string, string> = {
  daily: 'Once Daily',
  twice: 'Twice Daily',
  thrice: 'Three Times Daily',
  weekly: 'Weekly',
};

export default function MedicationReminderPage() {
  const [medications, setMedications] = useLocalStorage<Medication[]>('healtify-medications', []);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00');
  const [frequency, setFrequency] = useState<Medication['frequency']>('daily');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const handleAdd = () => {
    if (!name.trim()) {
      toast({ title: 'Name required', description: 'Please enter the medication name.', variant: 'destructive' });
      return;
    }
    const med: Medication = { id: Date.now().toString(), name: name.trim(), dosage: dosage.trim(), time, frequency, notes: notes.trim() };
    setMedications(prev => [...prev, med]);
    setName(''); setDosage(''); setTime('08:00'); setFrequency('daily'); setNotes('');
    setShowForm(false);
    toast({ title: 'Medication added', description: `${med.name} has been added to your reminders.` });
  };

  const handleDelete = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    toast({ title: 'Removed', description: 'Medication removed from reminders.' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-500">
              <Pill className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Medication Reminders</h1>
              <p className="text-muted-foreground">Track your medications and never miss a dose</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="glass-card rounded-2xl p-6 mb-6 overflow-hidden">
              <h3 className="font-semibold text-lg mb-4">Add Medication</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Medication Name *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Aspirin" className="mt-1.5" />
                </div>
                <div>
                  <Label>Dosage</Label>
                  <Input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g., 500mg" className="mt-1.5" />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {(Object.entries(frequencyLabels)).map(([key, label]) => (
                      <button key={key} onClick={() => setFrequency(key as Medication['frequency'])}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${frequency === key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/30'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label>Notes (optional)</Label>
                  <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., Take with food" className="mt-1.5" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={handleAdd}>Save Medication</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {medications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No medications added</h3>
            <p className="text-muted-foreground text-sm">Add your medications to keep track of doses and schedules.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {medications.map((med, i) => (
              <motion.div key={med.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                      <Pill className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{med.name}</h3>
                      {med.dosage && <p className="text-sm text-muted-foreground">{med.dosage}</p>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(med.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{med.time}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{frequencyLabels[med.frequency]}</span>
                </div>
                {med.notes && <p className="text-xs text-muted-foreground mt-2 italic">{med.notes}</p>}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
