
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UserProvider, useUser } from "@/contexts/UserContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MediaSelection from "./pages/MediaSelection";
import Recommendations from "./pages/Recommendations";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Legal pages
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import CookiePolicy from "./pages/legal/CookiePolicy";
import DMCA from "./pages/legal/DMCA";

// Discover pages
import Genres from "./pages/discover/Genres";
import NewReleases from "./pages/discover/NewReleases";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useUser();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useUser();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route 
        path="/selection" 
        element={
          <ProtectedRoute>
            <MediaSelection />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/recommendations" 
        element={
          <ProtectedRoute>
            <Recommendations />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      {/* Legal Pages */}
      <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/legal/terms-of-service" element={<TermsOfService />} />
      <Route path="/legal/cookie-policy" element={<CookiePolicy />} />
      <Route path="/legal/dmca" element={<DMCA />} />
      
      {/* Discover Pages */}
      <Route path="/discover/genres" element={<Genres />} />
      <Route path="/discover/new-releases" element={<NewReleases />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
