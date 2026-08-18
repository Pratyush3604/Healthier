import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Home, Stethoscope, Activity,
  FileText, MessageCircle, BookOpen,
  Phone, Lightbulb, Search, Pill, Dumbbell,
  Apple, Scan, Calculator, LogIn, LogOut,
  LayoutDashboard, Settings, TrendingUp,
  Monitor, ClipboardList, User, HelpCircle, Hospital, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HealtifyLogo } from './HealtifyLogo';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';


const useNavItems = () => {
  const { t } = useTranslation();
  const navItems = [
    { path: '/', label: t('home'), icon: Home },
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/symptoms', label: t('symptoms'), icon: Stethoscope },
    { path: '/skin-injury', label: t('skinInjury'), icon: Scan },
    { path: '/chat', label: t('chat'), icon: MessageCircle },
    { path: '/fitness', label: t('fitness'), icon: Dumbbell },
    { path: '/medicine-info', label: t('medicine'), icon: Pill },
  ];
  const moreItems = [
    { path: '/vitals', label: t('vitals'), icon: Activity },
    { path: '/reports', label: t('reportAnalysis'), icon: FileText },
    { path: '/bmi-calculator', label: t('healthCalculator'), icon: Calculator },
    { path: '/medication-reminder', label: t('medReminders'), icon: ClipboardList },
    { path: '/health-reports', label: t('reportsHub'), icon: TrendingUp },
    { path: '/posture-corrector', label: t('posture'), icon: Monitor },
    { path: '/first-aid', label: t('firstAid'), icon: BookOpen },
    { path: '/health-tips', label: t('healthTips'), icon: Lightbulb },
    { path: '/nearby-care', label: t('nearbyCare'), icon: Hospital },
    { path: '/emergency', label: t('emergency'), icon: Phone },
    { path: '/how-to-use', label: t('howToUse'), icon: HelpCircle },
    { path: '/settings', label: t('settings'), icon: Settings },
    { path: '/about', label: t('about'), icon: User },
  ];
  return { navItems, moreItems, t };
};

export function Header() {
  const { navItems, moreItems, t } = useNavItems();
  const allNav = [...navItems, ...moreItems];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  const filteredNav = searchTerm
    ? allNav.filter(i => i.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const handleLogout = async () => {
    await signOut();
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
                {t('more')}
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
              <div className="hidden sm:block relative group">
                <button className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-muted/50 transition-all">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[11px] font-bold text-primary-foreground">
                    {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                  </span>
                </button>
                <div className="absolute top-full right-0 mt-1.5 py-1.5 w-52 bg-card border border-border rounded-xl shadow-elevated opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-semibold truncate">{user.user_metadata?.full_name || 'User'}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <LayoutDashboard className="w-3.5 h-3.5" />{t('dashboard')}
                  </Link>
                  <Link to="/complete-profile" className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <User className="w-3.5 h-3.5" />My profile
                  </Link>
                  <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <Settings className="w-3.5 h-3.5" />{t('settings')}
                  </Link>
                  {isAdmin && (
                    <Link to="/admin/users" className="flex items-center gap-2.5 px-3 py-2 text-sm text-primary hover:bg-muted/50 transition-colors">
                      <Shield className="w-3.5 h-3.5" />User directory
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <LogOut className="w-3.5 h-3.5" />Sign out
                  </button>
                </div>
              </div>
            ) : (

              <Link to="/auth" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
                <LogIn className="w-3.5 h-3.5" /><span>{t('login')}</span>
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
                    <Input placeholder={`${t('search')}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
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
