import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserCog } from 'lucide-react';
import { ProfileWizard } from '@/components/ProfileWizard';

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
            <h1 className="text-3xl font-bold">Finish setting up</h1>
            <p className="text-muted-foreground">
              All of this is optional, but each detail makes your AI health insights far more accurate.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border">
          <ProfileWizard onDone={() => navigate(next, { replace: true })} />
        </div>
      </motion.div>
    </div>
  );
}
