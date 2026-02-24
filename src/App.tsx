// src/App.tsx
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/loginPage";
import ChatHome from "./pages/ChatHome";
import SocialLogin from "./pages/SocialLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";

// 🧱 Admin Imports
import AdminLayout from "@/layouts/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import UsersPage from "@/pages/admin/UsersPage";
import ProfilePage from "@/pages/admin/ProfilePage";
import AdminsPage from "@/pages/admin/AdminsPage";
import KnowledgeBasePage from "@/pages/admin/KnowledgeBasePage";
import UnansweredPage from "@/pages/admin/UnansweredPage";
import PrebuiltButtonsPage from "@/pages/admin/PrebuiltButtonsPage";

const App = () => (
  <ThemeProvider>
    <TooltipProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/social-login" element={<SocialLogin />} />

          {/* Protected User Home */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ChatHome />
              </ProtectedRoute>
            }
          />

          {/* 🧱 Admin Panel Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <AdminProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="users" element={<UsersPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="admins" element={<AdminsPage />} />
                    <Route path="knowledge" element={<KnowledgeBasePage />} />
                    <Route path="prebuilt-buttons" element={<PrebuiltButtonsPage />} />
                    <Route path="unanswered" element={<UnansweredPage />} />
                  </Routes>
                </AdminLayout>
              </AdminProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
