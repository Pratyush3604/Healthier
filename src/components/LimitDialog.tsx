import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, LogIn } from 'lucide-react';
import { QUOTA_EVENT, SIGNIN_EVENT } from '@/lib/aiFetch';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

/**
 * Global, friendly replacement for raw errors when someone runs out of
 * daily/monthly uses or is not signed in yet. Mounted once in Layout.
 */
export function LimitDialog() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'quota' | 'signin' | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const onQuota = (e: Event) => {
      setMessage((e as CustomEvent).detail?.message ?? 'You have reached your plan limit for now.');
      setMode('quota');
    };
    const onSignin = () => setMode('signin');
    window.addEventListener(QUOTA_EVENT, onQuota);
    window.addEventListener(SIGNIN_EVENT, onSignin);
    return () => {
      window.removeEventListener(QUOTA_EVENT, onQuota);
      window.removeEventListener(SIGNIN_EVENT, onSignin);
    };
  }, []);

  const close = () => setMode(null);

  return (
    <Dialog open={mode !== null} onOpenChange={(o) => !o && close()}>
      <DialogContent className="sm:max-w-md">
        {mode === 'signin' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5 text-primary" /> Sign in to continue
              </DialogTitle>
              <DialogDescription>
                Create a free account to use the health tools. It takes a few seconds and your
                free daily checks start right away.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={close}>Not now</Button>
              <Button onClick={() => { close(); navigate('/auth'); }}>Sign in / Sign up</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> You have used your free checks
              </DialogTitle>
              <DialogDescription>{message}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={close}>Maybe later</Button>
              <Button onClick={() => { close(); navigate('/pricing'); }}>See plans</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
