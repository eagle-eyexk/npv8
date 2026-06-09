import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Send from "@/pages/Send";
import Receive from "@/pages/Receive";
import Transactions from "@/pages/Transactions";
import Tap from "@/pages/Tap";
import Merchants from "@/pages/Merchants";
import Card from "@/pages/Card";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard">
        <Layout><Dashboard /></Layout>
      </Route>
      <Route path="/send">
        <Layout><Send /></Layout>
      </Route>
      <Route path="/receive">
        <Layout><Receive /></Layout>
      </Route>
      <Route path="/transactions">
        <Layout><Transactions /></Layout>
      </Route>
      <Route path="/tap">
        <Layout><Tap /></Layout>
      </Route>
      <Route path="/merchants">
        <Layout><Merchants /></Layout>
      </Route>
      <Route path="/card">
        <Layout><Card /></Layout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
