import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, Download, Search, RefreshCw, Trash2, ChevronDown, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { computeAge, computeBmi } from '@/components/ProfileForm';

type AdminUser = {
  id: string;
  email: string | null;
  phone: string | null;
  provider: string;
  email_confirmed: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  full_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  blood_group: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  medications: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  city: string | null;
  country: string | null;
  preferred_language: string | null;
  last_seen_at: string | null;
  roles: string[];
};

const fmt = (value: string | null) => (value ? new Date(value).toLocaleString() : '—');

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-list-users', { body: { action: 'list' } });
      if (error) throw error;
      setUsers((data?.users ?? []) as AdminUser[]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not load users.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.email, u.full_name, u.phone, u.city, u.country, u.blood_group].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [users, query]);

  const act = async (action: string, payload: Record<string, unknown>, successMsg: string) => {
    setBusy(String(payload.user_id));
    try {
      const { data, error } = await supabase.functions.invoke('admin-list-users', { body: { action, ...payload } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: successMsg });
      await load();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Action failed.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const exportCsv = () => {
    const cols: (keyof AdminUser)[] = [
      'full_name', 'email', 'phone', 'gender', 'date_of_birth', 'blood_group', 'height_cm', 'weight_kg',
      'city', 'country', 'provider', 'email_confirmed', 'created_at', 'last_sign_in_at', 'last_seen_at',
      'allergies', 'chronic_conditions', 'medications', 'emergency_contact_name', 'emergency_contact_phone',
    ];
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [cols.join(','), ...filtered.map((u) => cols.map((c) => escape(u[c])).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthier-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">User directory</h1>
            <p className="text-muted-foreground">{users.length} accounts. Passwords are hashed and never viewable.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, email, phone, city…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
          </div>
          <Button variant="outline" onClick={() => void load()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
          <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-2">
            {filtered.map((u) => {
              const open = expanded === u.id;
              return (
                <div key={u.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <button onClick={() => setExpanded(open ? null : u.id)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                      {(u.full_name || u.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{u.full_name || 'Unnamed'}</p>
                      <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="hidden md:block text-xs text-muted-foreground text-right">
                      <p>Joined {new Date(u.created_at).toLocaleDateString()}</p>
                      <p>{u.provider}{u.email_confirmed ? ' · verified' : ' · unverified'}</p>
                    </div>
                    {u.roles.includes('admin') && <ShieldCheck className="h-4 w-4 text-primary" />}
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>

                  {open && (
                    <div className="border-t border-border p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      {[
                        ['Phone', u.phone], ['Gender', u.gender],
                        ['Age', computeAge(u.date_of_birth)?.toString() ?? null],
                        ['Date of birth', u.date_of_birth], ['Blood group', u.blood_group],
                        ['Height (cm)', u.height_cm?.toString() ?? null], ['Weight (kg)', u.weight_kg?.toString() ?? null],
                        ['BMI', computeBmi(u.height_cm, u.weight_kg)?.toString() ?? null],
                        ['City', u.city], ['Country', u.country], ['Language', u.preferred_language],
                        ['Allergies', u.allergies], ['Conditions', u.chronic_conditions], ['Medications', u.medications],
                        ['Emergency contact', u.emergency_contact_name], ['Emergency phone', u.emergency_contact_phone],
                        ['Last sign-in', fmt(u.last_sign_in_at)], ['Last seen', fmt(u.last_seen_at)],
                        ['Roles', u.roles.join(', ') || 'user'],
                      ].map(([label, value]) => (
                        <div key={String(label)}>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="font-medium break-words">{value || '—'}</p>
                        </div>
                      ))}

                      <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-2 pt-2 border-t border-border">
                        {u.roles.includes('admin') && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-primary px-2 py-1 rounded-md bg-primary/10">
                            <ShieldCheck className="h-3.5 w-3.5" /> Owner account
                          </span>
                        )}
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          disabled={busy === u.id}
                          onClick={() => {
                            if (window.confirm(`Permanently delete ${u.email}? This cannot be undone.`)) {
                              void act('delete_user', { user_id: u.id }, 'Account deleted');
                            }
                          }}>
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete account
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No users match that search.</p>}
          </div>
        )}
      </motion.div>
    </div>
  );
}
