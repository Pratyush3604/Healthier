import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import SymptomsPage from "@/pages/SymptomsPage";
import VitalsPage from "@/pages/VitalsPage";
import ReportsPage from "@/pages/ReportsPage";
import ChatPage from "@/pages/ChatPage";
import FirstAidPage from "@/pages/FirstAidPage";
import HealthTipsPage from "@/pages/HealthTipsPage";
import EmergencyPage from "@/pages/EmergencyPage";
import AboutPage from "@/pages/AboutPage";
import SkinInjuryPage from "@/pages/SkinInjuryPage";
import FitnessPage from "@/pages/FitnessPage";
import MedicineInfoPage from "@/pages/MedicineInfoPage";
import AuthPage from "@/pages/AuthPage";
import BMICalculatorPage from "@/pages/BMICalculatorPage";
import SettingsPage from "@/pages/SettingsPage";
import HealthDashboardPage from "@/pages/HealthDashboardPage";
import MedicationReminderPage from "@/pages/MedicationReminderPage";
import HealthReportsPage from "@/pages/HealthReportsPage";
import PostureCorrectorPage from "@/pages/PostureCorrectorPage";
import HowToUsePage from "@/pages/HowToUsePage";
import OAuthConsentPage from "@/pages/OAuthConsentPage";
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
            <Route path="/skin-injury" element={<SkinInjuryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/fitness" element={<FitnessPage />} />
            <Route path="/medicine-info" element={<MedicineInfoPage />} />
            <Route path="/bmi-calculator" element={<BMICalculatorPage />} />
            <Route path="/first-aid" element={<FirstAidPage />} />
            <Route path="/health-tips" element={<HealthTipsPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/medication-reminder" element={<MedicationReminderPage />} />
            <Route path="/health-reports" element={<HealthReportsPage />} />
            <Route path="/posture-corrector" element={<PostureCorrectorPage />} />
            <Route path="/how-to-use" element={<HowToUsePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsentPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
