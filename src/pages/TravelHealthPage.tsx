import { useState } from 'react';
import { Plane, Sparkles, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAIStream } from '@/hooks/useAIStream';
import { AIResponseCard } from '@/components/AIResponseCard';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { cn } from '@/lib/utils';

const conditions = ['Diabetes', 'Asthma', 'Heart condition', 'Pregnancy', 'Immune disorder', 'Allergies', 'Epilepsy', 'Mobility issues', 'Anxiety disorder', 'None'];
const activities = ['Hiking/Trekking', 'Beach/Swimming', 'City tourism', 'Safari/Wildlife', 'Diving/Snorkeling', 'Winter sports', 'Backpacking', 'Business travel', 'Volunteering', 'Cruise'];

export default function TravelHealthPage() {
  const [form, setForm] = useState({
    destination: '', dates: '', duration: '1-week',
    travelType: 'leisure', accommodation: 'hotel',
    dietaryNeeds: 'none', currentMedications: '',
  });
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const { toast } = useToast();
  const ai = useAIStream({ type: 'travel-health' });

  const toggle = (item: string, arr: string[], setter: (v: string[]) => void) =>
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);

  const handleAnalyze = async () => {
    if (!form.destination) { toast({ title: 'Enter destination', variant: 'destructive' }); return; }
    const prompt = `Travel health advisory for:
- Destination: ${form.destination}
- Travel dates: ${form.dates || 'Not specified'}
- Duration: ${form.duration}
- Travel type: ${form.travelType}
- Accommodation: ${form.accommodation}
- Pre-existing conditions: ${selectedConditions.join(', ') || 'None'}
- Planned activities: ${selectedActivities.join(', ') || 'General tourism'}
- Dietary needs: ${form.dietaryNeeds}
- Current medications: ${form.currentMedications || 'None'}

Provide comprehensive travel health advisory:
1. **Required & Recommended Vaccinations** for this destination
2. **Health Risks** specific to the region (diseases, climate)
3. **Food & Water Safety** guidelines
4. **Insect/Disease Prevention** — malaria, dengue, Zika, etc.
5. **First Aid Packing List** (15+ essential items)
6. **Medication Travel Tips** — carrying prescriptions, time zones
7. **Emergency Numbers** for the destination
8. **Climate & Altitude** health considerations
9. **Travel Insurance** recommendations
10. **Activity-Specific Safety** tips for selected activities
11. **Jet Lag Management** strategies
12. **Returning Home** — symptoms to watch for post-travel`;

    try {
      await ai.stream([{ role: 'user', content: prompt }]);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          icon={<Plane className="h-8 w-8 text-primary-foreground" />}
          title="Travel Health Advisor"
          description="Get health recommendations, vaccinations & safety tips for your trip"
          gradient="from-secondary to-primary"
        />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft space-y-4">
              <div>
                <Label>Destination *</Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="e.g., Thailand, Brazil, Kenya..." value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} className="pl-10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Travel Dates</Label><Input placeholder="e.g., Dec 2025" value={form.dates} onChange={e => setForm({...form, dates: e.target.value})} /></div>
                <div><Label>Duration</Label><ChipSelect options={['few-days', '1-week', '2-weeks', '1-month', 'longer']} value={form.duration} onChange={v => setForm({...form, duration: v})} /></div>
              </div>
              <div><Label>Travel Type</Label><ChipSelect options={['leisure', 'business', 'adventure', 'backpacking', 'family']} value={form.travelType} onChange={v => setForm({...form, travelType: v})} /></div>
              <div><Label>Accommodation</Label><ChipSelect options={['hotel', 'hostel', 'airbnb', 'camping', 'resort']} value={form.accommodation} onChange={v => setForm({...form, accommodation: v})} /></div>
              <div>
                <Label>Pre-existing Conditions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {conditions.map(c => (
                    <button key={c} onClick={() => toggle(c, selectedConditions, setSelectedConditions)}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        selectedConditions.includes(c) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Planned Activities</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {activities.map(a => (
                    <button key={a} onClick={() => toggle(a, selectedActivities, setSelectedActivities)}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        selectedActivities.includes(a) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div><Label>Dietary Needs</Label><ChipSelect options={['none', 'vegetarian', 'vegan', 'halal', 'kosher', 'gluten-free']} value={form.dietaryNeeds} onChange={v => setForm({...form, dietaryNeeds: v})} /></div>
              <div><Label>Current Medications</Label><Input placeholder="e.g., metformin, inhaler..." value={form.currentMedications} onChange={e => setForm({...form, currentMedications: e.target.value})} /></div>
            </div>
            <Button onClick={handleAnalyze} disabled={!form.destination || ai.isLoading} className="w-full" size="lg">
              {ai.isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Sparkles className="mr-2 h-4 w-4" />Get Travel Health Plan</>}
            </Button>
          </div>

          <AIResponseCard
            content={ai.response}
            isLoading={ai.isLoading}
            icon={<Plane className="h-5 w-5 text-primary" />}
            title="Travel Health Advisory"
            maxHeight="700px"
            emptyIcon={<Plane className="h-16 w-16" />}
            emptyTitle="Plan Your Healthy Trip"
            emptyDescription="Enter your destination for vaccination and health recommendations"
            disclaimerText="Visit a travel clinic 4-6 weeks before travel. This is general guidance only."
          />
        </div>
      </div>
    </div>
  );
}