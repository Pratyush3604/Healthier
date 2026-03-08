import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Home, Stethoscope, Activity, 
  Camera, FileText, MessageCircle, Mic, BookOpen,
  Phone, Lightbulb, User, Search, Pill, Dumbbell,
  Moon, Apple, Scan, Calculator, LogIn, LogOut,
  Droplets, LayoutDashboard, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HealtifyLogo } from './HealtifyLogo';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/symptoms', label: 'Symptoms', icon: Stethoscope },
  { path: '/vitals', label: 'Vitals', icon: Activity },
  { path: '/injury', label: 'Injury', icon: Camera },
  { path: '/skin-analyzer', label: 'Skin AI', icon: Scan },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/chat', label: 'Chat', icon: MessageCircle },
];

const moreItems = [
  { path: '/ai-doctor', label: 'AI Doctor', icon: Mic },
  { path: '/diet-planner', label: 'Diet Plan', icon: Apple },
  { path: '/workout-planner', label: 'Workout', icon: Dumbbell },
  { path: '/exercise-library', label: 'Exercises', icon: Dumbbell },
  { path: '/sleep-analysis', label: 'Sleep', icon: Moon },
  { path: '/medicine-info', label: 'Medicine', icon: Pill },
  { path: '/bmi-calculator', label: 'BMI Calc', icon: Calculator },
  { path: '/water-tracker', label: 'Water', icon: Droplets },
  { path: '/medication-reminder', label: 'Med Reminders', icon: Pill },
  { path: '/health-journal', label: 'Journal', icon: BookOpen },
  { path: '/health-reports', label: 'Reports Hub', icon: FileText },
  { path: '/first-aid', label: 'First Aid', icon: BookOpen },
  { path: '/health-tips', label: 'Tips', icon: Lightbulb },
  { path: '/emergency', label: 'Emergency', icon: Phone },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/about', label: 'About', icon: User },
];

const allNav = [...navItems, ...moreItems];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const filteredNav = searchTerm
    ? allNav.filter(i => i.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <HealtifyLogo size={40} />
            </motion.div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg gradient-text">Healtify</span>
              <span className="text-xs text-muted-foreground block -mt-1">AI Health Assistant</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}
                  className={cn("relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}>
                  <Icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="activeTab" className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                  )}
                </Link>
              );
            })}
            <div className="relative group">
              <button className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                More
              </button>
              <div className="absolute top-full right-0 mt-2 py-2 w-48 glass-card rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                      <Icon className="w-4 h-4" />{item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            {/* Auth button */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden xl:inline">Dashboard</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                <LogIn className="w-4 h-4" /><span className="hidden xl:inline">Login</span>
              </Link>
            )}

            {/* Search */}
            <div className="relative">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Search className="w-5 h-5 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-72 glass-card rounded-xl p-3 z-50">
                    <Input placeholder="Search features..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      className="bg-white/5 border-white/10 text-sm" autoFocus />
                    {filteredNav.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {filteredNav.map(item => {
                          const Icon = item.icon;
                          return (
                            <Link key={item.path} to={item.path} onClick={() => { setSearchOpen(false); setSearchTerm(''); }}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors">
                              <Icon className="w-4 h-4 text-primary" />{item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-white/5">
            <nav className="container mx-auto px-4 py-4 grid grid-cols-4 gap-2">
              {allNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)}
                    className={cn("flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all",
                      isActive ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-white/5"
                    )}>
                    <Icon className="w-5 h-5" />{item.label}
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
