import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, Phone, Star, Loader2, Hospital, ExternalLink, Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';
import { ChipSelect } from '@/components/ChipSelect';
import { ScrollReveal } from '@/components/ScrollReveal';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Place {
  id: string; name: string; address: string; category: string;
  rating: number | null; reviews: number | null; phone: string | null;
  openNow: boolean | null; mapsUri: string | null;
  lat: number | null; lng: number | null; distanceKm: number | null;
}

const GROUPS: Record<string, string[]> = {
  'Common': ['hospital', 'doctor', 'general physician', 'pharmacy', '24/7 pharmacy', 'emergency', 'ambulance'],
  'Specialists': ['pediatrician', 'gynecologist', 'cardiologist', 'dermatologist', 'orthopedic', 'neurologist', 'psychiatrist', 'psychologist', 'ent specialist', 'ophthalmologist', 'urologist', 'gastroenterologist', 'pulmonologist', 'endocrinologist', 'nephrologist', 'oncologist'],
  'Dental, eye & therapy': ['dentist', 'dental clinic', 'eye clinic', 'physiotherapist', 'chiropractor'],
  'Tests & more': ['lab', 'diagnostic center', 'blood bank', 'maternity hospital', 'ayurveda', 'homeopathy', 'veterinary'],
};
const SORTS = ['nearest', 'top rated', 'most reviewed'];

export default function NearbyCarePage() {
  const [params] = useSearchParams();
  const [kind, setKind] = useState(params.get('kind') || 'hospital');
  const [radiusKm, setRadiusKm] = useState(5);
  const [openOnly, setOpenOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [phoneOnly, setPhoneOnly] = useState(false);
  const [sort, setSort] = useState('nearest');
  const [address, setAddress] = useState('');
  const [customQuery, setCustomQuery] = useState(params.get('q') || '');

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [shortlist, setShortlist] = useLocalStorage<Place[]>('healthier.care-shortlist', []);
  const [tab, setTab] = useState<'results' | 'shortlist'>('results');
  const { toast } = useToast();
  const autoRan = useRef(false);

  const search = async (payload: Record<string, unknown>) => {
    setLoading(true); setNotice(null); setTab('results');
    try {
      const q = customQuery.trim();
      const { data, error } = await supabase.functions.invoke('nearby-care', { body: { kind, radius: radiusKm * 1000, ...(q ? { query: q } : {}), ...payload } });

      if (error) {
        const status = (error as any)?.context?.status;
        if (status === 401) {
          window.dispatchEvent(new CustomEvent('healthier:signin-required', { detail: { message: 'Sign in (free) to search for care near you.' } }));
          setNotice('Sign in (free) to search for care near you.'); setPlaces([]); return;
        }
        let message = 'Could not load nearby care providers.';
        try {
          const detail = (error as any)?.context?.text ? await (error as any).context.text() : '';
          const parsed = JSON.parse(detail);
          if (parsed?.error) message = parsed.error;
        } catch { /* keep default */ }
        setNotice(message); setPlaces([]); return;
      }
      const result = data as { places?: Place[]; center?: { lat: number; lng: number } } | null;
      if (result?.center) setCoords(result.center);
      setPlaces(result?.places ?? []);
    } catch {
      setNotice('Could not load nearby care providers.');
    } finally { setLoading(false); }
  };

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      toast({ title: 'Location unavailable', description: 'Enter a city or address instead.', variant: 'destructive' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(next); void search(next);
      },
      () => {
        setLocating(false);
        toast({ title: 'Location blocked', description: 'Allow location access in your browser, or type a city or address below.', variant: 'destructive' });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  const searchByAddress = () => {
    if (address.trim().length < 3) {
      toast({ title: 'Enter a place', description: 'Type a city, area or full address.', variant: 'destructive' });
      return;
    }
    void search({ address: address.trim() });
  };

  // Free-text search: works off the detected location, or the typed city/address.
  const runCustomSearch = () => {
    if (customQuery.trim().length < 2) {
      toast({ title: 'Type what you need', description: 'For example "MRI scan" or a clinic name.', variant: 'destructive' });
      return;
    }
    if (coords) { void search(coords); return; }
    if (address.trim().length >= 3) { void search({ address: address.trim() }); return; }
    useMyLocation();
  };


  useEffect(() => {
    if (!autoRan.current && params.get('locate') === '1') { autoRan.current = true; useMyLocation(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (coords) void search(coords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const shown = useMemo(() => {
    const list = places.filter((p) =>
      (p.distanceKm === null || p.distanceKm <= radiusKm * 1.2) &&
      (!openOnly || p.openNow === true) &&
      (p.rating ?? 0) >= minRating &&
      (!phoneOnly || !!p.phone));
    return [...list].sort((a, b) =>
      sort === 'top rated' ? (b.rating ?? 0) - (a.rating ?? 0)
        : sort === 'most reviewed' ? (b.reviews ?? 0) - (a.reviews ?? 0)
          : (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
  }, [places, openOnly, minRating, phoneOnly, sort, radiusKm]);

  const saved = (p: Place) => shortlist.some((s) => s.id === p.id);
  const toggleSave = (p: Place) => setShortlist(saved(p) ? shortlist.filter((s) => s.id !== p.id) : [...shortlist, p]);

  const list = tab === 'results' ? shown : shortlist;

  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      <div className="max-w-4xl mx-auto">
        <PageHeader icon={<Hospital className="h-8 w-8 text-primary-foreground" />} title="Care Near Me"
          description="Find hospitals, doctors, specialists, pharmacies and labs close to you" gradient="from-primary to-secondary" />

        <ScrollReveal delay={0.1}>
          <div className="bg-card rounded-2xl p-5 border border-border shadow-soft space-y-5">
            <div>
              <Label>Search for anything specific</Label>
              <div className="mt-2 flex gap-2">
                <Input placeholder='e.g. "MRI scan", "dialysis centre", "root canal", a doctor or clinic name'
                  value={customQuery} onChange={(e) => setCustomQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') runCustomSearch(); }} />
                <Button variant="secondary" onClick={runCustomSearch} disabled={loading}>Find</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Leave this empty to use the categories below.</p>
            </div>

            {Object.entries(GROUPS).map(([group, opts]) => (
              <div key={group}>
                <Label>{group}</Label>
                <ChipSelect options={opts} value={opts.includes(kind) ? kind : ''} onChange={(v) => { if (v) { setCustomQuery(''); setKind(v); } }} allowCustom={false} />
              </div>
            ))}


            <div>
              <div className="flex justify-between"><Label>Search radius</Label><span className="text-sm font-semibold text-primary">{radiusKm} km</span></div>
              <Slider className="mt-3" min={1} max={50} step={1} value={[radiusKm]} onValueChange={(v) => setRadiusKm(v[0])}
                onValueCommit={() => { if (coords) void search(coords); }} />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <label className="flex items-center justify-between gap-2 text-sm rounded-xl border border-border p-3">Open now only <Switch checked={openOnly} onCheckedChange={setOpenOnly} /></label>
              <label className="flex items-center justify-between gap-2 text-sm rounded-xl border border-border p-3">Has phone number <Switch checked={phoneOnly} onCheckedChange={setPhoneOnly} /></label>
              <div className="rounded-xl border border-border p-3 text-sm">
                <div className="flex justify-between">Min rating <b>{minRating ? `${minRating}★+` : 'Any'}</b></div>
                <Slider className="mt-2" min={0} max={4.5} step={0.5} value={[minRating]} onValueChange={(v) => setMinRating(v[0])} />
              </div>
            </div>
            <div><Label>Sort by</Label><ChipSelect options={SORTS} value={sort} onChange={setSort} allowCustom={false} /></div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={useMyLocation} disabled={locating || loading} className="flex-1">
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />} Use my location
              </Button>
              <div className="flex-1 flex gap-2">
                <Input placeholder="Or enter a city, area or address" value={address} onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') searchByAddress(); }} />
                <Button variant="secondary" onClick={searchByAddress} disabled={loading}>Search</Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Healthier does not provide emergency services. In a life-threatening situation call your local emergency number (112 in India) immediately.</p>
          </div>
        </ScrollReveal>

        <div className="mt-6 flex gap-2">
          <Button size="sm" variant={tab === 'results' ? 'default' : 'outline'} onClick={() => setTab('results')}>Results ({shown.length})</Button>
          <Button size="sm" variant={tab === 'shortlist' ? 'default' : 'outline'} onClick={() => setTab('shortlist')}><Bookmark className="h-3.5 w-3.5" /> Shortlist ({shortlist.length})</Button>
          {tab === 'shortlist' && shortlist.length > 0 && <Button size="sm" variant="ghost" onClick={() => setShortlist([])}><Trash2 className="h-3.5 w-3.5" /> Clear</Button>}
        </div>

        {notice && tab === 'results' && <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">{notice}</div>}
        {loading && <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Looking for care nearby...</div>}
        {!loading && tab === 'results' && places.length > 0 && shown.length === 0 && (
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">No places match these filters — try relaxing them or widening the radius.</div>
        )}
        {!loading && tab === 'results' && coords && places.length === 0 && !notice && (
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">No results in this radius — try a wider radius or a different category.</div>
        )}

        <div className="mt-4 space-y-3">
          {list.map((place, index) => (
            <div key={place.id || `${place.name}-${index}`} className="bg-card rounded-2xl p-4 border border-border shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{place.name}</h3>
                  {place.category && <p className="text-xs text-muted-foreground">{place.category}</p>}
                  <p className="text-sm text-muted-foreground mt-1 flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" /><span>{place.address}</span></p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                    {place.distanceKm !== null && <span className="text-primary font-medium">{place.distanceKm} km away</span>}
                    {place.rating !== null && <span className="flex items-center gap-1 text-muted-foreground"><Star className="h-3.5 w-3.5 text-warning" />{place.rating}{place.reviews ? ` (${place.reviews})` : ''}</span>}
                    {place.openNow !== null && <span className={place.openNow ? 'text-success' : 'text-muted-foreground'}>{place.openNow ? 'Open now' : 'Closed now'}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {place.phone && <Button size="sm" asChild><a href={`tel:${place.phone.replace(/\s/g, '')}`}><Phone className="h-3.5 w-3.5" /> Call</a></Button>}
                  <Button size="sm" variant="outline" asChild>
                    <a href={place.mapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address}`)}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /> Directions</a>
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => toggleSave(place)}>
                    {saved(place) ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />} {saved(place) ? 'Saved' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {tab === 'shortlist' && shortlist.length === 0 && <p className="text-sm text-muted-foreground">Tap "Save" on any result to keep it here for one-tap calling.</p>}
        </div>
      </div>
    </div>
  );
}
