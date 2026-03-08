import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  showEmergency?: boolean;
  gradient?: string;
}

export function PageHeader({ icon, title, description, showEmergency = true, gradient = 'from-primary to-secondary' }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-glow`}>
        {icon}
      </div>
      <div className="flex items-center justify-center gap-3">
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        {showEmergency && (
          <Link
            to="/emergency"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors"
          >
            <Phone className="w-3 h-3" />
            Emergency?
          </Link>
        )}
      </div>
      <p className="text-muted-foreground mt-2">{description}</p>
    </motion.div>
  );
}
