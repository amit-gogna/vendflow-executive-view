import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PrototypeStoreProvider } from "@/lib/prototype-store";
import Decisions from "./pages/Decisions";
import EngagementWorkspace from "./pages/EngagementWorkspace";
import Suppliers from "./pages/Suppliers";
import RatesAndTerms from "./pages/RatesAndTerms";
import ValueLedger from "./pages/ValueLedger";
import SignalRules from "./pages/SignalRules";
import AuditLog from "./pages/AuditLog";
import AISourcing from "./pages/AISourcing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PrototypeStoreProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Decisions />} />
            <Route path="/engagement/:id" element={<EngagementWorkspace />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/rates" element={<RatesAndTerms />} />
            <Route path="/value" element={<ValueLedger />} />
            <Route path="/rules" element={<SignalRules />} />
            <Route path="/audit" element={<AuditLog />} />
            <Route path="/sourcing" element={<AISourcing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PrototypeStoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
