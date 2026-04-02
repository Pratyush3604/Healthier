import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, Search, Calendar, Pill, TrendingUp, Download, Scan, Dumbbell, Apple, Stethoscope } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PageHeader } from '@/components/PageHeader';

interface HealthReport {
  id: string;
  type: string;
  title: string;
  date: string;
  summary: string;
  details?: string;
}

const typeIcons: Record<string, any> = {
  'skin-analysis': Scan,
  'injury-analysis': Scan,
  medication: Pill,
  medicine: Pill,
  diet: Apple,
  workout: Dumbbell,
  symptoms: Stethoscope,
  bmi: TrendingUp,
};

export default function HealthReportsPage() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [reports] = useLocalStorage<HealthReport[]>('healthier-reports', []);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...reports]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter(r => {
        const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.summary.toLowerCase().includes(search.toLowerCase());
        const matchType = selectedType === 'all' || r.type === selectedType;
        return matchSearch && matchType;
      });
  }, [reports, search, selectedType]);

  const types = useMemo(() => {
    const set = new Set(reports.map(r => r.type));
    return ['all', ...Array.from(set)];
  }, [reports]);

  const exportData = () => {
    const data = JSON.stringify(reports, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthier-reports-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          icon={<TrendingUp className="h-8 w-8 text-primary-foreground" />}
          title="Health Reports"
          description="Auto-generated from your tool usage — skin analyses, medicine lookups, fitness plans & more"
          gradient="from-primary to-success"
          showEmergency={false}
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-2xl font-bold text-primary">{reports.length}</p>
            <p className="text-xs text-muted-foreground">Total Reports</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-2xl font-bold text-primary">{new Set(reports.map(r => r.type)).size}</p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <p className="text-2xl font-bold text-primary">{reports.filter(r => r.date === new Date().toISOString().split('T')[0]).length}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Button variant="outline" onClick={exportData} className="gap-2" disabled={reports.length === 0}>
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {types.map(t => (
            <button key={t} onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${selectedType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {t.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Reports */}
        <div className="space-y-3">
          {sorted.map(report => {
            const Icon = typeIcons[report.type] || FileText;
            const isExpanded = expandedId === report.id;
            return (
              <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border overflow-hidden">
                <button onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{report.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{report.summary}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <Calendar className="w-3 h-3" />{report.date}
                  </div>
                </button>
                <AnimatePresence>
                  {isExpanded && report.details && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-1 border-t border-border">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.details}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
            <p className="text-muted-foreground">Reports are auto-generated when you use health tools like Skin Analyzer, Medicine Info, or Fitness Planner</p>
          </div>
        )}
      </div>
    </div>
  );
}
