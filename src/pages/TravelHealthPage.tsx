import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Loader2, AlertTriangle, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

const conditions = ['Diabetes', 'Asthma', 'Heart condition', 'Pregnancy', 'Immune disorder', 'Allergies', 'Epilepsy', 'None'];
const activities = ['Hiking/Trekking', 'Beach/Swimming', 'City tourism', 'Safari/Wildlife', 'Diving/Snorkeling', 'Winter sports', 'Backpacking', 'Business travel'];

export default function TravelHealthPage() {
  const [form, setForm] = useState({ destination: '', dates: '', selectedConditions: [] as string[], selectedActivities: [] as string[] });
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const toggle = (key: 'selectedConditions' | 'selectedActivities', item: string) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(item) ? prev[key].filter(x => x !== item) : [...prev[key], item]
    }));
  };

  const handleAnalyze = async () => {
    if (!form.destination) { toast({ title: 'Enter destination', variant: 'destructive' }); return; }
    setIsLoading(true); setAnalysis(null);

    const prompt = `Travel health advisory for:\n- Destination: ${form.destination}\n- Travel dates: ${form.dates || 'Not specified'}\n- Pre-existing conditions: ${form.selectedConditions.join(', ') || 'None'}\n- Planned activities: ${form.selectedActivities.join(', ') || 'General tourism'}\n\nProvide:\n1. Required and recommended vaccinations\n2. Health risks specific to this destination\n3. Food and water safety guidelines\n4. Insect/disease prevention (malaria, dengue, etc.)\n5. First aid packing list\n6. Medication travel tips\n7. Emergency numbers for the destination\n8. Climate health considerations\n9. Travel insurance recommendations\n10. Activity-specific safety tips`;

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], type: 'travel-health' }),
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-sky-500 to-blue-500"><Plane className="h-8 w-8 text-white" /></div>
          <h1 className="font-display text-3xl font-bold mb-2">Travel Health Advisor</h1>
          <p className="text-muted-foreground">Get health recommendations, vaccinations & safety tips for your trip</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div><Label>Destination</Label><div className="relative mt-1.5"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="e.g., Thailand, Brazil, Kenya..." value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} className="pl-10" /></div></div>
              <div><Label>Travel Dates (optional)</Label><Input type="text" placeholder="e.g., Dec 2025 - Jan 2026" value={form.dates} onChange={e => setForm({...form, dates: e.target.value})} className="mt-1.5" /></div>
              <div><Label>Pre-existing Conditions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {conditions.map(c => (<button key={c} onClick={() => toggle('selectedConditions', c)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.selectedConditions.includes(c) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{c}</button>))}
                </div>
              </div>
              <div><Label>Planned Activities</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {activities.map(a => (<button key={a} onClick={() => toggle('selectedActivities', a)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.selectedActivities.includes(a) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{a}</button>))}
                </div>
              </div>
            </div>
            <Button onClick={handleAnalyze} disabled={!form.destination || isLoading} className="w-full" size="lg">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Travel Health Plan</>}
            </Button>
          </div>
          <div className="space-y-4">
            {analysis ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 border border-border shadow-soft max-h-[600px] overflow-y-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Plane className="h-5 w-5 text-primary" />Travel Health Advisory</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{analysis}</p>
              </motion.div>
            ) : (
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <Plane className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Plan Your Healthy Trip</h3>
                <p className="text-muted-foreground">Enter your destination for vaccination and health recommendations</p>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" /><p className="text-sm text-muted-foreground">Visit a travel clinic 4-6 weeks before travel. This is general guidance only.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
