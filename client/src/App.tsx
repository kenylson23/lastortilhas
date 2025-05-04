import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import AdminCategories from "@/pages/admin/admin-categories";
import AdminMenu from "@/pages/admin/admin-menu";
import AdminReservations from "@/pages/admin/admin-reservations";
import AdminSettings from "@/pages/admin/admin-settings";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Rotas administrativas - protegidas */}
      <Route path="/admin">
        <ProtectedRoute path="/admin" component={AdminDashboard} />
      </Route>
      <Route path="/admin/categories">
        <ProtectedRoute path="/admin/categories" component={AdminCategories} />
      </Route>
      <Route path="/admin/menu">
        <ProtectedRoute path="/admin/menu" component={AdminMenu} />
      </Route>
      <Route path="/admin/reservations">
        <ProtectedRoute path="/admin/reservations" component={AdminReservations} />
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute path="/admin/settings" component={AdminSettings} />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
