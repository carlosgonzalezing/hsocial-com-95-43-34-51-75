
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/providers/AuthProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { RecoveryTokenHandler } from "@/components/auth/RecoveryTokenHandler";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Friends from "@/pages/Friends";
import FriendRequestsPage from "@/pages/FriendRequestsPage";
import Notifications from "@/pages/Notifications";
import Reels from "@/pages/Reels";
import Messages from "@/pages/Messages";
import Popularity from "@/pages/Popularity";
import Memories from "@/pages/Memories";
import Marketplace from "@/pages/Marketplace";
import Events from "@/pages/Events";
import Help from "@/pages/Help";

import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import PasswordReset from "@/pages/PasswordReset";
import Banners from "@/pages/Banners";
import Premium from "@/pages/Premium";
import Groups from "@/pages/Groups";
import GroupDetail from "@/pages/GroupDetail";
import UniversityDashboard from "@/pages/UniversityDashboard";
import Opportunities from "@/pages/Opportunities";
import Settings from "@/pages/settings/Settings";
import AccountSettings from "@/pages/settings/AccountSettings";
import PersonalizationSettings from "@/pages/settings/PersonalizationSettings";
import StatisticsSettings from "@/pages/settings/StatisticsSettings";
import PrivacySettings from "@/pages/settings/PrivacySettings";
import SecuritySettings from "@/pages/settings/SecuritySettings";
import NotificationSettings from "@/pages/NotificationSettings";
import Saved from "@/pages/Saved";
import Trends from "@/pages/Trends";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AuthProvider>
              <RecoveryTokenHandler />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/password-reset" element={<PasswordReset />} />
              <Route path="/" element={
                <AuthGuard>
                  <Index />
                </AuthGuard>
              } />
              <Route path="/profile/:userId" element={
                <AuthGuard>
                  <Profile />
                </AuthGuard>
              } />
              <Route path="/friends" element={
                <AuthGuard>
                  <Friends />
                </AuthGuard>
              } />
              <Route path="/friends/requests" element={
                <AuthGuard>
                  <FriendRequestsPage />
                </AuthGuard>
              } />
              <Route path="/messages" element={
                <AuthGuard>
                  <Messages />
                </AuthGuard>
              } />
              <Route path="/notifications" element={
                <AuthGuard>
                  <Notifications />
                </AuthGuard>
              } />
              <Route path="/reels" element={
                <AuthGuard>
                  <Reels />
                </AuthGuard>
              } />
              <Route path="/popularity" element={
                <AuthGuard>
                  <Popularity />
                </AuthGuard>
              } />
              <Route path="/banners" element={
                <AuthGuard>
                  <Banners />
                </AuthGuard>
              } />
              <Route path="/premium" element={
                <AuthGuard>
                  <Premium />
                </AuthGuard>
              } />
              <Route path="/groups" element={
                <AuthGuard>
                  <Groups />
                </AuthGuard>
              } />
              <Route path="/groups/:slug" element={
                <AuthGuard>
                  <GroupDetail />
                </AuthGuard>
              } />
              <Route path="/universidad" element={
                <AuthGuard>
                  <UniversityDashboard />
                </AuthGuard>
              } />
              <Route path="/opportunities" element={
                <AuthGuard>
                  <Opportunities />
                </AuthGuard>
              } />
              <Route path="/settings" element={
                <AuthGuard>
                  <Settings />
                </AuthGuard>
              } />
              <Route path="/settings/account" element={
                <AuthGuard>
                  <AccountSettings />
                </AuthGuard>
              } />
              <Route path="/settings/personalization" element={
                <AuthGuard>
                  <PersonalizationSettings />
                </AuthGuard>
              } />
              <Route path="/settings/statistics" element={
                <AuthGuard>
                  <StatisticsSettings />
                </AuthGuard>
              } />
              <Route path="/settings/privacy" element={
                <AuthGuard>
                  <PrivacySettings />
                </AuthGuard>
              } />
              <Route path="/settings/security" element={
                <AuthGuard>
                  <SecuritySettings />
                </AuthGuard>
              } />
              <Route path="/settings/notifications" element={
                <AuthGuard>
                  <NotificationSettings />
                </AuthGuard>
              } />
              <Route path="/saved" element={
                <AuthGuard>
                  <Saved />
                </AuthGuard>
              } />
              <Route path="/memories" element={
                <AuthGuard>
                  <Memories />
                </AuthGuard>
              } />
              <Route path="/marketplace" element={
                <AuthGuard>
                  <Marketplace />
                </AuthGuard>
              } />
              <Route path="/events" element={
                <AuthGuard>
                  <Events />
                </AuthGuard>
              } />
              <Route path="/help" element={
                <AuthGuard>
                  <Help />
                </AuthGuard>
              } />
              <Route path="/trends" element={
                <AuthGuard>
                  <Trends />
                </AuthGuard>
              } />
              <Route path="*" element={
                <AuthGuard>
                  <NotFound />
                </AuthGuard>
              } />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
