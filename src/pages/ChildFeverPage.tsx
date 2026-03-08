import { useState } from 'react';
import { Baby, Sparkles, Loader2, Phone, Thermometer, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const otherSymptoms = ['Cough', 'Rash', 'Vomiting', 'Diarrhea', 'Ear pain', 'Crying/fussy', 'Not eating', 'Lethargy', 'Stiff neck', 'Difficulty breathing', 'Seizure', 'Dehydration', 'Runny nose', 'Sore throat', 'Abdominal pain', 'Headache'];

export default function ChildFeverPage() {
  const [form, setForm] = useState({
    ageMonths: '', temperature: '', tempUnit: 'F',
    duration: 'less-than-24h', fluidIntake: 'normal',
    appetite: 'reduced', activity: 'less-active',
    lastMedication: 'none', vaccineRecent: 'no',
  });
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const { toast } = useToast();
  const ai = useAIStream({ type: 'child-fever' });

  const toggleSymptom = (s: string) => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const getUrgency = () => {
    const temp = parseFloat(form.temperature);
    const age = parseInt(form.ageMonths);
    if (!temp || !age) return null;
    const tempF = form.tempUnit === 'C' ? temp * 9 / 5 + 32 : temp;
    if (age < 3 && tempF >= 100.4) return 'emergency';
    if (tempF >= 104) return 'emergency';
    if (symptoms.includes('Seizure') || symptoms.includes('Difficulty breathing') || symptoms.includes('Stiff neck')) return 'emergency';
    if (tempF >= 102 || symptoms.includes('Dehydration') || symptoms.includes('Lethargy')) return 'high';
    return 'moderate';
  };
  const urgency = getUrgency();

  const handleAnalyze = async () => {
    if (!form.ageMonths || !form.temperature) { toast({ title: 'Missing info', variant: 'destructive' }); return; }
    const prompt = `Pediatric fever assessment:
- Child age: ${form.ageMonths} months
- Temperature: ${form.temperature}°${form.tempUnit}
- Duration: ${form.duration}
- Fluid intake: ${form.fluidIntake}
- Appetite: ${form.appetite}
- Activity level: ${form.activity}
- Last medication given: ${form.lastMedication}
- Recent vaccination: ${form.vaccineRecent}
- Other symptoms: ${symptoms.join(', ') || 'None'}

Provide detailed age-appropriate guidance:
1. **Urgency Assessment** with clear level
2. **Age-Appropriate Fever Management** steps
3. **Medication Guidance** — safe options by age (general, no specific dosages)
4. **Hydration & Comfort Measures** — what fluids, how often
5. **When Temperature is Concerning** for this age group
6. **Red Flags** to watch for (10+ warning signs)
7. **When to Go to the ER** vs call pediatrician vs wait
8. **Recovery Timeline** expectations
9. **Post-Vaccination Fever** considerations if applicable
10. **Parent Comfort** — reassurance and monitoring tips`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={<Baby className="h-8 w-8 text-primary-foreground" />}
          title="Child Fever Guide"
          description="Age-appropriate fever management for children"
          gradient="from-accent to-destructive"
        />

        {urgency === 'emergency' && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 animate-urgent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              <span className="font-bold text-destructive">Seek immediate medical attention!</span>
            </div>
            <Link to="/emergency"><Button variant="destructive" size="sm"><Phone className="w-4 h-4 mr-1" />Emergency</Button></Link>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div><Label>Child's Age (months)</Label><Input type="number" placeholder="12" value={form.ageMonths} onChange={e => setForm({...form, ageMonths: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Temperature</Label><Input type="number" step="0.1" placeholder="101.5" value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} /></div>
                <div><Label>Unit</Label><ChipSelect options={['F', 'C']} value={form.tempUnit} onChange={v => setForm({...form, tempUnit: v})} formatLabel={v => `°${v}`} /></div>
              </div>
              <div><Label>Duration</Label><ChipSelect options={['less-than-24h', '1-2-days', '3-5-days', 'more-than-5-days']} value={form.duration} onChange={v => setForm({...form, duration: v})} /></div>
              <div><Label>Fluid Intake</Label><ChipSelect options={['normal', 'reduced', 'very-low', 'refusing']} value={form.fluidIntake} onChange={v => setForm({...form, fluidIntake: v})} /></div>
              <div><Label>Appetite</Label><ChipSelect options={['normal', 'reduced', 'not-eating']} value={form.appetite} onChange={v => setForm({...form, appetite: v})} /></div>
              <div><Label>Activity Level</Label><ChipSelect options={['normal', 'less-active', 'very-lethargic']} value={form.activity} onChange={v => setForm({...form, activity: v})} /></div>
              <div><Label>Last Medication Given</Label><ChipSelect options={['none', 'acetaminophen', 'ibuprofen', 'both']} value={form.lastMedication} onChange={v => setForm({...form, lastMedication: v})} /></div>
              <div><Label>Recent Vaccination (past 48h)?</Label><ChipSelect options={['no', 'yes']} value={form.vaccineRecent} onChange={v => setForm({...form, vaccineRecent: v})} /></div>
              <div>
                <Label>Other Symptoms</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {otherSymptoms.map(s => (
                    <button key={s} onClick={() => toggleSymptom(s)}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        symptoms.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {form.temperature && (
              <div className="bg-card rounded-2xl p-5 border border-border flex items-center gap-4">
                <Thermometer className={cn("w-8 h-8", urgency === 'emergency' ? 'text-destructive' : urgency === 'high' ? 'text-warning' : 'text-success')} />
                <div>
                  <p className="text-2xl font-bold font-display">{form.temperature}°{form.tempUnit}</p>
                  <p className="text-sm text-muted-foreground">{urgency === 'emergency' ? 'High — Seek care immediately' : urgency === 'high' ? 'Elevated — Monitor closely' : 'Moderate — Home care likely sufficient'}</p>
                </div>
              </div>
            )}

            <Button onClick={handleAnalyze} disabled={!form.ageMonths || !form.temperature || ai.isLoading} className="w-full" size="lg">
              {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Fever Guide</>}
            </Button>
          </div>

          <AIResponseCard
            content={ai.response}
            isLoading={ai.isLoading}
            urgency={urgency === 'emergency' ? 'high' : urgency === 'high' ? 'medium' : null}
            icon={<Baby className="h-5 w-5 text-accent" />}
            title="Fever Assessment"
            maxHeight="700px"
            emptyIcon={<Baby className="h-16 w-16" />}
            emptyTitle="Fever Guide"
            emptyDescription="Enter your child's details for age-appropriate guidance"
            disclaimerText="Always consult a pediatrician for persistent or high fever. Call emergency services for infants under 3 months with fever ≥100.4°F."
          />
        </div>
      </div>
    </div>
  );
}