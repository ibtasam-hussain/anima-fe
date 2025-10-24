import React from "react";
import { Navigate } from "react-router-dom";

type AdminProtectedRouteProps = {
  children: React.ReactNode;
};

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  const userData = localStorage.getItem("adminUser");
  const user = userData ? JSON.parse(userData) : null;

  const isAuthenticated = !!token;
  const isAdmin =
    user && (user.role === "admin" || user.role === "superadmin");

  // ❌ No token → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // ❌ Logged in but not admin → redirect to unauthorized page
  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Otherwise, allow access
  return <>{children}</>;
};

export default AdminProtectedRoute;
