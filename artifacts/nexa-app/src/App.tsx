import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import NetworkBackground from "@/components/NetworkBackground";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Send from "@/pages/Send";
import Receive from "@/pages/Receive";
import Transactions from "@/pages/Transactions";
import Tap from "@/pages/Tap";
import Merchants from "@/pages/Merchants";
import Card from "@/pages/Card";
import Admin from "@/pages/Admin";
import MerchantDashboard from "@/pages/MerchantDashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );
  if (!user) return <Redirect to="/login" />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <Switch>
      <Route path="/">{user ? <Redirect to="/dashboard" /> : <Landing />}</Route>
      <Route path="/login">{user ? <Redirect to="/dashboard" /> : <Login />}</Route>
      <Route path="/register">{user ? <Redirect to="/dashboard" /> : <Register />}</Route>
      <Route path="/admin"><Admin /></Route>
      <Route path="/dashboard">
        <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
      </Route>
      <Route path="/send">
        <ProtectedRoute><Layout><Send /></Layout></ProtectedRoute>
      </Route>
      <Route path="/receive">
        <ProtectedRoute><Layout><Receive /></Layout></ProtectedRoute>
      </Route>
      <Route path="/transactions">
        <ProtectedRoute><Layout><Transactions /></Layout></ProtectedRoute>
      </Route>
      <Route path="/tap">
        <ProtectedRoute><Layout><Tap /></Layout></ProtectedRoute>
      </Route>
      <Route path="/merchants">
        <ProtectedRoute><Layout><Merchants /></Layout></ProtectedRoute>
      </Route>
      <Route path="/card">
        <ProtectedRoute><Layout><Card /></Layout></ProtectedRoute>
      </Route>
      <Route path="/merchant-pos">
        <ProtectedRoute><Layout><MerchantDashboard /></Layout></ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <NetworkBackground />
          <AppRoutes />
        </WouterRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
