import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Route based on user type
  if (user.userType === "farmer" && path === "/buyer-dashboard") {
    return (
      <Route path={path}>
        <Redirect to="/farmer-dashboard" />
      </Route>
    );
  }

  if (user.userType === "buyer" && path === "/farmer-dashboard") {
    return (
      <Route path={path}>
        <Redirect to="/buyer-dashboard" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}
