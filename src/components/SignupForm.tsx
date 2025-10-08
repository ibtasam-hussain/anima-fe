import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import biomeLogoImage from "@/assets/logo.png";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL || process.env.Base_url;

export const SignupForm = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch(`${BASE_URL}users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      toast.success("Signup successful 🎉");

      const loginRes = await fetch(`${BASE_URL}users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.message || "Login failed");

      localStorage.setItem("auth_token", loginData.token);
      toast.success("Logged in automatically ✅");

      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong ❌");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-10"> 
      {/* 🔹 removed justify-center, added pt-10 to move content up */}
      <div className="w-full max-w-2xl space-y-12">

        {/* Logo */}
        <div className="flex items-center justify-center mb-8"> {/* 🔽 reduced mb */}
          <img
            src={biomeLogoImage}
            alt="Microbiome Logo"
            className="w-72 md:w-[26rem] object-contain"
          />
        </div>

        {/* Heading */}
        <div className="text-center space-y-2"> {/* 🔽 reduced spacing */}
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Signup to Your Account
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Vorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Vorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="firstName" name="firstName" placeholder="First Name" type="text" className="h-14 text-base" required />
            <Input id="lastName" name="lastName" placeholder="Last Name" type="text" className="h-14 text-base" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="email" name="email" placeholder="Email Address" type="email" className="h-14 text-base" required />
            <Input id="password" name="password" placeholder="Password" type="password" className="h-14 text-base" required />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-lg font-medium flex items-center justify-between px-6"
          >
            <span>{loading ? "Signing up..." : "Signup to Your Account"}</span>
            <ArrowRight className="h-5 w-5" />
          </Button>

          <p className="mt-3 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#3B68F6] font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </form>

        {/* Social Login */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <a 
            href={`${BASE_URL}social-login/google`} 
            className="flex items-center justify-center gap-2 border rounded-md px-4 py-3 flex-1 hover:bg-gray-50 transition"
          >
            <FaGoogle className="text-black" /> Sign in with Google
          </a>

          <a 
            href={`${BASE_URL}social-login/facebook`} 
            className="flex items-center justify-center gap-2 border rounded-md px-4 py-3 flex-1 hover:bg-gray-50 transition"
          >
            <FaFacebookF className="text-black" /> Sign in with Facebook
          </a>
        </div>

        {/* Footer */}
        <div className="text-center space-x-6 text-sm text-muted-foreground pb-6">
          <a href="#" className="hover:text-foreground transition-colors">
            Terms and conditions
          </a>
          <span>•</span>
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy policy
          </a>
        </div>
      </div>
    </div>
  );
};
