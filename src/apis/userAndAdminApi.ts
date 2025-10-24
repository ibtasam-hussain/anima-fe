// src/services/userApi.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_BASE_URL as string;

// ✅ Create Axios instance
const adminAxios = axios.create({
  baseURL: API_BASE,
});

// ✅ Automatically attach JWT token to all requests
adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Admin login (no token needed)
export const adminLogin = async (data: { email: string; password: string }) => {
  const res = await axios.post(`${API_BASE}users/admin-login`, data);
  return res.data;
};

// ✅ Create user
export const createUser = async (data: any) => {
  const res = await adminAxios.post(`users/create`, data);
  return res.data;
};

// ✅ Edit user
export const editUser = async (id: number, data: any) => {
  const res = await adminAxios.put(`users/update-user/${id}`, data);
  return res.data;
};

// ✅ Delete user
export const deleteUser = async (id: number) => {
  const res = await adminAxios.delete(`users/delete-user/${id}`);
  return res.data;
};

// ✅ Get all users with pagination
export const getAllUsers = async (page = 1, limit = 10) => {
  const res = await adminAxios.get(`users/all-users?page=${page}&limit=${limit}`);
  return res.data;
};


export const getAllAdmins = async (page = 1, limit = 10) => {
  const res = await adminAxios.get(`users/all-admins?page=${page}&limit=${limit}`);
  return res.data;
};

export const getProfile = async () => {
  const res = await adminAxios.get("users/get-profile");
  return res.data;
};

// 🔹 Update profile (with optional image)
export const setupProfile = async (data: FormData) => {
  const res = await adminAxios.post("users/setup-profile", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🔹 Change password
export const changePassword = async (newPassword: string) => {
  const res = await adminAxios.post("users/change-password", { newPassword });
  return res.data;
};


export const getAllUnansweredQueries = async (page = 1, limit = 10) => {
  const res = await adminAxios.get(`users/all-queries?page=${page}&limit=${limit}`);
  return res.data;
};

// ✅ Mark a query as closed
export const markAsClosed = async (id: number) => {
  const res = await adminAxios.delete(`users/markAsClosed/${id}`);
  return res.data;
};