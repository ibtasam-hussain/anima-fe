import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import biomeLogoImage from "@/assets/logo.png";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; 
const BASE_URL = import.meta.env.VITE_BASE_URL || process.env.Base_url;
console.log(BASE_URL);

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
          "h-14 w-full rounded-md border border-gray-200 bg-white",
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

type SocialButtonProps = {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
};
const SocialButton: React.FC<SocialButtonProps> = ({
  icon,
  children,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-14 w-full rounded-md border border-gray-200 bg-white",
        "px-5 text-[15px] font-medium text-gray-900",
        "hover:bg-gray-50 active:bg-gray-100 transition",
        "flex items-center justify-start",
      ].join(" ")}
    >
      <span
        className={[
          "mr-3 flex h-9 w-9 items-center justify-center",
          "rounded-full border border-gray-300 bg-white",
          "shrink-0",
        ].join(" ")}
      >
        {icon}
      </span>
      <span className="truncate">{children}</span>
    </button>
  );
};

const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className = "", children, ...props }) => {
  return (
    <button
      {...props}
      className={[
        "h-14 w-full rounded-md bg-[#3B68F6] text-white",
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

const Header: React.FC = () => (
  <header className="mt-10">
    <div className="mx-auto flex max-w-7xl items-center justify-center">
<div className="flex items-center justify-center">
  <img
    src={biomeLogoImage}
    alt="Microbiome Logo"
    className="w-80 md:w-[28rem] object-contain"
  />
</div>
    </div>
  </header>
);

const Footer: React.FC = () => (
  <footer className="py-10">
    <div className="mx-auto max-w-7xl px-4">
      <p className="text-center text-sm text-gray-500">
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

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      }, 1200);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong ❌");
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <Header />

      <main className="mx-auto flex max-w-7xl flex-col items-center px-4">
        {/* Headings */}
        <section className="w-full max-w-4xl text-center">
          <h1 className="text-[28px] leading-tight mt-16 font-semibold tracking-tight md:text-[36px]">
            Login to Your Account
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-gray-500">
            Vorem ipsum dolor sit amet, consectetur adipiscing elit. Vorem ipsum
            dolor sit amet, consectetur adipiscing elit.
          </p>
        </section>

        {/* Form + Social grid */}
        <section className="mt-20 w-full max-w-3xl">
          <form
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={handleLogin}
          >
            {/* Row 1 */}
            <div className="md:col-span-1">
              <Input
                id="email"
                name="email"
                label="Email Address"
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                required
              />
            </div>
            <div className="md:col-span-1">
              <a
                href={`${BASE_URL}social-login/google`}
                className=""
              >
                <SocialButton
                  icon={<FcGoogle className="h-5 w-5" style={{ filter: "grayscale(100%) brightness(0)" }} />
}
                >
                  Sign in with Google
                </SocialButton>
              </a>
            </div>

            {/* Row 2 */}
<div className="md:col-span-1 relative">
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
    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
  >
    {showPassword ? (
      <Eye className="h-4 w-4" />
    ) : (
      (
      <EyeOff className="h-4 w-4" />
    )
    )}
  </button>
</div>

            <div className="md:col-span-1">
              <a
                href={`${BASE_URL}social-login/facebook`}
              >
                <SocialButton icon={<FaFacebookF className="h-4 w-4 text-black" />}>
                  Sign in with Facebook
                </SocialButton>
              </a>
            </div>

            {/* Row 3 */}
            <div className="md:col-span-2">
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login to Your Account"}
              </PrimaryButton>
              <p className="mt-2 text-xs text-gray-500">
                Don’t have an account yet?{" "}
                <Link
                  to="/signup"
                  className="text-[#3B68F6] font-medium hover:underline"
                >
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
