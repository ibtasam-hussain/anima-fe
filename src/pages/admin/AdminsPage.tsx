import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getAllAdmins,
  createUser,
  editUser,
  deleteUser as deleteUserApi,
} from "@/apis/userAndAdminApi";

interface Admin {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const AdminsPage: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin", // default
  });

  // ✅ Fetch all admins
  useEffect(() => {
    (async () => {
      try {
        const data = await getAllAdmins();
        setAdmins(data.users);
      } catch {
        toast.error("Failed to load admins");
      }
    })();
  }, []);

  const handleAdd = () => {
    setEditingAdmin(null);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "admin",
    });
    setModalOpen(true);
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setForm({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      password: "",
      confirmPassword: "",
      role: admin.role,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUserApi(id);
      setAdmins((prev) => prev.filter((a) => a.id !== id));
      toast.success("Admin deleted");
    } catch {
      toast.error("Failed to delete admin");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const { firstName, lastName, email, password, confirmPassword, role } = form;

    if (!firstName || !email || (!editingAdmin && !password))
      return toast.error("Please fill all required fields");

    if (!editingAdmin && password !== confirmPassword)
      return toast.error("Passwords do not match");

    try {
      const payload = {
        firstName,
        lastName,
        email,
        password: password || undefined,
        role,
      };

      if (editingAdmin) {
        await editUser(editingAdmin.id, payload);
        setAdmins((prev) =>
          prev.map((a) =>
            a.id === editingAdmin.id ? { ...a, ...payload } : a
          )
        );
        toast.success("Admin updated");
      } else {
        const data = await createUser(payload);
        setAdmins((prev) => [...prev, data.user]);
        toast.success("Admin added");
      }

      setModalOpen(false);
    } catch {
      toast.error("Failed to save admin");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[20px] font-semibold text-gray-900">Admins</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#3B68F6] text-white px-4 py-2 rounded-full hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> Add Admin
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-3">First Name</th>
              <th className="px-5 py-3">Last Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-5 py-3">{a.firstName}</td>
                <td className="px-5 py-3">{a.lastName}</td>
                <td className="px-5 py-3">{a.email}</td>
                <td className="px-5 py-3 capitalize">{a.role}</td>
                <td className="px-5 py-3 text-right flex justify-end gap-3">
                  <button
                    onClick={() => handleEdit(a)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🧱 Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {editingAdmin ? "Edit Admin" : "Add Admin"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 🔐 Role */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 capitalize"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-[#3B68F6] text-white hover:brightness-110"
                >
                  {editingAdmin ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsPage;
