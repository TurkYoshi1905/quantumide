import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import IDE from "@/pages/IDE";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import { Code2 } from "lucide-react";

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center quantum-glow">
          <Code2 size={24} className="text-primary animate-pulse" />
        </div>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, dbReady } = useApp();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!dbReady) return;
    if (!user && location !== '/login' && location !== '/register') {
      setLocation('/login');
    }
    // If user is logged in and on login/register page, redirect to IDE
    if (user && (location === '/login' || location === '/register')) {
      setLocation('/');
    }
  }, [user, location, setLocation, dbReady]);

  if (!dbReady) return <LoadingScreen />;

  return <>{children}</>;
}

function Router() {
  return (
    <AuthGuard>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/settings" component={Settings} />
        <Route path="/" component={IDE} />
        <Route component={NotFound} />
      </Switch>
    </AuthGuard>
  );
}

function AppContent() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
