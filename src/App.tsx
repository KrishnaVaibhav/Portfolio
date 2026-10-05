import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
// Secondary routes carry their own heavy deps (Supabase tables, charts); keep them out of the home bundle.
const AdminLogs = lazy(() => import("./pages/AdminLogs"));
const Signals = lazy(() => import("./pages/Signals"));
import { useTrackVisit } from "./hooks/use-track-visit";
import { Spotlight } from "./components/Spotlight";

const queryClient = new QueryClient();

const VisitTracker = ({ children }: { children: React.ReactNode }) => {
  useTrackVisit();
  return <>{children}</>;
};

// HashRouter swaps pages within one document, so the browser doesn't reset
// scroll position on navigation like a normal page load would. Reset it here,
// unless the destination asked to land on a specific section (see Navigation's
// scrollToSection + Index's handling of location.state.scrollTo).
const ScrollManager = () => {
  const location = useLocation();
  useEffect(() => {
    if (!(location.state as { scrollTo?: string } | null)?.scrollTo) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <ScrollManager />
        <Spotlight />
        <VisitTracker>
          <Suspense fallback={<div className="min-h-[100dvh] bg-background" />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/signals" element={<Signals />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </VisitTracker>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
