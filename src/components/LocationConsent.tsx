import { useState } from 'react';
import { MapPin, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return [data.locality, data.city, data.principalSubdivision, data.countryName]
      .filter((part: string | undefined, index: number, arr: (string | undefined)[]) => part && arr.indexOf(part) === index)
      .join(', ') || null;
  } catch {
    return null;
  }
}

/** Saves the signed-in user's last known location, only after they explicitly allow it. */
export async function captureLocation(userId: string) {
  if (!('geolocation' in navigator)) throw new Error('This device does not support location.');
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000 });
  });
  const { latitude, longitude, accuracy } = position.coords;
  const label = await reverseGeocode(latitude, longitude);
  const { error } = await supabase
    .from('profiles')
    .update({
      latitude,
      longitude,
      location_accuracy_m: accuracy ? Math.round(accuracy) : null,
      location_label: label,
      location_updated_at: new Date().toISOString(),
      location_consent: true,
    })
    .eq('user_id', userId);
  if (error) throw error;
  return label;
}

export function LocationConsent({ compact = false }: { compact?: boolean }) {
  const { user, profile, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const share = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const label = await captureLocation(user.id);
      await refreshProfile();
      toast({ title: 'Location saved', description: label ?? 'Your last known location has been stored.' });
    } catch (error: unknown) {
      const message =
        error instanceof GeolocationPositionError || (error as { code?: number })?.code
          ? 'Location permission was denied or unavailable. You can allow it from your browser settings.'
          : error instanceof Error
            ? error.message
            : 'Could not read your location.';
      toast({ title: 'Location unavailable', description: message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const saved = Boolean(profile?.location_updated_at);

  return (
    <div className={compact ? '' : 'bg-muted/40 border border-border rounded-2xl p-4'}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold">Share my location</p>
          <p className="text-sm text-muted-foreground">
            Healthier keeps your last known location so emergency help and nearby-care results are accurate. Your browser
            will ask for permission first, and you can turn it off any time.
          </p>
          {saved && (
            <p className="text-sm mt-2 flex items-center gap-1.5 text-primary">
              <Check className="h-4 w-4" />
              {profile?.location_label || `${profile?.latitude}, ${profile?.longitude}`}
              <span className="text-muted-foreground">
                · updated {new Date(profile!.location_updated_at as string).toLocaleString()}
              </span>
            </p>
          )}
        </div>
      </div>
      <Button type="button" variant={saved ? 'outline' : 'default'} className="mt-4" onClick={() => void share()} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><MapPin className="mr-2 h-4 w-4" /> {saved ? 'Update my location' : 'Share my location'}</>}
      </Button>
    </div>
  );
}
