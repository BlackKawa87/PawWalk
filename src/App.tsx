import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SignupOwner from "./pages/SignupOwner";
import SignupWalker from "./pages/SignupWalker";
import Dashboard from "./pages/app/Dashboard";
import FindWalkers from "./pages/app/FindWalkers";
import BookingFlow from "./pages/app/BookingFlow";
import WalkerProfile from "./pages/app/WalkerProfile";
import Chat from "./pages/app/Chat";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/signup/owner" element={<SignupOwner />} />
    <Route path="/signup/walker" element={<SignupWalker />} />
    <Route path="/terms" element={<Terms />} />
    <Route
      path="/app/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/find"
      element={
        <ProtectedRoute>
          <FindWalkers />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/book/:walkerId"
      element={
        <ProtectedRoute>
          <BookingFlow />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/walker/:walkerId"
      element={
        <ProtectedRoute>
          <WalkerProfile />
        </ProtectedRoute>
      }
    />
    <Route
      path="/app/chat/:bookingId"
      element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      }
    />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
