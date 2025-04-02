
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Spiral from "./pages/Spiral";
import NotFound from "./pages/NotFound";

const App = () => {
  // Create a QueryClient instance
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TooltipProvider>
          <div className="cosmic-background min-h-screen w-full overflow-hidden relative">
            <div className="deep-space-bg">
              <div className="background-image"></div>
            </div>
            <div className="relative z-10 w-full h-screen">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/spiral" element={<Spiral />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
