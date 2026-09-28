import { Crown, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { activeTier } from '@/lib/plans';

export function PlanBadge() {
  const { profile, isAdmin } = useAuth();
  const tier = activeTier(profile, isAdmin);
  if (isAdmin) return <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 text-warning px-2 py-0.5 text-xs font-semibold"><Crown className="h-3 w-3" /> Owner</span>;
  if (tier === 'pro_max') return <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 text-warning px-2 py-0.5 text-xs font-semibold shadow-[0_0_12px_hsl(var(--warning)/0.5)]"><Crown className="h-3 w-3" /> Pro Max</span>;
  if (tier === 'pro') return <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-xs font-semibold"><Sparkles className="h-3 w-3" /> Pro</span>;
  return <span className="inline-flex rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs">Free</span>;
}
