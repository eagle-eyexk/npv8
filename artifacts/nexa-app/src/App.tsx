import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
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

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } });

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spin" style={{ width: 32, height: 32 }} /></div>;
  if (!user) return <Redirect to="/login" />;
  return <>{children}</>;
}

function Routes() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spin" style={{ width: 32, height: 32 }} /></div>;
  return (
    <Switch>
      <Route path="/">{user ? <Redirect to="/dashboard" /> : <Landing />}</Route>
      <Route path="/login">{user ? <Redirect to="/dashboard" /> : <Login />}</Route>
      <Route path="/register">{user ? <Redirect to="/dashboard" /> : <Register />}</Route>
      <Route path="/admin"><Admin /></Route>
      <Route path="/dashboard"><Guard><Layout><Dashboard /></Layout></Guard></Route>
      <Route path="/send"><Guard><Layout><Send /></Layout></Guard></Route>
      <Route path="/receive"><Guard><Layout><Receive /></Layout></Guard></Route>
      <Route path="/transactions"><Guard><Layout><Transactions /></Layout></Guard></Route>
      <Route path="/tap"><Guard><Layout><Tap /></Layout></Guard></Route>
      <Route path="/merchants"><Guard><Layout><Merchants /></Layout></Guard></Route>
      <Route path="/card"><Guard><Layout><Card /></Layout></Guard></Route>
      <Route path="/merchant-pos"><Guard><Layout><MerchantDashboard /></Layout></Guard></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Routes />
        </WouterRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
