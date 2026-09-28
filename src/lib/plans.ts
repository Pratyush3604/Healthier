import type { Profile } from '@/hooks/useAuth';

export type Tier = 'free' | 'pro' | 'pro_max';
export type PlanId = 'pro_monthly' | 'pro_yearly' | 'pro_max_monthly' | 'pro_max_yearly';

export const PLAN_PRICES: Record<PlanId, { tier: Tier; amount: number; label: string; days: number }> = {
  pro_monthly: { tier: 'pro', amount: 100, label: 'Healthier Pro · Monthly', days: 30 },
  pro_yearly: { tier: 'pro', amount: 1000, label: 'Healthier Pro · Yearly', days: 365 },
  pro_max_monthly: { tier: 'pro_max', amount: 500, label: 'Healthier Pro Max · Monthly', days: 30 },
  pro_max_yearly: { tier: 'pro_max', amount: 5000, label: 'Healthier Pro Max · Yearly', days: 365 },
};

export const TIER_LABEL: Record<Tier, string> = { free: 'Free', pro: 'Pro', pro_max: 'Pro Max' };

export function activeTier(profile: Profile | null, isAdmin = false): Tier {
  if (isAdmin) return 'pro_max';
  if (!profile?.tier) return 'free';
  if (profile.tier_expires_at && new Date(profile.tier_expires_at).getTime() < Date.now()) return 'free';
  return (profile.tier as Tier) ?? 'free';
}

export function upiLink(upiId: string, amount: number, note: string) {
  const p = new URLSearchParams({ pa: upiId, pn: 'Healthier', am: String(amount), cu: 'INR', tn: note });
  return `upi://pay?${p.toString()}`;
}
