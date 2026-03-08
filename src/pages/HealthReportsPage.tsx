import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, Search, Calendar, Droplets, Calculator, Heart, Pill, BookMarked, Moon, TrendingUp, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface HealthReport {
  id: string;
  type: string;
  title: string;
  date: string;
  summary: string;
  details?: string;
}

const typeIcons: Record<string, any> = {
  water: Droplets,
  bmi: Calculator,
  mood: Heart,
  medication: Pill,
  journal: BookMarked,
  sleep: Moon,
};

const typeColors: Record<string, string> = {
  water: 'from-blue-500 to-cyan-500',
  bmi: 'from-sky-500 to-blue-500',
  mood: 'from-pink-500 to-rose-500',
  medication: 'from-teal-500 to-emerald-500',
  journal: 'from-violet-500 to-purple-500',
  sleep: 'from-indigo-500 to-violet-500',
};

export default function HealthReportsPage() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [reports, setReports] = useLocalStorage<HealthReport[]>('healtify-reports', []);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Aggregate data from all localStorage sources
  const [waterData] = useLocalStorage<{ glasses: number; goal: number }>('healtify-water', { glasses: 0, goal: 8 });
  const [bmiData] = useLocalStorage<{ bmi: string }>('healtify-bmi', { bmi: '--' });
  const [journalEntries] = useLocalStorage<any[]>('healtify-journal', []);
  const [medications] = useLocalStorage<any[]>('healtify-medications', []);

  // Build aggregated reports from all health data
  const allReports = useMemo(() => {
    const auto: HealthReport[] = [];

    // Water tracking entries
    if (waterData.glasses > 0) {
      auto.push({
        id: 'water-today',
        type: 'water',
        title: 'Water Intake Today',
        date: new Date().toISOString().split('T')[0],
        summary: `${waterData.glasses} of ${waterData.goal} glasses consumed`,
        details: `Progress: ${Math.round((waterData.glasses / waterData.goal) * 100)}% of daily goal`,
      });
    }

    // BMI
    if (bmiData.bmi !== '--') {
      auto.push({
        id: 'bmi-latest',
        type: 'bmi',
        title: 'BMI Calculation',
        date: new Date().toISOString().split('T')[0],
        summary: `BMI: ${bmiData.bmi}`,
        details: `Your calculated Body Mass Index is ${bmiData.bmi}`,
      });
    }

    // Journal entries
    journalEntries.forEach((entry: any, i: number) => {
      const moods = ['😞 Very Low', '😐 Low', '🙂 Okay', '😊 Good', '🤩 Excellent'];
      auto.push({
        id: `journal-${i}`,
        type: 'journal',
        title: `Journal Entry — ${entry.date}`,
        date: entry.date,
        summary: `Mood: ${moods[entry.mood - 1] || 'Unknown'} | Energy: ${entry.energy || '--'}/5`,
        details: entry.notes || 'No notes recorded',
      });
    });

    // Medications
    medications.forEach((med: any, i: number) => {
      auto.push({
        id: `med-${i}`,
        type: 'medication',
        title: `Medication: ${med.name}`,
        date: med.addedDate || new Date().toISOString().split('T')[0],
        summary: `${med.dosage || ''} — ${med.frequency || 'Daily'}`,
        details: `Time: ${med.time || 'Not set'} | Notes: ${med.notes || 'None'}`,
      });
    });

    // Merge with manual reports
    return [...auto, ...reports].sort((a, b) => b.date.localeCompare(a.date));
  }, [waterData, bmiData, journalEntries, medications, reports]);

  const filtered = useMemo(() => {
    return allReports.filter(r => {
      const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.summary.toLowerCase().includes(search.toLowerCase());
      const matchType = selectedType === 'all' || r.type === selectedType;
      return matchSearch && matchType;
    });
  }, [allReports, search, selectedType]);

  const types = ['all', ...Object.keys(typeIcons)];

  const clearReports = () => {
    setReports([]);
  };

  const exportData = () => {
    const data = JSON.stringify(allReports, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healtify-reports-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Health Reports</h1>
          <p className="text-muted-foreground">All your health data in one place — water, BMI, mood, medications & journal</p>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <Droplets className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{waterData.glasses}/{waterData.goal}</p>
            <p className="text-xs text-muted-foreground">Water Today</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <Calculator className="w-6 h-6 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold">{bmiData.bmi}</p>
            <p className="text-xs text-muted-foreground">BMI</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <BookMarked className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold">{journalEntries.length}</p>
            <p className="text-xs text-muted-foreground">Journal Entries</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <Pill className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{medications.length}</p>
            <p className="text-xs text-muted-foreground">Medications</p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Button variant="outline" onClick={exportData} className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {types.map(t => (
            <button key={t} onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${selectedType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Reports list */}
        <div className="space-y-3">
          {filtered.map(report => {
            const Icon = typeIcons[report.type] || FileText;
            const gradient = typeColors[report.type] || 'from-primary to-secondary';
            const isExpanded = expandedId === report.id;
            return (
              <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border overflow-hidden">
                <button onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  className="w-full flex items-center gap-4 p-4 text-left">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${gradient} shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
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
                  {isExpanded && (
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

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
            <p className="text-muted-foreground">Use the health tools to start generating reports</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
