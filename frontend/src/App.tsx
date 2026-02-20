import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ERPLayout } from "@/components/layouts/ERPLayout";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { PrivateRoute } from "@/components/layouts/PrivateRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Planning from "./pages/Planning";
import CoffreFort from "./pages/CoffreFort";
import Devis from "./pages/Devis";
import NouveauDevis from "./pages/NouveauDevis";
import ModifierDevis from "./pages/ModifierDevis";
import Taches from "./pages/Taches";
import Clients from "./pages/Clients";
import Utilisateurs from "./pages/Utilisateurs";
import Parametres from "./pages/Parametres";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Catalog from "./pages/Catalog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Routes publiques */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Routes protégées */}
            <Route element={<PrivateRoute />}>
              <Route element={<ERPLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/planning" element={<Planning />} />
                <Route path="/coffre-fort" element={<CoffreFort />} />
                <Route path="/devis" element={<Devis />} />
                <Route path="/devis/nouveau" element={<NouveauDevis />} />
                <Route path="/devis/:id/modifier" element={<ModifierDevis />} />
                <Route path="/taches" element={<Taches />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/utilisateurs" element={<Utilisateurs />} />
                <Route path="/parametres" element={<Parametres />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
