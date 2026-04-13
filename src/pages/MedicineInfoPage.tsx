import { useState } from 'react';
import { Pill, Loader2, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { FloatingBackground } from '@/components/FloatingBackground';
import { ParticleBackground } from '@/components/ParticleBackground';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function MedicineInfoPage() {
  const [medicine, setMedicine] = useState('');
  const [additionalQuestions, setAdditionalQuestions] = useState('');
  const { toast } = useToast();
  const ai = useAIStream({ type: 'medicine-info' });

  const commonMedicines = ['Paracetamol', 'Ibuprofen', 'Aspirin', 'Amoxicillin', 'Cetirizine', 'Omeprazole', 'Metformin', 'Vitamin D', 'Azithromycin', 'Lisinopril', 'Atorvastatin', 'Metoprolol', 'Amlodipine', 'Losartan', 'Gabapentin', 'Prednisone'];

  const handleSearch = async (name?: string) => {
    const med = name || medicine;
    if (!med.trim()) { toast({ title: 'Enter a medicine name', variant: 'destructive' }); return; }
    if (name) setMedicine(name);

    const prompt = `You are a pharmaceutical reference AI. Provide a clear, concise profile of **"${med}"**:

${additionalQuestions ? `Patient questions: ${additionalQuestions}` : ''}

IMPORTANT: Do NOT prescribe this medicine. Do NOT recommend dosages. Always advise consulting a doctor or pharmacist for dosing and prescription.

Provide EXACTLY these sections:

## 💊 What It Is
Drug class, generic vs brand names, what it does in simple terms.

## 🎯 Common Uses
All common uses (FDA-approved and well-known off-label).

## 📋 Common Side Effects
### Mild (usually resolve on their own)
### Serious (seek medical help immediately)

## 🚫 Who Should NOT Take This
Absolute and relative contraindications.

## ⚙️ How It Works
Simple explanation of the mechanism of action.

End with: "⚠️ Always consult your doctor or pharmacist before starting, stopping, or changing any medication."`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
      const existing = JSON.parse(localStorage.getItem('healthier-reports') || '[]');
      existing.push({ id: `medicine-${Date.now()}`, type: 'medicine', title: `Medicine Info: ${med}`, date: new Date().toISOString().split('T')[0], summary: `Looked up ${med}`, details: '' });
      localStorage.setItem('healthier-reports', JSON.stringify(existing));
    } catch { toast({ title: 'Error', description: 'Failed to get medicine info.', variant: 'destructive' }); }
  };

  return (
    <div className="relative">
      <ParticleBackground variant="medicine" />
      <FloatingBackground variant="medicine" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            icon={<Pill className="h-8 w-8 text-primary-foreground" />}
            title="Medicine Encyclopedia"
            description="Search any medication for a comprehensive drug profile"
            gradient="from-primary to-secondary"
          />

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <ScrollReveal delay={0.1}>
                <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4 hover:shadow-elevated transition-shadow duration-300">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search any medicine..." value={medicine} onChange={e => setMedicine(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()} className="pl-10 text-lg h-12" />
                    </div>
                    <Button onClick={() => handleSearch()} disabled={ai.isLoading} size="lg" className="hover:scale-105 active:scale-95 transition-transform">
                      {ai.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4 mr-2" />Search</>}
                    </Button>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Popular medicines:</p>
                    <div className="flex flex-wrap gap-2">
                      {commonMedicines.map(m => (
                        <button key={m} onClick={() => handleSearch(m)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-105 active:scale-95 transition-all duration-200">{m}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Your specific questions (optional)</p>
                    <Textarea placeholder="Can I take it on an empty stomach? Is it safe during pregnancy? Does it cause drowsiness?..." value={additionalQuestions} onChange={e => setAdditionalQuestions(e.target.value)} rows={2} />
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.15} direction="right">
              <div className="space-y-4">
                <AIResponseCard
                  content={ai.response}
                  isLoading={ai.isLoading}
                  icon={<Pill className="h-5 w-5 text-primary" />}
                  title="Medicine Details"
                  maxHeight="700px"
                  emptyIcon={<Pill className="h-16 w-16" />}
                  emptyTitle="Search for a Medicine"
                  emptyDescription="Enter any medicine name for a comprehensive analysis"
                  showDisclaimer={false}
                />
                <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold text-destructive mb-1">Important</p>
                    <p>This information is for educational purposes only. Always consult your doctor or pharmacist for medication guidance. Healthier does not prescribe medications.</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
