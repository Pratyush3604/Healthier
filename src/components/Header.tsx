import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Home, Stethoscope, Activity,
  FileText, MessageCircle, BookOpen,
  Phone, Lightbulb, Search, Pill, Dumbbell,
  Apple, Scan, Calculator, LogIn, LogOut,
  LayoutDashboard, Settings, TrendingUp,
  Monitor, ClipboardList, User, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HealtifyLogo } from './HealtifyLogo';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/symptoms', label: 'Symptoms', icon: Stethoscope },
  { path: '/skin-injury', label: 'Skin & Injury', icon: Scan },
  { path: '/chat', label: 'Chat', icon: MessageCircle },
  { path: '/fitness', label: 'Fitness', icon: Dumbbell },
  { path: '/medicine-info', label: 'Medicine', icon: Pill },
];

const moreItems = [
  { path: '/vitals', label: 'Vitals', icon: Activity },
  { path: '/reports', label: 'Report Analysis', icon: FileText },
  { path: '/bmi-calculator', label: 'Health Calculator', icon: Calculator },
  { path: '/medication-reminder', label: 'Med Reminders', icon: ClipboardList },
  { path: '/health-reports', label: 'Reports Hub', icon: TrendingUp },
  { path: '/posture-corrector', label: 'Posture', icon: Monitor },
  { path: '/first-aid', label: 'First Aid', icon: BookOpen },
  { path: '/health-tips', label: 'Health Tips', icon: Lightbulb },
  { path: '/emergency', label: 'Emergency', icon: Phone },
  { path: '/how-to-use', label: 'How to Use', icon: HelpCircle },
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
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
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5 group">
            <HealtifyLogo size={32} />
            <div className="hidden sm:block">
              <span className="font-display font-bold text-sm gradient-text">Healthier</span>
              <span className="text-[10px] text-muted-foreground block -mt-0.5">AI Health Assistant</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((navItem) => {
              const Icon = navItem.icon;
              const isActive = location.pathname === navItem.path;
              return (
                <Link key={navItem.path} to={navItem.path}
                  className={cn("relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{navItem.label}</span>
                  {isActive && (
                    <motion.div layoutId="activeNav" className="absolute inset-0 bg-primary/8 border border-primary/15 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />
                  )}
                </Link>
              );
            })}

            <div className="relative group">
              <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
                More
              </button>
              <div className="absolute top-full right-0 mt-1.5 py-1.5 w-48 max-h-[70vh] overflow-y-auto bg-card border border-border rounded-xl shadow-elevated opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {moreItems.map((navItem) => {
                  const Icon = navItem.icon;
                  return (
                    <Link key={navItem.path} to={navItem.path}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                      <Icon className="w-3.5 h-3.5" />{navItem.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-1.5">
            {user ? (
              <div className="hidden sm:flex items-center gap-1">
                <Link to="/dashboard" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-all">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-all">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
                <LogIn className="w-3.5 h-3.5" /><span>Login</span>
              </Link>
            )}

            <div className="relative">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Search className="w-4 h-4 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-elevated p-2.5 z-50">
                    <Input placeholder="Search features..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      className="h-9 text-sm bg-muted/50" autoFocus />
                    {filteredNav.length > 0 && (
                      <div className="mt-1.5 space-y-0.5 max-h-64 overflow-y-auto">
                        {filteredNav.slice(0, 10).map(navItem => {
                          const Icon = navItem.icon;
                          return (
                            <Link key={navItem.path} to={navItem.path} onClick={() => { setSearchOpen(false); setSearchTerm(''); }}
                              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors">
                              <Icon className="w-3.5 h-3.5 text-primary" />{navItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors">
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-card">
            <nav className="container mx-auto px-4 py-3 grid grid-cols-4 gap-1.5 max-h-[70vh] overflow-y-auto">
              {allNav.map((navItem) => {
                const Icon = navItem.icon;
                const isActive = location.pathname === navItem.path;
                return (
                  <Link key={navItem.path} to={navItem.path} onClick={() => setIsMobileMenuOpen(false)}
                    className={cn("flex flex-col items-center gap-1 p-2.5 rounded-xl text-[11px] font-medium transition-all",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                    )}>
                    <Icon className="w-4 h-4" />{navItem.label}
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
