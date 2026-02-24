import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export const SignupForm = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Offline/local-only signup/login: create a demo user in localStorage.
      const user = {
        firstName,
        lastName,
        email,
        role: "user",
      };

      localStorage.setItem("auth_token", "offline-user-token");
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Signup successful 🎉");
      toast.success("Logged in locally ✅");

      setTimeout(() => {
        window.location.href = "/";
      }, 900);
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      {/* Page container: responsive paddings & centered content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14">
        <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-2xl space-y-8">
          {/* Brand heading */}
          <div className="flex items-center justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              ANIMAAI
            </h1>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2 sm:space-y-3">
            <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-foreground">
              Signup to Your Account
            </h2>
       
          </div>

          {/* Form card-ish spacing */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 sm:space-y-6 mt-4 sm:mt-6"
          >
            {/* Name grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="First Name"
                  type="text"
                  className="h-12 sm:h-14 text-base"
                  autoComplete="given-name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Last Name"
                  type="text"
                  className="h-12 sm:h-14 text-base"
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

            {/* Email + Password grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="Email Address"
                  type="email"
                  className="h-12 sm:h-14 text-base"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    className="h-12 sm:h-14 text-base pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-medium flex items-center justify-between px-5 sm:px-6"
            >
              <span>{loading ? "Signing up..." : "Signup to Your Account"}</span>
              <ArrowRight className="h-5 w-5" />
            </Button>

            <p className="mt-2 text-center text-xs sm:text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-[#3B68F6] font-medium hover:underline">
                Login
              </Link>
            </p>
          </form>

          {/* Footer */}
          <div className="text-center text-xs sm:text-sm text-muted-foreground pb-4 sm:pb-6 space-x-2 sm:space-x-6">
            <a href="#" className="hover:text-foreground transition-colors">Terms and conditions</a>
            <span className="hidden sm:inline">•</span>
            <a href="#" className="hover:text-foreground transition-colors">Privacy policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};
