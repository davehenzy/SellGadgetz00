import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import SellPage from "@/pages/sell-page";
import RepairPage from "@/pages/repair-page";
import DashboardPage from "@/pages/dashboard-page";
import AdminPage from "@/pages/admin-page";
import { ProtectedRoute } from "./lib/protected-route";
import { LiveChatWidget } from "./components/common/live-chat-widget";

// Define the routes - this prevents TypeScript errors with components that might return null
const AdminRoute = () => <AdminPage />;
const DashboardRoute = () => <DashboardPage />;
const SellRoute = () => <SellPage />;
const RepairRoute = () => <RepairPage />;

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/sell" component={SellRoute} />
      <ProtectedRoute path="/repair" component={RepairRoute} />
      <ProtectedRoute path="/dashboard" component={DashboardRoute} />
      <ProtectedRoute path="/admin" component={AdminRoute} adminOnly={true} />
      <Route path="/:rest*" component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <LiveChatWidget />
      <Toaster />
    </>
  );
}

export default App;
