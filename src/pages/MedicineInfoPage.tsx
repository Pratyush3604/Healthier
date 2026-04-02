import { useState } from 'react';
import { Pill, Loader2, Search, AlertTriangle, BookOpen, Shield, Zap, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const [dosageForm, setDosageForm] = useState('tablet');
  const [kidneyLiver, setKidneyLiver] = useState('healthy');
  const [alcoholUse, setAlcoholUse] = useState('none');
  const [drivingConcern, setDrivingConcern] = useState('no');
  const [additionalQuestions, setAdditionalQuestions] = useState('');
  const { toast } = useToast();
  const ai = useAIStream({ type: 'medicine-info' });

  const commonMedicines = ['Paracetamol', 'Ibuprofen', 'Aspirin', 'Amoxicillin', 'Cetirizine', 'Omeprazole', 'Metformin', 'Vitamin D', 'Azithromycin', 'Lisinopril', 'Atorvastatin', 'Metoprolol', 'Amlodipine', 'Losartan', 'Gabapentin', 'Prednisone'];

  const handleSearch = async (name?: string) => {
    const med = name || medicine;
    if (!med.trim()) { toast({ title: 'Enter a medicine name', variant: 'destructive' }); return; }
    if (name) setMedicine(name);

    const prompt = `You are a comprehensive pharmaceutical reference AI. Provide an **extremely detailed** analysis of **"${med}"**:

Patient context:
${age ? `- Age: ${age}` : ''}${weight ? `, Weight: ${weight}kg` : ''}${gender ? `, Gender: ${gender}` : ''}
${currentMeds ? `- Current medications: ${currentMeds}` : ''}
${conditions ? `- Pre-existing conditions: ${conditions}` : ''}
${allergies ? `- Known allergies: ${allergies}` : ''}
${pregnant !== 'no' ? `- Pregnancy/breastfeeding: ${pregnant}` : ''}
${reason ? `- Reason for taking: ${reason}` : ''}
- Preferred form: ${dosageForm}
- Kidney/Liver health: ${kidneyLiver}
- Alcohol use: ${alcoholUse}
${drivingConcern === 'yes' ? '- Patient drives regularly (check drowsiness risk)' : ''}
${additionalQuestions ? `- Patient questions: ${additionalQuestions}` : ''}

Provide these sections in detail:

## 💊 What It Is
Drug class, generic vs brand names, mechanism of action explained simply

## 🎯 Common Uses
All FDA-approved and common off-label uses

## ⚙️ How It Works
Detailed but understandable explanation of pharmacology

## 📋 Common Side Effects
### Mild (usually resolve)
### Serious (seek help if)
### Rare but dangerous

## ⚠️ Drug Interactions
${currentMeds ? `Specifically check interactions with: ${currentMeds}` : 'Common drug interactions'}
Include food-drug interactions, supplement interactions

## 🚫 Who Should NOT Take This
Absolute contraindications and relative contraindications

## 🍽️ Food & Lifestyle
- Foods to avoid or take with
- Alcohol interaction
- Exercise considerations
${drivingConcern === 'yes' ? '- Driving/machinery safety' : ''}

## 💉 Available Forms
Tablet, capsule, liquid, injection variants with pros/cons

## 📦 Storage & Handling
Temperature, light exposure, expiry considerations

## ⏰ Missed Dose
What to do if you miss a dose vs double-dosing risks

## 🔄 Stopping the Medication
Can it be stopped abruptly? Tapering requirements?

## 🌿 Natural Alternatives
Evidence-based natural alternatives or complementary approaches

## 🔬 Latest Research
Any notable recent findings about this medication

IMPORTANT: Do NOT provide specific dosage instructions. Recommend consulting doctor/pharmacist for dosing.`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
      // Auto-save to reports
      const existing = JSON.parse(localStorage.getItem('healthier-reports') || '[]');
      existing.push({ id: `medicine-${Date.now()}`, type: 'medicine', title: `Medicine Info: ${med}`, date: new Date().toISOString().split('T')[0], summary: `Looked up ${med}`, details: '' });
      localStorage.setItem('healthier-reports', JSON.stringify(existing));
    } catch { toast({ title: 'Error', description: 'Failed to get medicine info.', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={<Pill className="h-8 w-8 text-primary-foreground" />}
          title="Medicine Encyclopedia"
          description="Deep-dive into any medication — uses, interactions, side effects, alternatives & more"
          gradient="from-primary to-secondary"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {/* Search */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search any medicine..." value={medicine} onChange={e => setMedicine(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()} className="pl-10 text-lg h-12" />
                </div>
                <Button onClick={() => handleSearch()} disabled={ai.isLoading} size="lg">
                  {ai.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4 mr-2" />Search</>}
                </Button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Popular medicines:</p>
                <div className="flex flex-wrap gap-2">
                  {commonMedicines.map(m => (
                    <button key={m} onClick={() => handleSearch(m)} className="symptom-chip text-xs">{m}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick info cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-xl p-4 border border-border flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">13 Sections</p>
                  <p className="text-[11px] text-muted-foreground">Complete drug profile</p>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border flex items-start gap-3">
                <Shield className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Interaction Check</p>
                  <p className="text-[11px] text-muted-foreground">Against your meds</p>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border flex items-start gap-3">
                <Zap className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Side Effects</p>
                  <p className="text-[11px] text-muted-foreground">Mild to severe grading</p>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border flex items-start gap-3">
                <Droplets className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">Alternatives</p>
                  <p className="text-[11px] text-muted-foreground">Natural & pharmaceutical</p>
                </div>
              </div>
            </div>

            {/* Patient details */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Your Details (for personalized analysis)</h3>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Age</Label><Input type="number" placeholder="30" value={age} onChange={e => setAge(e.target.value)} /></div>
                <div><Label>Weight (kg)</Label><Input type="number" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)} /></div>
                <div><Label>Gender</Label><ChipSelect options={['male', 'female']} value={gender} onChange={setGender} /></div>
              </div>
              <div><Label>Current Medications (for interaction check)</Label><Textarea placeholder="List all medicines, supplements, vitamins you take..." value={currentMeds} onChange={e => setCurrentMeds(e.target.value)} rows={2} /></div>
              <div><Label>Pre-existing Conditions</Label><Input placeholder="Diabetes, kidney disease, liver issues, asthma..." value={conditions} onChange={e => setConditions(e.target.value)} /></div>
              <div><Label>Known Allergies</Label><Input placeholder="Penicillin, sulfa drugs, NSAIDs..." value={allergies} onChange={e => setAllergies(e.target.value)} /></div>
              <div><Label>Reason for Taking</Label><Input placeholder="Headache, infection, blood pressure..." value={reason} onChange={e => setReason(e.target.value)} /></div>
              <div><Label>Pregnant / Breastfeeding?</Label><ChipSelect options={['no', 'pregnant', 'breastfeeding', 'planning']} value={pregnant} onChange={setPregnant} /></div>
              <div><Label>Preferred Form</Label><ChipSelect options={['tablet', 'capsule', 'liquid', 'injection', 'topical', 'any']} value={dosageForm} onChange={setDosageForm} /></div>
              <div><Label>Kidney/Liver Health</Label><ChipSelect options={['healthy', 'kidney-issues', 'liver-issues', 'both']} value={kidneyLiver} onChange={setKidneyLiver} /></div>
              <div><Label>Alcohol Use</Label><ChipSelect options={['none', 'occasional', 'regular']} value={alcoholUse} onChange={setAlcoholUse} /></div>
              <div><Label>Drive Regularly?</Label><ChipSelect options={['no', 'yes']} value={drivingConcern} onChange={setDrivingConcern} /></div>
              <div><Label>Your Specific Questions</Label><Textarea placeholder="Can I take it on an empty stomach? Is it addictive?..." value={additionalQuestions} onChange={e => setAdditionalQuestions(e.target.value)} rows={2} /></div>
            </div>
          </div>

          <div className="space-y-4">
            <AIResponseCard
              content={ai.response}
              isLoading={ai.isLoading}
              icon={<Pill className="h-5 w-5 text-primary" />}
              title="Medicine Details"
              maxHeight="700px"
              emptyIcon={<Pill className="h-16 w-16" />}
              emptyTitle="Search for a Medicine"
              emptyDescription="Enter any medicine name for a comprehensive 13-section analysis"
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
