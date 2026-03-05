import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import SymptomsPage from "@/pages/SymptomsPage";
import VitalsPage from "@/pages/VitalsPage";
import InjuryPage from "@/pages/InjuryPage";
import ReportsPage from "@/pages/ReportsPage";
import ChatPage from "@/pages/ChatPage";
import AIDoctorPage from "@/pages/AIDoctorPage";
import FirstAidPage from "@/pages/FirstAidPage";
import HealthTipsPage from "@/pages/HealthTipsPage";
import EmergencyPage from "@/pages/EmergencyPage";
import AboutPage from "@/pages/AboutPage";
import DietPlannerPage from "@/pages/DietPlannerPage";
import WorkoutPlannerPage from "@/pages/WorkoutPlannerPage";
import SleepAnalysisPage from "@/pages/SleepAnalysisPage";
import MedicineInfoPage from "@/pages/MedicineInfoPage";
import SkinAnalyzerPage from "@/pages/SkinAnalyzerPage";
import AuthPage from "@/pages/AuthPage";
import BMICalculatorPage from "@/pages/BMICalculatorPage";
import SettingsPage from "@/pages/SettingsPage";
import WaterTrackerPage from "@/pages/WaterTrackerPage";
import HealthDashboardPage from "@/pages/HealthDashboardPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<HealthDashboardPage />} />
            <Route path="/symptoms" element={<SymptomsPage />} />
            <Route path="/vitals" element={<VitalsPage />} />
            <Route path="/injury" element={<InjuryPage />} />
            <Route path="/skin-analyzer" element={<SkinAnalyzerPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/ai-doctor" element={<AIDoctorPage />} />
            <Route path="/diet-planner" element={<DietPlannerPage />} />
            <Route path="/workout-planner" element={<WorkoutPlannerPage />} />
            <Route path="/sleep-analysis" element={<SleepAnalysisPage />} />
            <Route path="/medicine-info" element={<MedicineInfoPage />} />
            <Route path="/bmi-calculator" element={<BMICalculatorPage />} />
            <Route path="/water-tracker" element={<WaterTrackerPage />} />
            <Route path="/first-aid" element={<FirstAidPage />} />
            <Route path="/health-tips" element={<HealthTipsPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
