import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import FarmerDashboard from "@/pages/farmer-dashboard";
import BuyerDashboard from "@/pages/buyer-dashboard";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import AIChatbot from "./components/chat/ai-chatbot";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/farmer-dashboard" component={FarmerDashboard} />
      <ProtectedRoute path="/buyer-dashboard" component={BuyerDashboard} />
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <AIChatbot />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
