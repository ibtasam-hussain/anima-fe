// src/pages/admin/UsersPage.tsx
import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  createUser,
  editUser,
  deleteUser as deleteUserApi,
  getAllUsers,
} from "@/apis/userAndAdminApi";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ✅ Fetch users from API
  useEffect(() => {
    (async () => {
      try {
        const data = await getAllUsers();
        setUsers(data.users);
      } catch {
        toast.error("Failed to load users");
      }
    })();
  }, []);

  const handleAdd = () => {
    setEditingUser(null);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      confirmPassword: "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUserApi(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted successfully");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Save new or edited user
// ✅ Save new or edited user
const handleSave = async () => {
  const { firstName, lastName, email, password, confirmPassword } = form;

  if (!firstName || !email || (!editingUser && !password))
    return toast.error("Please fill all required fields");

  if (!editingUser && password !== confirmPassword)
    return toast.error("Passwords do not match");

  try {
    const payload = {
      firstName,
      lastName,
      email,
      password: password || undefined, // only send if provided
      role: "user", // 👈 hardcoded role
    };

    if (editingUser) {
      await editUser(editingUser.id, payload);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, ...payload } : u
        )
      );
      toast.success("User updated");
    } else {
      const data = await createUser(payload);
      setUsers((prev) => [...prev, data.user]);
      toast.success("User added");
    }

    setModalOpen(false);
  } catch {
    toast.error("Failed to save user");
  }
};


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[20px] font-semibold text-gray-900">Users</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#3B68F6] text-white px-4 py-2 rounded-full hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> Add User
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
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-5 py-3">{u.firstName}</td>
                <td className="px-5 py-3">{u.lastName}</td>
                <td className="px-5 py-3">{u.email}</td>
                <td className="px-5 py-3">{u.role}</td>
                <td className="px-5 py-3 text-right flex justify-end gap-3">
                  <button
                    onClick={() => handleEdit(u)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
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
              {editingUser ? "Edit User" : "Add User"}
            </h2>
<div className="space-y-4">
  {/* First Name */}
  <div>
    <label className="block text-sm text-gray-600 mb-1">First Name</label>
    <input
      type="text"
      name="firstName"
      placeholder="Enter first name"
      value={form.firstName}
      onChange={handleChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Last Name */}
  <div>
    <label className="block text-sm text-gray-600 mb-1">Last Name</label>
    <input
      type="text"
      name="lastName"
      placeholder="Enter last name"
      value={form.lastName}
      onChange={handleChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Email */}
  <div>
    <label className="block text-sm text-gray-600 mb-1">Email</label>
    <input
      type="email"
      name="email"
      placeholder="Enter email"
      value={form.email}
      onChange={handleChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Password */}
  <div>
    <label className="block text-sm text-gray-600 mb-1">Password</label>
    <input
      type="password"
      name="password"
      placeholder="Enter password"
      value={form.password}
      onChange={handleChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Confirm Password */}
  <div>
    <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
    <input
      type="password"
      name="confirmPassword"
      placeholder="Confirm password"
      value={form.confirmPassword}
      onChange={handleChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Buttons */}
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
      {editingUser ? "Update" : "Create"}
    </button>
  </div>
</div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
