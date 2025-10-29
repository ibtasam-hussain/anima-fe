// src/pages/admin/ProfilePage.tsx
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import PH from "@/assets/ph.jpg";
import {
  getProfile,
  setupProfile,
  changePassword,
} from "@/apis/userAndAdminApi";

const ProfilePage: React.FC = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
const ImageUrl = import.meta.env.VITE_IMAGE_URL as string;
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ✅ Fetch profile data on load
  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        setProfile({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          email: data.user.email || "",
          password: "",
          confirmPassword: "",
        });
        if (data.user.profile) setPreview(`${import.meta.env.VITE_IMAGE_URL}${data.user.profile}`);
      } catch {
        toast.error("Failed to load profile");
      }
    })();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

const handleSaveProfile = async () => {
  try {
    setLoading(true);
    const formData = new FormData();
    formData.append("firstName", profile.firstName);
    formData.append("lastName", profile.lastName);
    if (fileRef.current?.files?.[0])
      formData.append("profilePic", fileRef.current.files[0]);

    const res = await setupProfile(formData);

    const updated = await getProfile();
    localStorage.setItem("adminUser", JSON.stringify(updated.user));

    // ✅ TRIGGER RELOAD EVENT
    window.dispatchEvent(new Event("admin-profile-updated"));

    toast.success(res.message || "Profile updated");
  } catch {
    toast.error("Failed to update profile");
  } finally {
    setLoading(false);
  }
};



  // ✅ Change password
  const handlePasswordChange = async () => {
    if (!profile.password || !profile.confirmPassword)
      return toast.error("Both fields are required");
    if (profile.password !== profile.confirmPassword)
      return toast.error("Passwords do not match");

    try {
      setLoading(true);
      const res = await changePassword(profile.password);
      toast.success(res.message || "Password changed successfully");
      setProfile({ ...profile, password: "", confirmPassword: "" });
    } catch {
      toast.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-[22px] font-semibold text-gray-900 mb-6">
        My Profile
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col md:flex-row items-start gap-10">
        {/* 🧍‍♂️ Profile Image Section */}
        <div className="flex flex-col items-center gap-3">
          <div
            onClick={() => fileRef.current?.click()}
            className="relative cursor-pointer"
          >
            <img
              src={preview || PH}
              alt="Profile"
              className="h-28 w-28 rounded-full object-cover border border-gray-200 shadow-sm"
            />
            <div className="absolute bottom-0 right-0 bg-[#3B68F6] text-white text-xs px-2 py-1 rounded-full">
              Change
            </div>
          </div>
          <input
            type="file"
            ref={fileRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* 🧾 Profile Info Section */}
        <div className="flex-1 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">First Name</label>
              <input
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Last Name</label>
              <input
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              disabled
              className="w-full border rounded-md px-3 py-2 text-sm mt-1 bg-gray-50 cursor-not-allowed"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="rounded-full bg-[#3B68F6] text-white px-5 py-2 text-sm hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* 🔒 Password Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mt-8 gap-10">
        <h2 className="text-[18px] font-semibold text-gray-900 mb-4">
          Change Password
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">New Password</label>
            <input
              type="password"
              name="password"
              value={profile.password}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={profile.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm mt-1"
            />
          </div>
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={loading}
          className="mt-5 rounded-full bg-gray-700 text-white px-5 py-2 text-sm hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
