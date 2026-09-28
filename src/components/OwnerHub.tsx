import { useEffect, useMemo, useState } from 'react';
import { Check, X, IndianRupee, Users, Activity, Save, Loader2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PLAN_PRICES, PlanId } from '@/lib/plans';

type Req = { id: string; user_id: string; plan: string; amount_inr: number; utr_number: string; status: string; created_at: string };
type Prof = { user_id: string; full_name: string | null; email: string | null; tier: string; tier_expires_at: string | null; bonus_uses: number };

export function OwnerHub() {
  const { toast } = useToast();
  const [upi, setUpi] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [reqs, setReqs] = useState<Req[]>([]);
  const [profiles, setProfiles] = useState<Prof[]>([]);
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [totalUses, setTotalUses] = useState(0);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');

  const load = async () => {
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const [s, r, p, u] = await Promise.all([
      supabase.from('app_settings').select('key,value'),
      supabase.from('payment_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('user_id,full_name,email,tier,tier_expires_at,bonus_uses'),
      supabase.from('ai_usage').select('user_id').gte('created_at', monthStart.toISOString()).limit(10000),
    ]);
    const map = Object.fromEntries((s.data ?? []).map((x) => [x.key, x.value ?? '']));
    setUpi(map.upi_id ?? ''); setAnnouncement(map.announcement ?? '');
    setReqs((r.data as Req[]) ?? []);
    setProfiles((p.data as Prof[]) ?? []);
    const counts: Record<string, number> = {};
    (u.data ?? []).forEach((x: { user_id: string }) => { counts[x.user_id] = (counts[x.user_id] ?? 0) + 1; });
    setUsage(counts); setTotalUses(u.data?.length ?? 0);
  };
  useEffect(() => { void load(); }, []);

  const byId = useMemo(() => Object.fromEntries(profiles.map((p) => [p.user_id, p])), [profiles]);
  const revenue = reqs.filter((r) => r.status === 'approved').reduce((a, r) => a + r.amount_inr, 0);
  const monthStart = new Date(); monthStart.setDate(1);
  const revenueMonth = reqs.filter((r) => r.status === 'approved' && new Date(r.created_at) >= monthStart).reduce((a, r) => a + r.amount_inr, 0);
  const count = (t: string) => profiles.filter((p) => (p.tier ?? 'free') === t && (!p.tier_expires_at || new Date(p.tier_expires_at) > new Date())).length;

  const saveSettings = async () => {
    setBusy(true);
    const { error } = await supabase.from('app_settings').upsert([
      { key: 'upi_id', value: upi.trim(), updated_at: new Date().toISOString() },
      { key: 'announcement', value: announcement.trim(), updated_at: new Date().toISOString() },
    ]);
    setBusy(false);
    toast(error ? { title: 'Save failed', description: error.message, variant: 'destructive' } : { title: 'Settings saved' });
  };

  const setTier = async (userId: string, tier: string, days: number | null) => {
    const expires = days ? new Date(Date.now() + days * 86400000).toISOString() : null;
    const { error } = await supabase.from('profiles').update({ tier, tier_expires_at: tier === 'free' ? null : expires }).eq('user_id', userId);
    if (error) toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    return !error;
  };

  const review = async (r: Req, approve: boolean) => {
    if (approve) {
      const info = PLAN_PRICES[r.plan as PlanId];
      if (!(await setTier(r.user_id, info.tier, info.days))) return;
    }
    await supabase.from('payment_requests').update({ status: approve ? 'approved' : 'rejected', reviewed_at: new Date().toISOString() }).eq('id', r.id);
    toast({ title: approve ? 'Approved — plan activated' : 'Rejected' });
    void load();
  };

  const addBonus = async (p: Prof, n: number) => {
    const { error } = await supabase.from('profiles').update({ bonus_uses: Math.max(0, (p.bonus_uses ?? 0) + n) }).eq('user_id', p.user_id);
    if (error) toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    void load();
  };

  const pending = reqs.filter((r) => r.status === 'pending');
  const shown = profiles.filter((p) => `${p.full_name} ${p.email}`.toLowerCase().includes(filter.toLowerCase()));

  const Stat = ({ icon: I, label, value }: { icon: typeof Users; label: string; value: string | number }) => (
    <div className="bg-card rounded-xl border border-border p-4"><I className="h-4 w-4 text-primary mb-1" /><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold">{value}</p></div>
  );

  return (
    <div className="space-y-6 mb-10">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Stat icon={IndianRupee} label="Total revenue" value={`₹${revenue.toLocaleString('en-IN')}`} />
        <Stat icon={IndianRupee} label="This month" value={`₹${revenueMonth.toLocaleString('en-IN')}`} />
        <Stat icon={Users} label="Free" value={profiles.length - count('pro') - count('pro_max')} />
        <Stat icon={Users} label="Pro" value={count('pro')} />
        <Stat icon={Crown} label="Pro Max" value={count('pro_max')} />
        <Stat icon={Activity} label="AI uses this month" value={totalUses} />
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
        <h2 className="font-semibold text-lg">Owner payment settings</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div><label className="text-sm">Google Pay UPI ID (payments go here)</label><Input value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="yourname@okaxis" /></div>
          <div><label className="text-sm">Announcement banner (empty = hidden)</label><Input value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="New feature launched!" /></div>
        </div>
        <Button onClick={saveSettings} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>
        {!upi && <p className="text-xs text-warning">No UPI ID yet — customers see "payments open shortly" until you add it.</p>}
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="font-semibold text-lg mb-3">Payment verification queue ({pending.length})</h2>
        <p className="text-xs text-muted-foreground mb-3">Check that each reference number appears in your Google Pay history for the right amount before approving.</p>
        {reqs.length === 0 ? <p className="text-sm text-muted-foreground">No payments yet.</p> : (
          <div className="space-y-2">
            {reqs.slice(0, 50).map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 text-sm border-b border-border pb-2">
                <span className="flex-1 min-w-[180px]">{byId[r.user_id]?.full_name || byId[r.user_id]?.email || r.user_id.slice(0, 8)}</span>
                <span>{PLAN_PRICES[r.plan as PlanId]?.label}</span>
                <span className="font-semibold">₹{r.amount_inr}</span>
                <span className="font-mono">{r.utr_number}</span>
                <span className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                {r.status === 'pending' ? (
                  <>
                    <Button size="sm" onClick={() => void review(r, true)}><Check className="h-3.5 w-3.5" /> Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => void review(r, false)}><X className="h-3.5 w-3.5" /> Reject</Button>
                  </>
                ) : <span className={r.status === 'approved' ? 'text-success' : 'text-destructive'}>{r.status}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="font-semibold text-lg mb-3">Plans & usage per user</h2>
        <Input placeholder="Filter by name or email" value={filter} onChange={(e) => setFilter(e.target.value)} className="mb-3" />
        <div className="space-y-2 max-h-[420px] overflow-auto">
          {shown.map((p) => (
            <div key={p.user_id} className="flex flex-wrap items-center gap-2 text-sm border-b border-border pb-2">
              <span className="flex-1 min-w-[180px]">{p.full_name || p.email}</span>
              <span className="text-muted-foreground">{usage[p.user_id] ?? 0} uses{p.tier === 'pro' ? ` / ${100 + (p.bonus_uses ?? 0)}` : ''} · +{p.bonus_uses ?? 0} bonus</span>
              <select className="bg-background border border-border rounded-md px-2 py-1" value={p.tier ?? 'free'}
                onChange={async (e) => { if (await setTier(p.user_id, e.target.value, 30)) { toast({ title: 'Plan updated (30 days)' }); void load(); } }}>
                <option value="free">Free</option><option value="pro">Pro</option><option value="pro_max">Pro Max</option>
              </select>
              <Button size="sm" variant="outline" onClick={() => void addBonus(p, 10)}>+10 uses</Button>
              {p.tier_expires_at && <span className="text-xs text-muted-foreground">until {new Date(p.tier_expires_at).toLocaleDateString()}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
