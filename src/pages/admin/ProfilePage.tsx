import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import PH from "@/assets/ph.jpg";
import { getProfile, setupProfile, changePassword } from "@/apis/userAndAdminApi";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye and eye-slash icons

const ImageUrl = import.meta.env.VITE_IMAGE_URL as string;

const ProfilePage: React.FC = () => {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Load profile on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        setProfile((p) => ({
          ...p,
          firstName: data?.user?.firstName || "",
          lastName: data?.user?.lastName || "",
          email: data?.user?.email || "",
        }));
        if (data?.user?.profile) {
          setPreview(`${ImageUrl}${data.user.profile}`);
          console.log("PROFILE IMAGE URL:", `${ImageUrl}${data.user.profile}`);
        }
      } catch {
        toast.error("Failed to load profile");
      }
    })();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const formData = new FormData();
      formData.append("firstName", profile.firstName);
      formData.append("lastName", profile.lastName);
      if (fileRef.current?.files?.[0]) {
        formData.append("profilePic", fileRef.current.files[0]);
      }

      const res = await setupProfile(formData);

      // refresh cached profile
      const updated = await getProfile();
      localStorage.setItem("adminUser", JSON.stringify(updated.user));
      window.dispatchEvent(new Event("admin-profile-updated"));

      toast.success(res?.message || "Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!profile.password || !profile.confirmPassword) {
      return toast.error("Both password fields are required");
    }
    if (profile.password !== profile.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setChangingPwd(true);
      const res = await changePassword(profile.password);
      toast.success(res?.message || "Password changed successfully");
      setProfile((p) => ({ ...p, password: "", confirmPassword: "" }));
    } catch {
      toast.error("Failed to change password");
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-[22px] font-semibold text-gray-900 mb-6">My Profile</h1>

      {/* --- PROFILE FORM (image + basic info) --- */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSaveProfile();
        }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col md:flex-row items-start gap-10"
      >
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div onClick={() => fileRef.current?.click()} className="relative cursor-pointer">
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

        {/* Profile fields */}
        <div className="flex-1 space-y-5 w-full">
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
            type="submit"
            disabled={savingProfile}
            className="rounded-full bg-[#3B68F6] text-white px-5 py-2 text-sm hover:brightness-110 disabled:opacity-60"
          >
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* --- PASSWORD FORM --- */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handlePasswordChange();
        }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mt-8"
      >
        <h2 className="text-[18px] font-semibold text-gray-900 mb-4">Change Password</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={profile.password}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-2 right-0 mt-2 mr-3 text-md text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Toggle eye icon */}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={profile.confirmPassword}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm mt-1"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-2 right-0 mt-2 mr-3 text-md text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Toggle eye icon */}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={changingPwd}
          className="mt-5 rounded-full bg-gray-700 text-white px-5 py-2 text-sm hover:brightness-110 disabled:opacity-60"
        >
          {changingPwd ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
