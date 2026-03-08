import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Plus, Trash2, Clock, Bell, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { ChipSelect } from '@/components/ChipSelect';
import { PageHeader } from '@/components/PageHeader';

interface Medication {
  id: string; name: string; dosage: string; time: string;
  frequency: string; notes: string; category: string;
  withFood: string; prescribedBy: string; startDate: string;
  endDate: string; sideEffects: string; refillDate: string;
}

const frequencyLabels: Record<string, string> = {
  'once-daily': 'Once Daily', 'twice-daily': 'Twice Daily', 'thrice-daily': 'Three Times',
  'weekly': 'Weekly', 'as-needed': 'As Needed', 'every-other-day': 'Every Other Day',
};

const categoryLabels: Record<string, string> = {
  'prescription': 'Prescription', 'otc': 'Over-the-Counter', 'supplement': 'Supplement', 'vitamin': 'Vitamin',
};

export default function MedicationReminderPage() {
  const [medications, setMedications] = useLocalStorage<Medication[]>('healtify-medications', []);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00');
  const [frequency, setFrequency] = useState('once-daily');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('prescription');
  const [withFood, setWithFood] = useState('with-food');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sideEffects, setSideEffects] = useState('');
  const [refillDate, setRefillDate] = useState('');
  const { toast } = useToast();

  const handleAdd = () => {
    if (!name.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    const med: Medication = {
      id: Date.now().toString(), name: name.trim(), dosage: dosage.trim(), time,
      frequency, notes: notes.trim(), category, withFood,
      prescribedBy: prescribedBy.trim(), startDate, endDate,
      sideEffects: sideEffects.trim(), refillDate,
    };
    setMedications(prev => [...prev, med]);
    setName(''); setDosage(''); setTime('08:00'); setFrequency('once-daily');
    setNotes(''); setCategory('prescription'); setWithFood('with-food');
    setPrescribedBy(''); setStartDate(''); setEndDate('');
    setSideEffects(''); setRefillDate('');
    setShowForm(false);
    toast({ title: 'Medication added', description: `${med.name} has been added.` });
  };

  const handleDelete = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    toast({ title: 'Removed' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          icon={<Pill className="h-8 w-8 text-primary-foreground" />}
          title="Medication Reminders"
          description="Track medications with dosage, schedule, refill dates & side effects"
          gradient="from-primary to-secondary"
          showEmergency={false}
        />

        <div className="flex justify-end mb-6">
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Medication
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-soft mb-6 overflow-hidden space-y-4">
              <h3 className="font-semibold text-lg">Add Medication</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Medication Name *</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Aspirin" className="mt-1.5" /></div>
                <div><Label>Dosage</Label><Input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g., 500mg, 1 tablet" className="mt-1.5" /></div>
              </div>

              <div><Label>Category</Label><ChipSelect options={Object.keys(categoryLabels)} value={category} onChange={setCategory} formatLabel={v => categoryLabels[v]} /></div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Time</Label><Input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1.5" /></div>
                <div><Label>Frequency</Label><ChipSelect options={Object.keys(frequencyLabels)} value={frequency} onChange={setFrequency} formatLabel={v => frequencyLabels[v]} /></div>
              </div>

              <div><Label>Take With Food?</Label><ChipSelect options={['with-food', 'empty-stomach', 'doesnt-matter']} value={withFood} onChange={setWithFood} formatLabel={v => v === 'with-food' ? 'With Food' : v === 'empty-stomach' ? 'Empty Stomach' : "Doesn't Matter"} /></div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1.5" /></div>
                <div><Label>End Date (optional)</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1.5" /></div>
              </div>

              <div><Label>Prescribed By</Label><Input value={prescribedBy} onChange={e => setPrescribedBy(e.target.value)} placeholder="Dr. Smith, self-prescribed..." className="mt-1.5" /></div>
              <div><Label>Refill Date</Label><Input type="date" value={refillDate} onChange={e => setRefillDate(e.target.value)} className="mt-1.5" /></div>
              <div><Label>Known Side Effects</Label><Input value={sideEffects} onChange={e => setSideEffects(e.target.value)} placeholder="Drowsiness, nausea..." className="mt-1.5" /></div>
              <div><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Take with water, avoid grapefruit..." className="mt-1.5" rows={2} /></div>

              <div className="flex gap-3">
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
                className="bg-card rounded-2xl p-5 border border-border shadow-soft">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Pill className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{med.name}</h3>
                      <div className="flex gap-2 mt-0.5">
                        {med.dosage && <span className="text-xs text-muted-foreground">{med.dosage}</span>}
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{categoryLabels[med.category] || med.category}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(med.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{med.time}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{frequencyLabels[med.frequency] || med.frequency}</span>
                  {med.withFood && <span className="text-xs">({med.withFood === 'with-food' ? '🍽 With food' : med.withFood === 'empty-stomach' ? '⏰ Empty stomach' : ''})</span>}
                </div>
                {med.prescribedBy && <p className="text-xs text-muted-foreground mt-1">Prescribed by: {med.prescribedBy}</p>}
                {med.refillDate && <p className="text-xs text-warning mt-1">Refill: {med.refillDate}</p>}
                {med.sideEffects && <p className="text-xs text-destructive/70 mt-1">Side effects: {med.sideEffects}</p>}
                {med.notes && <p className="text-xs text-muted-foreground mt-1 italic">{med.notes}</p>}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
