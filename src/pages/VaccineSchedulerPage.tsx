import { useState } from 'react';
import { Syringe, Sparkles, Loader2, Plus, Trash2, Calendar, CheckCircle } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';

interface VaccineRecord { id: string; name: string; date: string; nextDue?: string; notes: string; }

const commonVaccines = ['COVID-19', 'Influenza (Flu)', 'Hepatitis A', 'Hepatitis B', 'Tetanus/Tdap', 'MMR', 'Varicella', 'HPV', 'Pneumococcal', 'Shingles', 'Meningococcal', 'Polio', 'Typhoid', 'Yellow Fever', 'Rabies', 'Japanese Encephalitis'];

export default function VaccineSchedulerPage() {
  const [vaccines, setVaccines] = useLocalStorage<VaccineRecord[]>('healtify-vaccines', []);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [nextDue, setNextDue] = useState('');
  const [vnotes, setVnotes] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('any');
  const [travelPlanned, setTravelPlanned] = useState('no');
  const [travelDest, setTravelDest] = useState('');
  const [healthConditions, setHealthConditions] = useState('none');
  const { toast } = useToast();
  const ai = useAIStream({ type: 'vaccine-schedule' });

  const handleAdd = () => {
    if (!name) { toast({ title: 'Enter vaccine name', variant: 'destructive' }); return; }
    setVaccines(prev => [{ id: Date.now().toString(), name, date, nextDue, notes: vnotes }, ...prev]);
    setName(''); setDate(''); setNextDue(''); setVnotes(''); setShowForm(false);
    toast({ title: 'Vaccine logged' });
  };

  const handleAnalyze = async () => {
    if (!age) { toast({ title: 'Enter your age', variant: 'destructive' }); return; }
    const vaccineList = vaccines.map(v => `${v.name} (${v.date || 'date unknown'}${v.nextDue ? `, next: ${v.nextDue}` : ''})`).join(', ');
    const prompt = `Vaccine schedule review:
- Age: ${age}, Gender: ${gender}
- Vaccines on record: ${vaccineList || 'None logged'}
- Health conditions: ${healthConditions}
- Travel planned: ${travelPlanned}${travelPlanned === 'yes' ? ` to ${travelDest || 'unspecified'}` : ''}

Provide comprehensive vaccination guidance:
1. **Age-Appropriate Recommendations** based on CDC/WHO schedule
2. **Missing/Overdue Vaccines** from the logged records
3. **Booster Reminders** — when to get boosters
4. **Each Recommended Vaccine** — what it protects against, side effects
5. **Travel-Related Vaccines** if travel is planned
6. **Vaccine Safety** — common side effects, when to seek help
7. **Contraindications** — when to avoid certain vaccines
8. **Pregnancy Considerations** if applicable
9. **Immunocompromised** guidance if applicable
10. **Schedule Timeline** — optimal order and spacing`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={<Syringe className="h-8 w-8 text-primary-foreground" />}
          title="Vaccine Scheduler"
          description="Track vaccines, find missing ones & get schedule recommendations"
          gradient="from-primary to-secondary"
        />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Your Age *</Label><Input type="number" placeholder="30" value={age} onChange={e => setAge(e.target.value)} /></div>
                <div><Label>Gender</Label><ChipSelect options={['male', 'female', 'any']} value={gender} onChange={setGender} /></div>
              </div>
              <div><Label>Health Conditions</Label><ChipSelect options={['none', 'pregnant', 'immunocompromised', 'chronic-illness']} value={healthConditions} onChange={setHealthConditions} /></div>
              <div><Label>Travel Planned?</Label><ChipSelect options={['no', 'yes']} value={travelPlanned} onChange={setTravelPlanned} /></div>
              {travelPlanned === 'yes' && (
                <div><Label>Travel Destination</Label><Input placeholder="e.g., India, Brazil..." value={travelDest} onChange={e => setTravelDest(e.target.value)} /></div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Vaccine Records ({vaccines.length})</h3>
              <Button onClick={() => setShowForm(!showForm)} size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />Log Vaccine</Button>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="bg-card rounded-2xl p-5 border border-border overflow-hidden space-y-3">
                  <div><Label>Vaccine Name</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Select or type..." className="mt-1.5" list="vaccine-list" />
                    <datalist id="vaccine-list">{commonVaccines.map(v => <option key={v} value={v} />)}</datalist>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Date Received</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
                    <div><Label>Next Due</Label><Input type="date" value={nextDue} onChange={e => setNextDue(e.target.value)} /></div>
                  </div>
                  <div><Label>Notes</Label><Input value={vnotes} onChange={e => setVnotes(e.target.value)} placeholder="Batch number, provider..." /></div>
                  <div className="flex gap-2">
                    <Button onClick={handleAdd} size="sm">Save</Button>
                    <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-card rounded-2xl p-5 border border-border">
              {vaccines.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {vaccines.map(v => (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <div>
                          <p className="text-sm font-medium">{v.name}</p>
                          <p className="text-xs text-muted-foreground">{v.date || 'Date unknown'}{v.nextDue ? ` • Next: ${v.nextDue}` : ''}</p>
                        </div>
                      </div>
                      <button onClick={() => setVaccines(prev => prev.filter(x => x.id !== v.id))} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No vaccines logged yet</p>
              )}
            </div>

            <Button onClick={handleAnalyze} disabled={!age || ai.isLoading} className="w-full" size="lg">
              {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking...</> : <><Sparkles className="mr-2 h-4 w-4" />Check My Schedule</>}
            </Button>
          </div>

          <AIResponseCard
            content={ai.response}
            isLoading={ai.isLoading}
            icon={<Calendar className="h-5 w-5 text-primary" />}
            title="Vaccine Schedule"
            maxHeight="700px"
            emptyIcon={<Syringe className="h-16 w-16" />}
            emptyTitle="Vaccine Schedule"
            emptyDescription="Enter your age and log vaccines to check your schedule"
            disclaimerText="Consult your doctor or a travel clinic for personalized vaccination advice."
          />
        </div>
      </div>
    </div>
  );
}