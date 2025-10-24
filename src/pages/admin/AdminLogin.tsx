import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import logo from "@/assets/logo.png";
import { adminLogin } from "@/apis/userAndAdminApi"; // ✅ import API

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password)
      return toast.error("Please enter all fields");

    try {
      setLoading(true);
      const data = await adminLogin(form);
      toast.success("Login successful ✅");

      // 🪄 Save token for authenticated routes
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));

      // navigate to admin/users
      navigate("/admin/users");
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e9f1f8] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-md p-8">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Biome Logo" className="h-12 w-auto mb-2" />
          <h1 className="text-[22px] font-semibold text-gray-900">
            Admin Login
          </h1>
          <p className="text-sm text-gray-500">Welcome back, admin 👋</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3B68F6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3B68F6]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#3B68F6] text-white py-2.5 font-medium hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
