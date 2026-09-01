import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { computeAge, computeBmi } from '@/components/ProfileForm';
import { LocationConsent } from '@/components/LocationConsent';

const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

type Draft = {
  phone: string;
  date_of_birth: string;
  gender: string;
  city: string;
  country: string;
  preferred_language: string;
  blood_group: string;
  height_cm: string;
  weight_kg: string;
  allergies: string;
  chronic_conditions: string;
  medications: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
};

const empty: Draft = {
  phone: '', date_of_birth: '', gender: '', city: '', country: '', preferred_language: '',
  blood_group: '', height_cm: '', weight_kg: '', allergies: '', chronic_conditions: '',
  medications: '', emergency_contact_name: '', emergency_contact_phone: '',
};

const steps = ['About you', 'Health basics', 'Location'];

export function ProfileWizard({ onDone }: { onDone: () => void }) {
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(empty);
  const [saving, setSaving] = useState(false);
  const [none, setNone] = useState<Record<'allergies' | 'chronic_conditions' | 'medications', boolean>>({
    allergies: false, chronic_conditions: false, medications: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!profile) return;
    setDraft({
      phone: profile.phone ?? '',
      date_of_birth: profile.date_of_birth ?? '',
      gender: profile.gender ?? '',
      city: profile.city ?? '',
      country: profile.country ?? '',
      preferred_language: profile.preferred_language ?? '',
      blood_group: profile.blood_group ?? '',
      height_cm: profile.height_cm != null ? String(profile.height_cm) : '',
      weight_kg: profile.weight_kg != null ? String(profile.weight_kg) : '',
      allergies: profile.allergies ?? '',
      chronic_conditions: profile.chronic_conditions ?? '',
      medications: profile.medications ?? '',
      emergency_contact_name: profile.emergency_contact_name ?? '',
      emergency_contact_phone: profile.emergency_contact_phone ?? '',
    });
  }, [profile]);

  const set = (key: keyof Draft) => (value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const text = (key: keyof Draft, label: string, type = 'text', placeholder = '') => (
    <div>
      <Label htmlFor={key}>{label}</Label>
      <Input id={key} type={type} placeholder={placeholder} value={draft[key]}
        onChange={(e) => set(key)(e.target.value)} className="mt-1.5" />
    </div>
  );

  const noneBox = (key: 'allergies' | 'chronic_conditions' | 'medications', label: string, placeholder: string) => (
    <div>
      <div className="flex items-center justify-between">
        <Label htmlFor={key}>{label}</Label>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={none[key]}
            onChange={(e) => {
              const checked = e.target.checked;
              setNone((n) => ({ ...n, [key]: checked }));
              set(key)(checked ? 'None' : '');
            }} />
          None
        </label>
      </div>
      <Input id={key} placeholder={placeholder} value={draft[key]} disabled={none[key]}
        onChange={(e) => set(key)(e.target.value)} className="mt-1.5" />
    </div>
  );

  const chips = (key: keyof Draft, label: string, options: string[]) => (
    <div className="sm:col-span-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map((option) => (
          <button key={option} type="button" onClick={() => set(key)(draft[key] === option ? '' : option)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${draft[key] === option ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/40'}`}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  /** Saves whatever has been filled in so far — every field on these steps is optional. */
  const saveProgress = async (markComplete = false) => {
    if (!user) return true;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        phone: draft.phone.trim().slice(0, 30) || null,
        date_of_birth: draft.date_of_birth || null,
        gender: draft.gender || null,
        city: draft.city.trim().slice(0, 80) || null,
        country: draft.country.trim().slice(0, 80) || null,
        preferred_language: draft.preferred_language.trim().slice(0, 80) || null,
        blood_group: draft.blood_group || null,
        height_cm: draft.height_cm ? Number(draft.height_cm) : null,
        weight_kg: draft.weight_kg ? Number(draft.weight_kg) : null,
        allergies: draft.allergies.trim().slice(0, 1000) || null,
        chronic_conditions: draft.chronic_conditions.trim().slice(0, 1000) || null,
        medications: draft.medications.trim().slice(0, 1000) || null,
        emergency_contact_name: draft.emergency_contact_name.trim().slice(0, 120) || null,
        emergency_contact_phone: draft.emergency_contact_phone.trim().slice(0, 30) || null,
        ...(markComplete ? { profile_completed: true } : {}),
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id);
      if (error) throw error;
      await refreshProfile();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not save your details.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const next = async () => {
    if (!(await saveProgress(step === steps.length - 1))) return;
    if (step === steps.length - 1) {
      toast({ title: 'All set', description: 'You can update these details any time in Settings.' });
      onDone();
    } else {
      setStep((s) => s + 1);
    }
  };

  const skipAll = async () => {
    await saveProgress(true);
    onDone();
  };

  const age = computeAge(draft.date_of_birth);
  const bmi = computeBmi(draft.height_cm, draft.weight_kg);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {steps.map((label, index) => (
          <div key={label} className="flex-1">
            <div className={`h-1.5 rounded-full ${index <= step ? 'bg-primary' : 'bg-muted'}`} />
            <p className={`text-xs mt-1.5 ${index === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Step {index + 2} · {label}
            </p>
          </div>
        ))}
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
        {step === 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {text('phone', 'Phone number', 'tel', '+91 98765 43210')}
            {text('date_of_birth', 'Date of birth', 'date')}
            {chips('gender', 'Gender', genders)}
            {text('city', 'City', 'text', 'Kolkata')}
            {text('country', 'Country', 'text', 'India')}
            {text('preferred_language', 'Preferred language', 'text', 'English')}
            {age !== null && (
              <p className="sm:col-span-2 text-sm text-muted-foreground">Age: <strong className="text-foreground">{age}</strong></p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {chips('blood_group', 'Blood group', bloodGroups)}
            {text('height_cm', 'Height (cm)', 'number', '170')}
            {text('weight_kg', 'Weight (kg)', 'number', '65')}
            {noneBox('allergies', 'Allergies', 'Penicillin, peanuts…')}
            {noneBox('chronic_conditions', 'Chronic conditions', 'Asthma, diabetes…')}
            {noneBox('medications', 'Current medications', 'Metformin 500mg…')}
            {text('emergency_contact_name', 'Emergency contact name', 'text', 'Parent, spouse…')}
            {text('emergency_contact_phone', 'Emergency contact phone', 'tel', '+91 98765 43210')}
            {bmi !== null && (
              <p className="sm:col-span-2 text-sm text-muted-foreground">BMI: <strong className="text-foreground">{bmi}</strong></p>
            )}
          </div>
        )}

        {step === 2 && <LocationConsent />}
      </motion.div>

      <div className="flex flex-wrap items-center gap-3 mt-8">
        {step > 0 && (
          <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} disabled={saving}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        )}
        <Button type="button" onClick={() => void next()} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" />
            : step === steps.length - 1
              ? <><Check className="mr-2 h-4 w-4" /> Finish</>
              : <>Save and continue <ArrowRight className="ml-2 h-4 w-4" /></>}
        </Button>
        <Button type="button" variant="ghost" onClick={() => void skipAll()} disabled={saving}>
          These are optional — skip
        </Button>
      </div>
    </div>
  );
}
