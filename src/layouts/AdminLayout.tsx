// src/layouts/AdminLayout.tsx
import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#e9f1f8] gap-6 px-4 py-6">
      <AdminSidebar />
      <main className="flex-1 rounded-2xl bg-white shadow-sm p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
