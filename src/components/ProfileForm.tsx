import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, type Profile } from '@/hooks/useAuth';

export type ProfileDraft = {
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  height_cm: string;
  weight_kg: string;
  blood_group: string;
  allergies: string;
  chronic_conditions: string;
  medications: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  city: string;
  country: string;
};

const empty: ProfileDraft = {
  full_name: '', phone: '', date_of_birth: '', gender: '', height_cm: '', weight_kg: '',
  blood_group: '', allergies: '', chronic_conditions: '', medications: '',
  emergency_contact_name: '', emergency_contact_phone: '', city: '', country: '',
};

function fromProfile(profile: Profile | null): ProfileDraft {
  if (!profile) return empty;
  return {
    full_name: profile.full_name ?? '',
    phone: profile.phone ?? '',
    date_of_birth: profile.date_of_birth ?? '',
    gender: profile.gender ?? '',
    height_cm: profile.height_cm != null ? String(profile.height_cm) : '',
    weight_kg: profile.weight_kg != null ? String(profile.weight_kg) : '',
    blood_group: profile.blood_group ?? '',
    allergies: profile.allergies ?? '',
    chronic_conditions: profile.chronic_conditions ?? '',
    medications: profile.medications ?? '',
    emergency_contact_name: profile.emergency_contact_name ?? '',
    emergency_contact_phone: profile.emergency_contact_phone ?? '',
    city: profile.city ?? '',
    country: profile.country ?? '',
  };
}

export function computeAge(dob?: string | null) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export function computeBmi(heightCm?: number | string | null, weightKg?: number | string | null) {
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!h || !w) return null;
  return +(w / Math.pow(h / 100, 2)).toFixed(1);
}

const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function ProfileForm({ onSaved, submitLabel = 'Save profile' }: { onSaved?: () => void; submitLabel?: string }) {
  const { user, profile, refreshProfile } = useAuth();
  const [draft, setDraft] = useState<ProfileDraft>(fromProfile(profile));
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { setDraft(fromProfile(profile)); }, [profile]);

  const set = (key: keyof ProfileDraft) => (value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const bmi = computeBmi(draft.height_cm, draft.weight_kg);
  const age = computeAge(draft.date_of_birth);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!draft.full_name.trim()) {
      toast({ title: 'Name required', description: 'Please enter your full name.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        email: user.email ?? null,
        full_name: draft.full_name.trim().slice(0, 120),
        phone: draft.phone.trim().slice(0, 30) || null,
        date_of_birth: draft.date_of_birth || null,
        gender: draft.gender || null,
        height_cm: draft.height_cm ? Number(draft.height_cm) : null,
        weight_kg: draft.weight_kg ? Number(draft.weight_kg) : null,
        blood_group: draft.blood_group || null,
        allergies: draft.allergies.trim().slice(0, 1000) || null,
        chronic_conditions: draft.chronic_conditions.trim().slice(0, 1000) || null,
        medications: draft.medications.trim().slice(0, 1000) || null,
        emergency_contact_name: draft.emergency_contact_name.trim().slice(0, 120) || null,
        emergency_contact_phone: draft.emergency_contact_phone.trim().slice(0, 30) || null,
        city: draft.city.trim().slice(0, 80) || null,
        country: draft.country.trim().slice(0, 80) || null,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
      await refreshProfile();
      toast({ title: 'Profile saved', description: 'Your health profile has been updated.' });
      onSaved?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not save the profile.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof ProfileDraft, label: string, type = 'text', placeholder = '') => (
    <div>
      <Label htmlFor={key}>{label}</Label>
      <Input id={key} type={type} placeholder={placeholder} value={draft[key]} onChange={(e) => set(key)(e.target.value)} className="mt-1.5" />
    </div>
  );

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        {field('full_name', 'Full name', 'text', 'Your full name')}
        {field('phone', 'Phone number', 'tel', '+91 98765 43210')}
        {field('date_of_birth', 'Date of birth', 'date')}
        <div>
          <Label>Gender</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {genders.map((g) => (
              <button key={g} type="button" onClick={() => set('gender')(g)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${draft.gender === g ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/40'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
        {field('height_cm', 'Height (cm)', 'number', '170')}
        {field('weight_kg', 'Weight (kg)', 'number', '65')}
        <div className="sm:col-span-2">
          <Label>Blood group</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {bloodGroups.map((b) => (
              <button key={b} type="button" onClick={() => set('blood_group')(b)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${draft.blood_group === b ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/40'}`}>
                {b}
              </button>
            ))}
          </div>
        </div>
        {field('allergies', 'Allergies', 'text', 'Penicillin, peanuts…')}
        {field('chronic_conditions', 'Chronic conditions', 'text', 'Asthma, diabetes…')}
        {field('medications', 'Current medications', 'text', 'Metformin 500mg…')}
        {field('emergency_contact_name', 'Emergency contact name', 'text', 'Parent, spouse…')}
        {field('emergency_contact_phone', 'Emergency contact phone', 'tel', '+91 98765 43210')}
        {field('city', 'City', 'text', 'Kolkata')}
        {field('country', 'Country', 'text', 'India')}
      </div>

      {(age !== null || bmi !== null) && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {age !== null && <span>Age: <strong className="text-foreground">{age}</strong></span>}
          {bmi !== null && <span>BMI: <strong className="text-foreground">{bmi}</strong></span>}
        </div>
      )}

      <Button type="submit" size="lg" disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> {submitLabel}</>}
      </Button>
    </form>
  );
}
