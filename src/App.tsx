import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogs from "./pages/AdminLogs";
import { useTrackVisit } from "./hooks/use-track-visit";

const queryClient = new QueryClient();

const VisitTracker = ({ children }: { children: React.ReactNode }) => {
  useTrackVisit();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <VisitTracker>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </VisitTracker>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
