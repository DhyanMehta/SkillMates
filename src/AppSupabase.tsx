import { useMemo, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import AnnouncementBar from "./components/AnnouncementBar";
import HomeSupabase from "./pages/HomeSupabase"; // Updated Supabase version
import AuthLogin from "./pages/AuthLogin";
import AuthSignup from "./pages/AuthSignup";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import SendRequest from "./pages/SendRequest";
import Requests from "./pages/Requests";
import SkillChange from "./pages/SkillChange";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import { AuthContextProvider, useAuth } from "./context/AuthContext";
import { SupabaseStoreProvider, useSupabaseStore } from "./context/SupabaseStore";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    return user ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
    const { user, loading } = useAuth();
    const { currentUser, announcements, isLoadingAnnouncements } = useSupabaseStore();
    const isLoggedIn = Boolean(user);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                <TooltipProvider>
                    {/* Announcement Bar */}
                    {!isLoadingAnnouncements && announcements.length > 0 && (
                        <AnnouncementBar announcements={announcements} />
                    )}

                    {/* Header */}
                    <Header
                        isLoggedIn={isLoggedIn}
                        currentUserId={user?.id}
                        currentUser={currentUser}
                    />

                    {/* Main Routes */}
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Index />} />
                        <Route
                            path="/home"
                            element={<HomeSupabase />}
                        />
                        <Route path="/login" element={<AuthLogin />} />
                        <Route path="/signup" element={<AuthSignup />} />

                        {/* Protected Routes */}
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/send-request/:userId"
                            element={
                                <ProtectedRoute>
                                    <SendRequest />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/requests"
                            element={
                                <ProtectedRoute>
                                    <Requests />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/skills"
                            element={
                                <ProtectedRoute>
                                    <SkillChange />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin Route */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <Admin />
                                </ProtectedRoute>
                            }
                        />

                        {/* Fallback Routes */}
                        <Route path="/404" element={<NotFound />} />
                        <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>

                    {/* Toast Notifications */}
                    <Toaster />
                    <Sonner />
                </TooltipProvider>
            </div>
        </BrowserRouter>
    );
};

const App = () => {
    return (
        <SupabaseStoreProvider>
            <AuthContextProvider>
                <AppRoutes />
            </AuthContextProvider>
        </SupabaseStoreProvider>
    );
};

export default App;