import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import FarmerDashboard from "@/pages/farmer-dashboard";
import BuyerDashboard from "@/pages/buyer-dashboard";
import FPODashboard from "@/pages/fpo-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import MarketplacePage from "@/pages/marketplace";
import MessagesPage from "@/pages/messages-page"; // Import MessagesPage
import AnalyticsPage from "@/pages/analytics"; // Import AnalyticsPage
import CropIntelligencePage from "@/pages/crop-intelligence";
import AIAssistant from "@/components/ai-assistant"; // Import AIAssistant
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
// AIChatbot import removed

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/farmer-dashboard" component={FarmerDashboard} />
      <ProtectedRoute path="/buyer-dashboard" component={BuyerDashboard} />
      <ProtectedRoute path="/fpo-dashboard" component={FPODashboard} />
      <ProtectedRoute path="/admin-dashboard" component={AdminDashboard} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/marketplace" component={MarketplacePage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/crop-intelligence" component={CropIntelligencePage} />
      <Route path="/">
        {() => {
          window.location.href = "/auth";
          return null;
        }}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Error caught by ErrorBoundary:", event.error);
      setError(event.error || new Error("Unknown error occurred"));
      setHasError(true);
      event.preventDefault();
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Promise rejection caught:", event.reason);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
      setHasError(true);
      event.preventDefault();
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-700 mb-4">
            We're sorry, but there was an error loading the application.
          </p>
          <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto max-h-32">
            <code className="text-sm text-red-600">{error?.message || "Unknown error"}</code>
          </div>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
              window.location.reload();
            }}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <AIAssistant />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
