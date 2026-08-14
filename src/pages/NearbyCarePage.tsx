import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, Phone, Star, Loader2, Hospital, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { ParticleBackground } from '@/components/ParticleBackground';
import { FloatingBackground } from '@/components/FloatingBackground';
import { ScrollReveal } from '@/components/ScrollReveal';

interface Place {
  id: string;
  name: string;
  address: string;
  category: string;
  rating: number | null;
  reviews: number | null;
  phone: string | null;
  openNow: boolean | null;
  mapsUri: string | null;
  lat: number | null;
  lng: number | null;
  distanceKm: number | null;
}

const KINDS = ['hospital', 'doctor', 'pharmacy', 'dentist', 'emergency'];
const RADII = ['2 km', '5 km', '10 km', '25 km'];

export default function NearbyCarePage() {
  const [params] = useSearchParams();
  const [kind, setKind] = useState(params.get('kind') || 'hospital');
  const [radiusLabel, setRadiusLabel] = useState('5 km');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const { toast } = useToast();

  const radius = (parseInt(radiusLabel, 10) || 5) * 1000;

  const search = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setNotice(null);
    try {
      const { data, error } = await supabase.functions.invoke('nearby-care', {
        body: { kind, radius, ...payload },
      });
      if (error) {
        const detail = (error as any)?.context?.text ? await (error as any).context.text() : error.message;
        let message = 'Could not load nearby care providers.';
        try {
          const parsed = JSON.parse(detail);
          if (parsed?.error) message = parsed.error;
        } catch { /* keep default */ }
        setNotice(message);
        setPlaces([]);
        return;
      }
      const result = (data as { places?: Place[]; center?: { lat: number; lng: number } } | null);
      if (result?.center) setCoords(result.center);
      setPlaces(result?.places ?? []);
      if ((result?.places ?? []).length === 0) {
        setNotice('No results in this radius — try a wider radius or a different category.');
      }
    } catch {
      setNotice('Could not load nearby care providers.');
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      toast({ title: 'Location unavailable', description: 'Your browser does not support location. Enter a city or address instead.', variant: 'destructive' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(next);
        void search(next);
      },
      () => {
        setLocating(false);
        toast({ title: 'Location blocked', description: 'Allow location access, or type a city or address below.', variant: 'destructive' });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const searchByAddress = () => {
    if (address.trim().length < 3) {
      toast({ title: 'Enter a place', description: 'Type a city, area or full address.', variant: 'destructive' });
      return;
    }
    void search({ address: address.trim() });
  };

  // Re-run the search when the category or radius changes and we already have a centre.
  useEffect(() => {
    if (coords) void search(coords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, radiusLabel]);

  return (
    <div className="relative">
      <ParticleBackground variant="emergency" />
      <FloatingBackground variant="emergency" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            icon={<Hospital className="h-8 w-8 text-primary-foreground" />}
            title="Care Near Me"
            description="Find hospitals, doctors, pharmacies and dentists close to you"
            gradient="from-primary to-secondary"
          />

          <ScrollReveal delay={0.1}>
            <div className="bg-card rounded-2xl p-5 border border-border shadow-soft space-y-4">
              <div>
                <Label>What do you need?</Label>
                <ChipSelect options={KINDS} value={kind} onChange={setKind} allowCustom={false} />
              </div>
              <div>
                <Label>Search radius</Label>
                <ChipSelect options={RADII} value={radiusLabel} onChange={setRadiusLabel} allowCustom={false} />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={useMyLocation} disabled={locating || loading} className="flex-1">
                  {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                  Use my location
                </Button>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Or enter a city, area or address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') searchByAddress(); }}
                  />
                  <Button variant="secondary" onClick={searchByAddress} disabled={loading}>Search</Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Healthier does not provide emergency services. In a life-threatening situation call your local emergency number immediately.
              </p>
            </div>
          </ScrollReveal>

          {notice && (
            <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">{notice}</div>
          )}

          {loading && (
            <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Looking for care nearby...
            </div>
          )}

          <div className="mt-6 space-y-3">
            {places.map((place, index) => (
              <ScrollReveal key={place.id || `${place.name}-${index}`} delay={Math.min(index * 0.03, 0.3)}>
                <div className="bg-card rounded-2xl p-4 border border-border shadow-soft hover:shadow-elevated transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{place.name}</h3>
                      {place.category && <p className="text-xs text-muted-foreground">{place.category}</p>}
                      <p className="text-sm text-muted-foreground mt-1 flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>{place.address}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                        {place.distanceKm !== null && (
                          <span className="text-primary font-medium">{place.distanceKm} km away</span>
                        )}
                        {place.rating !== null && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Star className="h-3.5 w-3.5 text-warning" />
                            {place.rating}{place.reviews ? ` (${place.reviews})` : ''}
                          </span>
                        )}
                        {place.openNow !== null && (
                          <span className={place.openNow ? 'text-success' : 'text-muted-foreground'}>
                            {place.openNow ? 'Open now' : 'Closed now'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {place.phone && (
                        <Button size="sm" variant="secondary" asChild>
                          <a href={`tel:${place.phone.replace(/\s/g, '')}`}><Phone className="h-3.5 w-3.5" /> Call</a>
                        </Button>
                      )}
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={place.mapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Directions
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
