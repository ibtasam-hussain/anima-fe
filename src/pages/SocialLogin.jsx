import { useEffect } from "react";

export default function SocialLogin() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("auth_token", token);
      // redirect to dashboard or home
      window.location.href = "/";
    }
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <h2 className="text-xl">Logging you in...</h2>
    </div>
  );
}
