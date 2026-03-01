import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Loader2, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

export default function MedicineInfoPage() {
  const [medicine, setMedicine] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const commonMedicines = ['Paracetamol', 'Ibuprofen', 'Aspirin', 'Amoxicillin', 'Cetirizine', 'Omeprazole', 'Metformin', 'Vitamin D'];

  const handleSearch = async (name?: string) => {
    const med = name || medicine;
    if (!med.trim()) { toast({ title: 'Enter a medicine name', variant: 'destructive' }); return; }
    setIsLoading(true); setInfo(null);
    if (name) setMedicine(name);

    const prompt = `Provide information about the medicine "${med}": 1. What it is used for 2. Common side effects 3. Precautions and warnings 4. Interactions to be aware of 5. General notes. IMPORTANT: Do NOT provide specific dosage instructions - always recommend consulting a doctor or pharmacist for dosing.`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'medicine-info' }),
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
          try { const p = JSON.parse(jsonStr); const c = p.choices?.[0]?.delta?.content; if (c) { fullContent += c; setInfo(fullContent); } } catch { buffer = line + '\n' + buffer; break; }
        }
      }
    } catch { toast({ title: 'Error', description: 'Failed to get medicine info.', variant: 'destructive' }); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-500">
            <Pill className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Medicine Information</h1>
          <p className="text-muted-foreground">Learn about uses, side effects, and precautions of medications</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-soft mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Enter medicine name..." value={medicine} onChange={e => setMedicine(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()} className="pl-10" />
            </div>
            <Button onClick={() => handleSearch()} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
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

        {info ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft mb-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Pill className="h-5 w-5 text-primary" />Medicine Details</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{info}</p>
          </motion.div>
        ) : (
          <div className="bg-card rounded-2xl p-12 border border-border shadow-soft text-center mb-6">
            <Pill className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Search for a Medicine</h3>
            <p className="text-muted-foreground">Enter a medicine name to learn about its uses and side effects</p>
          </div>
        )}

        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold text-destructive mb-1">Important</p>
            <p>This information is for educational purposes only. No specific dosages are provided. Always consult your doctor or pharmacist for medication guidance.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
