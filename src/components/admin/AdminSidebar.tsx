import React from "react";
import {
  Users,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  LogOut,
  UserCog,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import PH from "@/assets/ph.jpg"; // placeholder image

const menuItems = [
  { name: "Users", icon: <Users className="h-4 w-4" />, path: "/admin/users" },
  {
    name: "Admins",
    icon: <ShieldCheck className="h-4 w-4" />,
    path: "/admin/admins",
  },
  {
    name: "Knowledge Base",
    icon: <BookOpen className="h-4 w-4" />,
    path: "/admin/knowledge",
  },
  {
    name: "Unanswered Queries",
    icon: <HelpCircle className="h-4 w-4" />,
    path: "/admin/unanswered",
  },
];

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();

  // 🧩 Get stored admin info
  const adminData = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const adminName =
    adminData?.firstName && adminData?.lastName
      ? `${adminData.firstName} ${adminData.lastName}`
      : "Admin User";
  const adminEmail = adminData?.email || "admin@biome.ai";
  const profileImage = adminData?.profile
    ? `${import.meta.env.VITE_IMAGE_URL}${adminData.profile}`
    : PH;

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  return (
    <aside className="h-screen w-[280px] shrink-0 rounded-2xl bg-white shadow-sm flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center py-6 border-b border-gray-100">
        <img src={logo} alt="Biome Logo" className="h-12 object-contain" />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium transition ${
                isActive
                  ? "bg-[#EEF2FF] text-[#3B68F6] border-l-4 border-[#3B68F6]"
                  : "text-gray-700 hover:bg-gray-50"
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* 👇 Profile Section (Moved Down) */}
      <div className="border-t border-gray-100 px-5 py-5 flex flex-col items-center text-center">
        <img
          src={profileImage}
          alt="Admin"
          className="h-12 w-12 rounded-full object-cover border border-gray-200 mb-3"
        />
        <h2 className="text-[15px] font-semibold text-gray-800">{adminName}</h2>
        <p className="text-[13px] text-gray-500">{adminEmail}</p>

        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `mt-3 flex items-center justify-center gap-2 rounded-lg px-4 py-[8px] text-[14px] font-medium transition w-full ${
              isActive
                ? "bg-[#EEF2FF] text-[#3B68F6] border border-[#3B68F6]"
                : "text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`
          }
        >
          <UserCog className="h-4 w-4" /> My Profile
        </NavLink>
      </div>

      {/* Logout */}
      <div className="border-t border-gray-100 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[14px] text-red-600 hover:bg-red-100 transition"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
