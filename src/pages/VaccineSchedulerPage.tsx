import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Syringe, Loader2, AlertTriangle, Sparkles, Plus, Trash2, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

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
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAdd = () => {
    if (!name) { toast({ title: 'Enter vaccine name', variant: 'destructive' }); return; }
    setVaccines(prev => [{ id: Date.now().toString(), name, date, nextDue, notes: vnotes }, ...prev]);
    setName(''); setDate(''); setNextDue(''); setVnotes(''); setShowForm(false);
    toast({ title: 'Vaccine logged' });
  };

  const handleAnalyze = async () => {
    if (!age) { toast({ title: 'Enter your age', variant: 'destructive' }); return; }
    setIsLoading(true); setAnalysis(null);
    const vaccineList = vaccines.map(v => `${v.name} (${v.date || 'date unknown'}${v.nextDue ? `, next: ${v.nextDue}` : ''})`).join(', ');
    const prompt = `Vaccine schedule review:\n- Age: ${age}\n- Vaccines on record: ${vaccineList || 'None logged'}\n\nProvide:\n1. Age-appropriate vaccine recommendations\n2. Missing/overdue vaccines based on CDC/WHO schedule\n3. Booster reminders\n4. Information about each recommended vaccine\n5. Travel-related vaccine suggestions\n6. Side effects to expect\n7. When to avoid vaccination`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'vaccine-schedule' }),
      });
      if (!response.ok || !response.body) throw new Error('Failed');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '', fullContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx); buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ') || line.trim() === '') continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try { const p = JSON.parse(jsonStr); const c = p.choices?.[0]?.delta?.content; if (c) { fullContent += c; setAnalysis(fullContent); } } catch { buffer = line + '\n' + buffer; break; }
        }
      }
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-500"><Syringe className="h-8 w-8 text-white" /></div>
          <h1 className="font-display text-3xl font-bold mb-2">Vaccine Scheduler</h1>
          <p className="text-muted-foreground">Track vaccines, find missing ones & get schedule recommendations</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label>Your Age</Label><Input type="number" placeholder="30" value={age} onChange={e => setAge(e.target.value)} className="mt-1.5 w-32" /></div>
              <Button onClick={() => setShowForm(!showForm)} size="sm"><Plus className="w-4 h-4 mr-1" />Log Vaccine</Button>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-card rounded-2xl p-5 border border-border overflow-hidden space-y-3">
                  <div><Label>Vaccine Name</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Select or type..." className="mt-1.5" list="vaccine-list" />
                    <datalist id="vaccine-list">{commonVaccines.map(v => <option key={v} value={v} />)}</datalist>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Date Received</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1.5" /></div>
                    <div><Label>Next Due (optional)</Label><Input type="date" value={nextDue} onChange={e => setNextDue(e.target.value)} className="mt-1.5" /></div>
                  </div>
                  <div><Label>Notes</Label><Input value={vnotes} onChange={e => setVnotes(e.target.value)} placeholder="Batch number, provider..." className="mt-1.5" /></div>
                  <div className="flex gap-2"><Button onClick={handleAdd} size="sm">Save</Button><Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button></div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-card rounded-2xl p-5 border border-border">
              <h3 className="font-semibold mb-3">Your Vaccine Records ({vaccines.length})</h3>
              {vaccines.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {vaccines.map(v => (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <div>
                          <p className="text-sm font-medium">{v.name}</p>
                          <p className="text-xs text-muted-foreground">{v.date || 'Date unknown'}{v.nextDue ? ` • Next: ${v.nextDue}` : ''}</p>
                        </div>
                      </div>
                      <button onClick={() => setVaccines(prev => prev.filter(x => x.id !== v.id))} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No vaccines logged yet</p>
              )}
            </div>

            <Button onClick={handleAnalyze} disabled={!age || isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking...</> : <><Sparkles className="mr-2 h-4 w-4" />Check My Schedule</>}
            </Button>
          </div>
          <div className="space-y-4">
            {analysis ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[600px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Vaccine Schedule</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
              </motion.div>
            ) : (
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <Syringe className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Vaccine Schedule</h3>
                <p className="text-muted-foreground">Enter your age and log vaccines to check your schedule</p>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" /><p className="text-sm text-muted-foreground">Consult your doctor or a travel clinic for personalized vaccination advice.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
