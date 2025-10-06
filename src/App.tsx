import { useMemo, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import AnnouncementBar from "./components/AnnouncementBar";
import Home from "./pages/Home";
import AuthLogin from "./pages/AuthLogin";
import AuthSignup from "./pages/AuthSignup";
import OTPConfirm from "./pages/OTPConfirm";
import SkillsOnboarding from "./pages/SkillsOnboarding";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import SendRequest from "./pages/SendRequest";
import Requests from "./pages/Requests";
import SkillChange from "./pages/SkillChange";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Chat from "./pages/Chat";
import DatabaseStatus from "./components/DatabaseStatus";
import DebugInfo from "./components/DebugInfo";
import ConnectionTest from "./components/ConnectionTest";
import OnboardingChecker from "./components/OnboardingChecker";
import OTPDebugTest from "./pages/OTPDebugTest";
import EmailDeliveryTest from "./pages/EmailDeliveryTest";
import ChatDebug from "./pages/ChatDebug";
import DatabaseSetup from "./pages/DatabaseSetup";
import { AuthContextProvider, useAuth } from "./context/AuthContext";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const isLoggedIn = Boolean(user);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const isLoggedIn = useMemo(() => Boolean(user), [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* <DebugInfo />
        <ConnectionTest />
        <DatabaseStatus /> */}
      </div>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/home" replace />
            ) : (
              <Index />
            )
          }
        />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/home" replace />
            ) : (
              <AuthLogin />
            )
          }
        />
        <Route
          path="/register"
          element={
            isLoggedIn ? (
              <Navigate to="/home" replace />
            ) : (
              <AuthSignup />
            )
          }
        />
        <Route path="/verify-otp" element={<OTPConfirm />} />
        <Route path="/onboarding" element={<SkillsOnboarding />} />
        {/* <Route path="/debug-otp" element={<OTPDebugTest />} />
        <Route path="/test-email" element={<EmailDeliveryTest />} /> */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home
                isLoggedIn={isLoggedIn}
                currentUserId={isLoggedIn && user ? user.id : null}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile isLoggedIn={isLoggedIn} /></ProtectedRoute>}
        />
        <Route
          path="/send-request/:userId"
          element={<ProtectedRoute><SendRequest isLoggedIn={isLoggedIn} /></ProtectedRoute>}
        />
        <Route
          path="/requests"
          element={<ProtectedRoute><Requests isLoggedIn={isLoggedIn} /></ProtectedRoute>}
        />
        <Route
          path="/skill-change"
          element={<ProtectedRoute><SkillChange /></ProtectedRoute>}
        />
        <Route
          path="/skill-change/:requestId"
          element={<ProtectedRoute><SkillChange /></ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute><Admin /></ProtectedRoute>}
        />
        <Route
          path="/chat/:requestId"
          element={<ProtectedRoute><Chat /></ProtectedRoute>}
        />
        {/* <Route
          path="/chat-debug"
          element={<ProtectedRoute><ChatDebug /></ProtectedRoute>}
        />
        <Route path="/database-setup" element={<DatabaseSetup />} /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthContextProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthContextProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
