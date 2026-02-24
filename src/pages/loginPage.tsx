import React, { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

/* ---------- Inputs ---------- */
const Input: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }
> = ({ label, id, className = "", ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        aria-label={label}
        className={[
          "h-12 sm:h-14 w-full rounded-md border border-gray-200 bg-white",
          "px-4 text-base text-gray-900 placeholder:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-black/80",
          "transition-shadow",
          className,
        ].join(" ")}
        {...props}
      />
    </div>
  );
};

/* ---------- Primary Button ---------- */
const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...props }) => {
  return (
    <button
      {...props}
      className={[
        "h-12 sm:h-14 w-full rounded-md bg-[#3B68F6] text-white",
        "px-5 text-[15px] font-semibold",
        "hover:brightness-105 active:brightness-[1.07]",
        "transition shadow-[0_1px_0_rgba(0,0,0,0.02)]",
        "flex items-center justify-between",
        className,
      ].join(" ")}
    >
      <span>{children}</span>
      <ArrowRight className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};

/* ---------- Header / Footer ---------- */
const Header: React.FC = () => (
  <header className="pt-8 sm:pt-10">
    <div className="mx-auto flex max-w-7xl items-center justify-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
        ANIMAAI
      </h1>
    </div>
  </header>
);

const Footer: React.FC = () => (
  <footer className="py-8 sm:py-10">
    <div className="mx-auto max-w-7xl px-4">
      <p className="text-center text-xs sm:text-sm text-gray-500">
        <a href="#" className="hover:underline">
          Terms and conditions
        </a>{" "}
        <span className="px-2">•</span>
        <a href="#" className="hover:underline">
          Privacy policy
        </a>
      </p>
    </div>
  </footer>
);

/* ---------- Page ---------- */
const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Offline/local-only login: accept any credentials and
      // store a demo token + user in localStorage.
      const nameFromEmail =
        email && email.includes("@") ? email.split("@")[0] : "User";

      localStorage.setItem("auth_token", "offline-user-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          firstName: nameFromEmail,
          lastName: "",
          email,
          role: "user",
        })
      );

      toast.success("Logged in locally 🎉");

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
    <div className="min-h-dvh bg-white text-gray-900 antialiased">
      <Header />

      <main className="mx-auto flex max-w-7xl flex-col items-center px-4 sm:px-6 lg:px-8">
        {/* Headings */}
        <section className="w-full max-w-4xl text-center">
          <h1 className="mt-10 sm:mt-14 text-2xl sm:text-3xl md:text-[36px] leading-tight font-semibold tracking-tight">
            Login to Your Account
          </h1>
        </section>

        {/* Form */}
        <section className="mt-10 sm:mt-14 w-full max-w-md mx-auto">
          <form
            className="space-y-4 sm:space-y-5"
            onSubmit={handleLogin}
          >
            {/* Email */}
            <Input
      id="email"
      name="email"
      label="Email Address"
      type="email"
      placeholder="Email Address"
      autoComplete="email"
      required
    />

            {/* Password + toggle */}
            <div className="relative">
      <Input
        id="password"
        name="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        autoComplete="current-password"
        required
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
      </button>
    </div>

    {/* Submit */}
    <div>
    <PrimaryButton type="submit" disabled={loading}>
      {loading ? "Logging in..." : "Login to Your Account"}
    </PrimaryButton>
    <p className="mt-2 text-center text-xs sm:text-sm text-gray-500">
      Don’t have an account yet?{" "}
      <Link to="/signup" className="text-[#3B68F6] font-medium hover:underline">
        Signup
      </Link>
              </p>
            </div>
          </form>


        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
