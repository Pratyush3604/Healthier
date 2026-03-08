import { useState } from 'react';
import { Pill, Loader2, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';

export default function MedicineInfoPage() {
  const [medicine, setMedicine] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [currentMeds, setCurrentMeds] = useState('');
  const [conditions, setConditions] = useState('');
  const [pregnant, setPregnant] = useState('no');
  const [allergies, setAllergies] = useState('');
  const [reason, setReason] = useState('');
  const { toast } = useToast();
  const ai = useAIStream({ type: 'medicine-info' });

  const commonMedicines = ['Paracetamol', 'Ibuprofen', 'Aspirin', 'Amoxicillin', 'Cetirizine', 'Omeprazole', 'Metformin', 'Vitamin D', 'Azithromycin', 'Lisinopril', 'Atorvastatin', 'Metoprolol'];

  const handleSearch = async (name?: string) => {
    const med = name || medicine;
    if (!med.trim()) { toast({ title: 'Enter a medicine name', variant: 'destructive' }); return; }
    if (name) setMedicine(name);

    const prompt = `Provide comprehensive information about the medicine **"${med}"**:
${age ? `Patient age: ${age}` : ''}${weight ? `, Weight: ${weight}kg` : ''}${gender ? `, Gender: ${gender}` : ''}
${currentMeds ? `Current medications: ${currentMeds}` : ''}
${conditions ? `Pre-existing conditions: ${conditions}` : ''}
${allergies ? `Known allergies: ${allergies}` : ''}
${pregnant !== 'no' ? `Pregnancy status: ${pregnant}` : ''}
${reason ? `Reason for taking: ${reason}` : ''}

Provide:
1. **What it is & Drug Class** — category and mechanism of action
2. **Common Uses** — what conditions it treats
3. **How It Works** — simplified explanation
4. **Common Side Effects** — mild and serious
5. **Drug Interactions** — with the patient's current medications if provided
6. **Precautions & Warnings** — who should avoid it
7. **Food & Drink Interactions** — what to avoid
8. **Storage** — how to store properly
9. **Missed Dose Guidance** — what to do
10. **Natural Alternatives** — if applicable

IMPORTANT: Do NOT provide specific dosage instructions — always recommend consulting a doctor or pharmacist for dosing.`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', description: 'Failed to get medicine info.', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          icon={<Pill className="h-8 w-8 text-primary-foreground" />}
          title="Medicine Information"
          description="Learn about uses, side effects, interactions & precautions"
          gradient="from-primary to-secondary"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Enter medicine name..." value={medicine} onChange={e => setMedicine(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()} className="pl-10" />
                </div>
                <Button onClick={() => handleSearch()} disabled={ai.isLoading}>
                  {ai.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                </Button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Quick search:</p>
                <div className="flex flex-wrap gap-2">
                  {commonMedicines.map(m => (
                    <button key={m} onClick={() => handleSearch(m)} className="symptom-chip text-xs">{m}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Your Details (for personalized info)</h3>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Age</Label><Input type="number" placeholder="30" value={age} onChange={e => setAge(e.target.value)} /></div>
                <div><Label>Weight (kg)</Label><Input type="number" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)} /></div>
                <div><Label>Gender</Label><ChipSelect options={['male', 'female']} value={gender} onChange={setGender} /></div>
              </div>
              <div><Label>Current Medications</Label><Input placeholder="List other medicines you take..." value={currentMeds} onChange={e => setCurrentMeds(e.target.value)} /></div>
              <div><Label>Pre-existing Conditions</Label><Input placeholder="Diabetes, kidney disease, liver issues..." value={conditions} onChange={e => setConditions(e.target.value)} /></div>
              <div><Label>Known Allergies</Label><Input placeholder="Penicillin, sulfa drugs..." value={allergies} onChange={e => setAllergies(e.target.value)} /></div>
              <div><Label>Reason for Taking</Label><Input placeholder="Headache, infection, blood pressure..." value={reason} onChange={e => setReason(e.target.value)} /></div>
              <div><Label>Pregnant / Breastfeeding?</Label><ChipSelect options={['no', 'pregnant', 'breastfeeding', 'planning']} value={pregnant} onChange={setPregnant} /></div>
            </div>
          </div>

          <div className="space-y-4">
            <AIResponseCard
              content={ai.response}
              isLoading={ai.isLoading}
              icon={<Pill className="h-5 w-5 text-primary" />}
              title="Medicine Details"
              maxHeight="600px"
              emptyIcon={<Pill className="h-16 w-16" />}
              emptyTitle="Search for a Medicine"
              emptyDescription="Enter a medicine name and optionally your details for personalized information"
              showDisclaimer={false}
            />

            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-destructive mb-1">Important</p>
                <p>This information is for educational purposes only. No specific dosages are provided. Always consult your doctor or pharmacist for medication guidance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
