import { useEffect, useState } from 'react';
import { Check, Crown, Sparkles, Heart, Loader2, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PLAN_PRICES, PlanId, activeTier, upiLink, TIER_LABEL } from '@/lib/plans';
import { PlanBadge } from '@/components/PlanBadge';

type Req = { id: string; plan: string; amount_inr: number; utr_number: string; status: string; created_at: string };

const TIERS = [
  {
    key: 'free', name: 'Free', icon: Heart, monthly: 0, yearly: 0,
    perks: ['1 use of each AI tool per day', 'Vitals, BMI, first aid & tips', 'Care Near Me search', 'Emergency numbers'],
  },
  {
    key: 'pro', name: 'Healthier Pro', icon: Sparkles, monthly: 100, yearly: 1000,
    perks: ['100 AI uses per month, all tools combined', 'Everything in Free', 'Downloadable PDF reports', 'Teal Pro badge'],
  },
  {
    key: 'pro_max', name: 'Healthier Pro Max', icon: Crown, monthly: 500, yearly: 5000,
    perks: ['Unlimited AI uses', 'Everything in Pro', 'Priority support', 'Gold Pro Max VIP badge'],
  },
] as const;

export default function PricingPage() {
  const { user, profile, isAdmin } = useAuth();
  const { toast } = useToast();
  const [yearly, setYearly] = useState(false);
  const [upiId, setUpiId] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanId | null>(null);
  const [utr, setUtr] = useState('');
  const [sending, setSending] = useState(false);
  const [requests, setRequests] = useState<Req[]>([]);
  const current = activeTier(profile, isAdmin);

  const loadRequests = async () => {
    if (!user) return;
    const { data } = await supabase.from('payment_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setRequests((data as Req[]) ?? []);
  };

  useEffect(() => {
    void supabase.from('app_settings').select('value').eq('key', 'upi_id').maybeSingle()
      .then(({ data }) => setUpiId(data?.value?.trim() || null));
    void loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const submit = async () => {
    if (!plan || !user) return;
    if (!/^\d{12}$/.test(utr.trim())) {
      toast({ title: 'Check the reference number', description: 'The UPI reference (UTR) is 12 digits.', variant: 'destructive' });
      return;
    }
    setSending(true);
    const { error } = await supabase.from('payment_requests').insert({ user_id: user.id, plan, amount_inr: PLAN_PRICES[plan].amount, utr_number: utr.trim() });
    setSending(false);
    if (error) {
      toast({ title: 'Could not submit', description: error.message.includes('duplicate') ? 'This reference number was already submitted.' : error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Payment submitted', description: 'Your plan activates as soon as the payment is verified.' });
    setPlan(null); setUtr('');
    void loadRequests();
  };

  const info = plan ? PLAN_PRICES[plan] : null;

  return (
    <div className="container mx-auto px-4 py-10 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Choose your plan</h1>
          <p className="text-muted-foreground">Your current plan: <PlanBadge /></p>
          <div className="inline-flex mt-5 rounded-full border border-border p-1 bg-card">
            <button onClick={() => setYearly(false)} className={`px-4 py-1.5 rounded-full text-sm ${!yearly ? 'bg-primary text-primary-foreground' : ''}`}>Monthly</button>
            <button onClick={() => setYearly(true)} className={`px-4 py-1.5 rounded-full text-sm ${yearly ? 'bg-primary text-primary-foreground' : ''}`}>Yearly · save 2 months</button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {TIERS.map((t) => {
            const Icon = t.icon;
            const price = yearly ? t.yearly : t.monthly;
            const isCurrent = current === t.key;
            const planId = (t.key === 'pro' ? (yearly ? 'pro_yearly' : 'pro_monthly') : (yearly ? 'pro_max_yearly' : 'pro_max_monthly')) as PlanId;
            return (
              <div key={t.key} className={`bg-card rounded-2xl border p-6 shadow-soft flex flex-col ${t.key === 'pro_max' ? 'border-warning' : t.key === 'pro' ? 'border-primary' : 'border-border'}`}>
                <Icon className={`h-8 w-8 mb-3 ${t.key === 'pro_max' ? 'text-warning' : 'text-primary'}`} />
                <h2 className="text-xl font-bold">{t.name}</h2>
                <p className="text-3xl font-bold mt-2">₹{price.toLocaleString('en-IN')}<span className="text-sm font-normal text-muted-foreground">{t.key === 'free' ? '' : yearly ? ' / year' : ' / month'}</span></p>
                <ul className="mt-4 space-y-2 flex-1">
                  {t.perks.map((p) => <li key={p} className="flex gap-2 text-sm"><Check className="h-4 w-4 text-success shrink-0 mt-0.5" />{p}</li>)}
                </ul>
                <Button className="mt-6" disabled={isCurrent || t.key === 'free'} variant={t.key === 'free' ? 'outline' : 'default'} onClick={() => setPlan(planId)}>
                  {isCurrent ? 'Current plan' : t.key === 'free' ? 'Included' : `Get ${TIER_LABEL[t.key]}`}
                </Button>
              </div>
            );
          })}
        </div>

        {requests.length > 0 && (
          <div className="mt-10 bg-card rounded-2xl border border-border p-5">
            <h3 className="font-semibold mb-3">Your payments</h3>
            <div className="space-y-2 text-sm">
              {requests.map((r) => (
                <div key={r.id} className="flex flex-wrap justify-between gap-2 border-b border-border pb-2">
                  <span>{PLAN_PRICES[r.plan as PlanId]?.label} · ₹{r.amount_inr}</span>
                  <span className="text-muted-foreground">Ref {r.utr_number}</span>
                  <span className={r.status === 'approved' ? 'text-success' : r.status === 'rejected' ? 'text-destructive' : 'text-warning'}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-8">Healthier gives general health information only — not diagnosis, prescriptions or emergency care. Payments are made by UPI directly to the owner and verified manually.</p>
      </div>

      <Dialog open={!!plan} onOpenChange={(o) => !o && setPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{info?.label}</DialogTitle>
            <DialogDescription>Pay ₹{info?.amount.toLocaleString('en-IN')} with Google Pay or any UPI app.</DialogDescription>
          </DialogHeader>
          {!upiId ? (
            <div className="rounded-xl bg-muted/50 p-4 text-sm">Google Pay payments open shortly. Please check back soon.</div>
          ) : info && (
            <div className="space-y-4">
              <div className="flex justify-center bg-background p-4 rounded-xl">
                <QRCodeSVG value={upiLink(upiId, info.amount, info.label)} size={200} />
              </div>
              <p className="text-center text-xs text-muted-foreground">Scan with Google Pay, or on your phone tap below. UPI ID: <b>{upiId}</b></p>
              <Button asChild className="w-full"><a href={upiLink(upiId, info.amount, info.label)}><Smartphone className="h-4 w-4" /> Pay with Google Pay</a></Button>
              <div>
                <label className="text-sm font-medium">After paying, enter the 12-digit UPI reference (UTR)</label>
                <Input inputMode="numeric" maxLength={12} value={utr} onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 412345678901" className="mt-1" />
              </div>
              <Button onClick={submit} disabled={sending} variant="secondary" className="w-full">
                {sending && <Loader2 className="h-4 w-4 animate-spin" />} Submit for verification
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
