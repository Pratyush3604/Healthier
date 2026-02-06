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
import AboutPage from "@/pages/AboutPage";
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
            <Route path="/symptoms" element={<SymptomsPage />} />
            <Route path="/vitals" element={<VitalsPage />} />
            <Route path="/injury" element={<InjuryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/ai-doctor" element={<AIDoctorPage />} />
            <Route path="/about" element={<AboutPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
