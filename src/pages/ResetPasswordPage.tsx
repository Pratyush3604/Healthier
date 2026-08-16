import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { HealtifyLogo } from '@/components/HealtifyLogo';
import { PasswordField, PasswordStrength, passwordScore } from '@/components/PasswordField';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordScore(password) < 4) {
      toast({ title: 'Password too weak', description: 'Please satisfy at least 4 of the 5 rules.', variant: 'destructive' });
      return;
    }
    if (password !== confirm) {
      toast({ title: 'Passwords do not match', description: 'Re-enter the same password twice.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: 'Password updated', description: 'You can now use your new password.' });
      navigate('/dashboard');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not update the password.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><HealtifyLogo size={56} /></div>
          <h1 className="font-display text-3xl font-bold mb-2">Set a new password</h1>
          <p className="text-muted-foreground">Choose a strong password for your Healthier account.</p>
        </div>
        <div className="glass-card rounded-2xl p-8">
          {!ready ? (
            <p className="text-sm text-muted-foreground text-center">
              Open this page from the reset link in your email. If the link expired, request a new one from the sign-in page.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="new-password">New password</Label>
                <PasswordField id="new-password" value={password} onChange={setPassword} autoComplete="new-password" />
                <PasswordStrength value={password} />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm password</Label>
                <PasswordField id="confirm-password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShieldCheck className="mr-2 h-4 w-4" /> Update password</>}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
