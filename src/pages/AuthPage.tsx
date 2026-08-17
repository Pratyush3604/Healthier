import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, User, Loader2, ArrowRight, Chrome, MailCheck, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { HealtifyLogo } from '@/components/HealtifyLogo';
import { PasswordField, PasswordStrength, passwordScore } from '@/components/PasswordField';

type Mode = 'login' | 'signup' | 'forgot';

const friendlyError = (message: string) => {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'That email and password combination is not correct.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first — check your inbox for the link.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'An account with this email already exists. Try signing in instead.';
  if (m.includes('pwned') || m.includes('weak')) return 'This password appears in known data breaches. Please choose a different one.';
  if (m.includes('rate limit')) return 'Too many attempts. Please wait a minute and try again.';
  return message;
};

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState<null | 'confirm' | 'reset'>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawNext = searchParams.get('next');
  const nextPath = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : null;

  useEffect(() => {
    const go = () => navigate(nextPath ?? '/dashboard', { replace: true });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) go();
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) go(); });
    return () => subscription.unsubscribe();
  }, [navigate, nextPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot') {
      if (!email) {
        toast({ title: 'Email required', description: 'Enter the email you signed up with.', variant: 'destructive' });
        return;
      }
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSentEmail('reset');
      } catch (error: unknown) {
        const message = error instanceof Error ? friendlyError(error.message) : 'Could not send the reset email.';
        toast({ title: 'Error', description: message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!email || !password) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
        navigate(nextPath ?? '/dashboard', { replace: true });
      } else {
        if (!fullName.trim()) {
          toast({ title: 'Name required', description: 'Please enter your full name.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        if (passwordScore(password) < 4) {
          toast({ title: 'Password too weak', description: 'Please satisfy at least 4 of the 5 password rules.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        const redirectSuffix = `/complete-profile${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''}`;
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim(), phone: phone.trim() },
            emailRedirectTo: window.location.origin + redirectSuffix,
          },
        });
        if (error) throw error;
        if (data.session) {
          navigate(redirectSuffix, { replace: true });
        } else {
          setSentEmail('confirm');
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? friendlyError(error.message) : 'Something went wrong.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      setIsLoading(false);
    }
  };

  if (sentEmail) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center glass-card rounded-2xl p-8">
          <MailCheck className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Check your inbox</h1>
          <p className="text-muted-foreground mb-6">
            {sentEmail === 'confirm'
              ? `We sent a confirmation link to ${email}. Click it to activate your Healthier account.`
              : `We sent a password reset link to ${email}. Open it to choose a new password.`}
          </p>
          <Button variant="outline" onClick={() => { setSentEmail(null); setMode('login'); }}>Back to sign in</Button>
        </motion.div>
      </div>
    );
  }

  const titles: Record<Mode, string> = {
    login: 'Welcome Back',
    signup: 'Create Account',
    forgot: 'Reset your password',
  };
  const subtitles: Record<Mode, string> = {
    login: 'Sign in to access your health data',
    signup: 'Join Healthier for personalized health insights',
    forgot: 'We will email you a secure reset link',
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><HealtifyLogo size={56} /></div>
          <h1 className="font-display text-3xl font-bold mb-2">{titles[mode]}</h1>
          <p className="text-muted-foreground">{subtitles[mode]}</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {mode !== 'forgot' && (
            <>
              <Button variant="outline" className="w-full mb-4" size="lg" onClick={handleGoogleSignIn} disabled={isLoading}>
                <Chrome className="mr-2 h-5 w-5" /> Continue with Google
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" maxLength={120} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone number <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" maxLength={30} />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" maxLength={255} autoComplete="email" />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <PasswordField id="password" value={password} onChange={setPassword} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                {mode === 'signup' && <PasswordStrength value={password} />}
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full" size="lg">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send reset link'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === 'forgot' ? (
              <button onClick={() => setMode('login')} className="text-sm text-primary hover:underline">Back to sign in</button>
            ) : (
              <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-sm text-primary hover:underline">
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            )}
            <p className="text-xs text-muted-foreground">
              An account is required to use the health tools. Read more <Link to="/about" className="text-primary hover:underline">about Healthier</Link>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
