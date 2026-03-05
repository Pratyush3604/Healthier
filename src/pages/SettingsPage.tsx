import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Globe, Volume2, Palette, User, Shield, Trash2, LogOut, Moon, Sun, Monitor, ChevronRight, Bell, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const languages = [
  'English', 'Hindi', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian', 'Japanese', 'Korean',
  'Chinese (Simplified)', 'Chinese (Traditional)', 'Arabic', 'Bengali', 'Punjabi', 'Turkish', 'Vietnamese',
  'Thai', 'Dutch', 'Polish', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Greek', 'Czech', 'Romanian',
  'Hungarian', 'Indonesian', 'Malay', 'Filipino', 'Ukrainian', 'Hebrew', 'Persian', 'Urdu', 'Tamil',
  'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Gujarati', 'Nepali', 'Sinhala', 'Burmese', 'Khmer',
  'Lao', 'Swahili', 'Amharic', 'Yoruba', 'Igbo', 'Zulu',
];

type Tab = 'general' | 'voice' | 'privacy' | 'account';

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('general');
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState([1.0]);
  const [notifications, setNotifications] = useState(true);
  const [autoRead, setAutoRead] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [langSearch, setLangSearch] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const filteredLangs = languages.filter(l => l.toLowerCase().includes(langSearch.toLowerCase()));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Signed out', description: 'You have been signed out.' });
    navigate('/');
  };

  const handleClearData = () => {
    localStorage.clear();
    toast({ title: 'Data cleared', description: 'All local data has been cleared.' });
  };

  const handleExportData = () => {
    const data = JSON.stringify(localStorage, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'healtify-data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Data exported', description: 'Your data has been downloaded.' });
  };

  const tabs: { key: Tab; icon: any; label: string }[] = [
    { key: 'general', icon: Settings, label: 'General' },
    { key: 'voice', icon: Volume2, label: 'Voice & Audio' },
    { key: 'privacy', icon: Shield, label: 'Privacy & Data' },
    { key: 'account', icon: User, label: 'Account' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
            <Settings className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Customize your Healtify experience</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar */}
          <nav className="space-y-1">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tab === t.key ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-muted/50'}`}>
                  <Icon className="w-4 h-4" />
                  {t.label}
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="space-y-6">
            {tab === 'general' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Theme */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Theme</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { key: 'dark' as const, icon: Moon, label: 'Dark' },
                      { key: 'light' as const, icon: Sun, label: 'Light' },
                      { key: 'system' as const, icon: Monitor, label: 'System' },
                    ]).map(t => {
                      const Icon = t.icon;
                      return (
                        <button key={t.key} onClick={() => setTheme(t.key)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${theme === t.key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground/30'}`}>
                          <Icon className="w-6 h-6" />
                          <span className="text-sm font-medium">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Language</h3>
                  <Input placeholder="Search languages..." value={langSearch} onChange={e => setLangSearch(e.target.value)} className="mb-3" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {filteredLangs.map(l => (
                      <button key={l} onClick={() => { setLanguage(l); toast({ title: `Language set to ${l}` }); }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-all ${language === l ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-primary" />
                      <div>
                        <Label className="text-base font-semibold">Notifications</Label>
                        <p className="text-sm text-muted-foreground">Enable health reminders</p>
                      </div>
                    </div>
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'voice' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-card rounded-2xl p-6 border border-border space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Voice Responses</Label>
                      <p className="text-sm text-muted-foreground">Enable text-to-speech for AI responses</p>
                    </div>
                    <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">Auto-Read Responses</Label>
                      <p className="text-sm text-muted-foreground">Automatically read AI responses aloud</p>
                    </div>
                    <Switch checked={autoRead} onCheckedChange={setAutoRead} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-base font-semibold">Speech Speed</Label>
                      <span className="text-sm text-muted-foreground">{voiceSpeed[0].toFixed(1)}x</span>
                    </div>
                    <Slider value={voiceSpeed} onValueChange={setVoiceSpeed} min={0.5} max={2.0} step={0.1} />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0.5x Slow</span>
                      <span>1.0x Normal</span>
                      <span>2.0x Fast</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'privacy' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><Eye className="w-5 h-5 text-primary" /> Data Management</h3>
                  <p className="text-sm text-muted-foreground">Your health data is stored locally on your device. No data is sent to external servers except for AI analysis requests.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={handleExportData} className="flex-1">
                      <Download className="mr-2 h-4 w-4" /> Export My Data
                    </Button>
                    <Button variant="outline" onClick={handleClearData} className="flex-1 text-warning border-warning/30 hover:bg-warning/10">
                      <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
                    </Button>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="font-semibold text-lg mb-3">Privacy Policy</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-success shrink-0 mt-1.5" />No personal data is sold or shared with third parties</li>
                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-success shrink-0 mt-1.5" />AI queries are processed securely and not stored permanently</li>
                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-success shrink-0 mt-1.5" />Health data stays on your device unless you choose to sync</li>
                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-success shrink-0 mt-1.5" />Images are analyzed in real-time and not stored on servers</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {tab === 'account' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Account Info</h3>
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                          {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{user.user_metadata?.full_name || 'User'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-3">You are not signed in.</p>
                      <Button onClick={() => navigate('/auth')}>Sign In</Button>
                    </div>
                  )}
                </div>

                {user && (
                  <div className="bg-destructive/5 rounded-2xl p-6 border border-destructive/20">
                    <h3 className="font-semibold text-lg text-destructive mb-3">Danger Zone</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" onClick={handleLogout} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
