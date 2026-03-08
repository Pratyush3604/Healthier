import { useState } from 'react';
import { Pill, Loader2, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';

export default function MedicineInfoPage() {
  const [medicine, setMedicine] = useState('');
  const { toast } = useToast();
  const ai = useAIStream({ type: 'medicine-info' });

  const commonMedicines = ['Paracetamol', 'Ibuprofen', 'Aspirin', 'Amoxicillin', 'Cetirizine', 'Omeprazole', 'Metformin', 'Vitamin D'];

  const handleSearch = async (name?: string) => {
    const med = name || medicine;
    if (!med.trim()) { toast({ title: 'Enter a medicine name', variant: 'destructive' }); return; }
    if (name) setMedicine(name);

    const prompt = `Provide comprehensive information about the medicine **"${med}"**:

1. **What it is used for**
2. **Common side effects**
3. **Precautions and warnings**
4. **Drug interactions** to be aware of
5. **General notes**

IMPORTANT: Do NOT provide specific dosage instructions - always recommend consulting a doctor or pharmacist for dosing.`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', description: 'Failed to get medicine info.', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          icon={<Pill className="h-8 w-8 text-primary-foreground" />}
          title="Medicine Information"
          description="Learn about uses, side effects, and precautions of medications"
          gradient="from-primary to-secondary"
        />

        <div className="bg-card rounded-2xl p-6 border border-border shadow-soft mb-6">
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
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Quick search:</p>
            <div className="flex flex-wrap gap-2">
              {commonMedicines.map(m => (
                <button key={m} onClick={() => handleSearch(m)} className="symptom-chip text-xs">{m}</button>
              ))}
            </div>
          </div>
        </div>

        <AIResponseCard
          content={ai.response}
          isLoading={ai.isLoading}
          icon={<Pill className="h-5 w-5 text-primary" />}
          title="Medicine Details"
          emptyIcon={<Pill className="h-16 w-16" />}
          emptyTitle="Search for a Medicine"
          emptyDescription="Enter a medicine name to learn about its uses and side effects"
          showDisclaimer={false}
        />

        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20 mt-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-destructive mb-1">Important</p>
            <p>This information is for educational purposes only. No specific dosages are provided. Always consult your doctor or pharmacist for medication guidance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
