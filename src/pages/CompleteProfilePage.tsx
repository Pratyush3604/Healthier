import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileForm } from '@/components/ProfileForm';

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const raw = params.get('next');
  const next = raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/dashboard';

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
            <UserCog className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Complete your profile</h1>
            <p className="text-muted-foreground">These details make every AI health insight far more accurate.</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <ProfileForm submitLabel="Save and continue" onSaved={() => navigate(next)} />
          <Button variant="ghost" className="mt-4" onClick={() => navigate(next)}>Skip for now</Button>
        </div>
      </motion.div>
    </div>
  );
}
