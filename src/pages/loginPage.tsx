import React, { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import biomeLogoImage from "@/assets/logo.png";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL || process.env.Base_url;
console.log(BASE_URL);

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

/* ---------- Social Action (link or button) ---------- */
type SocialActionProps = {
  icon: React.ReactNode;
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
};
const SocialAction: React.FC<SocialActionProps> = ({
  icon,
  children,
  href,
  onClick,
}) => {
  const cls = [
    "h-12 sm:h-14 w-full rounded-md border border-gray-200 bg-white",
    "px-5 text-[15px] font-medium text-gray-900",
    "hover:bg-gray-50 active:bg-gray-100 transition",
    "flex items-center justify-start",
  ].join(" ");
  const IconWrap = ({ children }: { children: React.ReactNode }) => (
    <span
      className={[
        "mr-3 flex h-9 w-9 items-center justify-center",
        "rounded-full border border-gray-300 bg-white shrink-0",
      ].join(" ")}
    >
      {children}
    </span>
  );
  if (href) {
    return (
      <a href={href} className={cls}>
        <IconWrap>{icon}</IconWrap>
        <span className="truncate">{children}</span>
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      <IconWrap>{icon}</IconWrap>
      <span className="truncate">{children}</span>
    </button>
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
      <div className="flex items-center justify-center">
        <img
          src={biomeLogoImage}
          alt="Microbiome Logo"
          className="w-40 sm:w-60 md:w-72 object-contain"
        />
      </div>
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
      const res = await fetch(`${BASE_URL}users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      toast.success(data.message || "Login successful 🎉");
      localStorage.setItem("auth_token", data.token);

      setTimeout(() => {
        window.location.href = "/";
      }, 900);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong ❌");
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

        {/* Form + Social grid */}
        <section className="mt-10 sm:mt-14 w-full max-w-3xl">
<form
  className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
  onSubmit={handleLogin}
>
  {/* LEFT: Inputs (Email, Password) */}
  <div className="md:col-span-1 space-y-4">
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
  </div>

  {/* RIGHT: Social (Google, Facebook) */}
  <div className="md:col-span-1 space-y-4">
    <SocialAction
      href={`${BASE_URL}social-login/google`}
      icon={<FcGoogle className="h-5 w-5" />}
    >
      Sign in with Google
    </SocialAction>

    <SocialAction
      href={`${BASE_URL}social-login/facebook`}
      icon={<FaFacebookF className="h-4 w-4 text-black" />}
    >
      Sign in with Facebook
    </SocialAction>
  </div>

  {/* Submit */}
  <div className="md:col-span-2">
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
