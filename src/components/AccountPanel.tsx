import { useState } from 'react';
import { KeyRound, Mail, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ProfileForm } from '@/components/ProfileForm';
import { PasswordField, passwordScore } from '@/components/PasswordField';

export function AccountPanel() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const changePassword = async () => {
    if (!user?.email) return;
    if (passwordScore(newPassword) < 4) {
      toast({ title: 'Password too weak', description: 'Use 8+ characters with upper, lower, number and symbol.', variant: 'destructive' });
      return;
    }
    setSavingPassword(true);
    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (reauthError) throw new Error('Your current password is incorrect.');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: 'Password updated' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: unknown) {
      toast({
        title: 'Could not update password',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const changeEmail = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast({ title: 'Enter a valid email address', variant: 'destructive' });
      return;
    }
    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: window.location.origin },
      );
      if (error) throw error;
      toast({ title: 'Check your inbox', description: 'Confirm the change from the email we just sent.' });
      setNewEmail('');
    } catch (error: unknown) {
      toast({
        title: 'Could not change email',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingEmail(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-own-account', { body: {} });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await signOut();
      toast({ title: 'Account deleted', description: 'Your account and data have been removed.' });
      window.location.href = '/';
    } catch (error: unknown) {
      toast({
        title: 'Could not delete account',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" /> Health profile
        </h3>
        <ProfileForm submitLabel="Save changes" />
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary" /> Change password
        </h3>
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 block">Current password</Label>
            <PasswordField value={currentPassword} onChange={setCurrentPassword} placeholder="Current password" showStrength={false} />
          </div>
          <div>
            <Label className="mb-1.5 block">New password</Label>
            <PasswordField value={newPassword} onChange={setNewPassword} placeholder="New password" />
          </div>
          <Button onClick={() => void changePassword()} disabled={savingPassword || !currentPassword || !newPassword}>
            {savingPassword ? 'Updating…' : 'Update password'}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" /> Change email
        </h3>
        <p className="text-sm text-muted-foreground">Currently {user?.email}. We'll email a confirmation link to the new address.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@email.com" type="email" />
          <Button variant="outline" onClick={() => void changeEmail()} disabled={savingEmail || !newEmail}>
            {savingEmail ? 'Sending…' : 'Send confirmation'}
          </Button>
        </div>
      </div>

      <div className="bg-destructive/5 rounded-2xl p-6 border border-destructive/20 space-y-3">
        <h3 className="font-semibold text-lg text-destructive flex items-center gap-2">
          <Trash2 className="w-5 h-5" /> Delete account
        </h3>
        <p className="text-sm text-muted-foreground">
          This permanently removes your account and health profile. Type DELETE to confirm.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
          <Button
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            disabled={confirmText !== 'DELETE' || deleting}
            onClick={() => void deleteAccount()}
          >
            {deleting ? 'Deleting…' : 'Delete my account'}
          </Button>
        </div>
      </div>
    </div>
  );
}
