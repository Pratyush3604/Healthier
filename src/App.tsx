import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAuth } from "@/components/RequireAuth";
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
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import CompleteProfilePage from "@/pages/CompleteProfilePage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import BMICalculatorPage from "@/pages/BMICalculatorPage";
import SettingsPage from "@/pages/SettingsPage";
import HealthDashboardPage from "@/pages/HealthDashboardPage";
import MedicationReminderPage from "@/pages/MedicationReminderPage";
import HealthReportsPage from "@/pages/HealthReportsPage";
import PostureCorrectorPage from "@/pages/PostureCorrectorPage";
import HowToUsePage from "@/pages/HowToUsePage";
import OAuthConsentPage from "@/pages/OAuthConsentPage";
import NearbyCarePage from "@/pages/NearbyCarePage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const guarded = (element: JSX.Element) => <RequireAuth>{element}</RequireAuth>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/how-to-use" element={<HowToUsePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/emergency" element={<EmergencyPage />} />
              <Route path="/.lovable/oauth/consent" element={<OAuthConsentPage />} />

              {/* Account required */}
              <Route path="/complete-profile" element={guarded(<CompleteProfilePage />)} />
              <Route path="/dashboard" element={guarded(<HealthDashboardPage />)} />
              <Route path="/symptoms" element={guarded(<SymptomsPage />)} />
              <Route path="/vitals" element={guarded(<VitalsPage />)} />
              <Route path="/skin-injury" element={guarded(<SkinInjuryPage />)} />
              <Route path="/reports" element={guarded(<ReportsPage />)} />
              <Route path="/chat" element={guarded(<ChatPage />)} />
              <Route path="/fitness" element={guarded(<FitnessPage />)} />
              <Route path="/medicine-info" element={guarded(<MedicineInfoPage />)} />
              <Route path="/bmi-calculator" element={guarded(<BMICalculatorPage />)} />
              <Route path="/first-aid" element={guarded(<FirstAidPage />)} />
              <Route path="/health-tips" element={guarded(<HealthTipsPage />)} />
              <Route path="/nearby-care" element={guarded(<NearbyCarePage />)} />
              <Route path="/settings" element={guarded(<SettingsPage />)} />
              <Route path="/medication-reminder" element={guarded(<MedicationReminderPage />)} />
              <Route path="/health-reports" element={guarded(<HealthReportsPage />)} />
              <Route path="/posture-corrector" element={guarded(<PostureCorrectorPage />)} />

              {/* Admin only */}
              <Route path="/admin/users" element={<RequireAuth adminOnly><AdminUsersPage /></RequireAuth>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
