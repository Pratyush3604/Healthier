import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Menu, X, Home, Stethoscope, Activity, 
  Camera, FileText, MessageCircle, Mic, BookOpen,
  Phone, Lightbulb, User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/symptoms', label: 'Symptoms', icon: Stethoscope },
  { path: '/vitals', label: 'Vitals', icon: Activity },
  { path: '/injury', label: 'Injury', icon: Camera },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/chat', label: 'Chat', icon: MessageCircle },
  { path: '/ai-doctor', label: 'AI Doctor', icon: Mic },
  { path: '/first-aid', label: 'First Aid', icon: BookOpen },
  { path: '/health-tips', label: 'Tips', icon: Lightbulb },
  { path: '/emergency', label: 'Emergency', icon: Phone },
  { path: '/about', label: 'About', icon: User },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
                <Heart className="w-5 h-5 text-primary-foreground animate-heartbeat" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg gradient-text">Mediredy</span>
              <span className="text-xs text-muted-foreground block -mt-1">AI Doctor</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 8).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
            
            {/* More dropdown for remaining items */}
            <div className="relative group">
              <button className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                More
              </button>
              <div className="absolute top-full right-0 mt-2 py-2 w-48 glass-card rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                {navItems.slice(8).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-white/5"
          >
            <nav className="container mx-auto px-4 py-4 grid grid-cols-3 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all",
                      isActive 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "text-muted-foreground hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
