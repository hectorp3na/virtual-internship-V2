"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  onClose: () => void;
  onOpenLogin: () => void;
};

export default function SignUpModal({ onClose, onOpenLogin }: Props) {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      onClose();
      router.push("/for-you");
    } catch (e: any) {
      setError(e?.message || "Google sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await register(email.trim(), password);
      onClose();
      router.push("/for-you");
    } catch (e: any) {
      setError(e?.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sidebar__overlay" onClick={onClose}>
      <div className="auth__wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="auth w-full max-w-[540px] bg-white rounded-md shadow-xl">
          {/* Close Button */}
          <div className="auth__close--btn" onClick={onClose}>
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.2253 4.81108C5.83477 4.42056 5.20161 4.42056 4.81108 4.81108C4.42056 5.20161 4.42056 5.83477 4.81108 6.2253L10.5858 12L4.81114 17.7747C4.42062 18.1652 4.42062 18.7984 4.81114 19.1889C5.20167 19.5794 5.83483 19.5794 6.22535 19.1889L12 13.4142L17.7747 19.1889C18.1652 19.5794 18.7984 19.5794 19.1889 19.1889C19.5794 18.7984 19.5794 18.1652 19.1889 17.7747L13.4142 12L19.189 6.2253C19.5795 5.83477 19.5795 5.20161 19.189 4.81108C18.7985 4.42056 18.1653 4.42056 17.7748 4.81108L12 10.5858L6.2253 4.81108Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>

          <div className="p-6 md:p-8">
            <h2 className="text-center text-[22px] md:text-[24px] font-extrabold text-[#03314b]">
              Sign up to Summarist
            </h2>

            {/* Google button */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="mt-6 w-full h-11 rounded-[6px] !bg-[#4285F4] text-white font-semibold flex items-center justify-center gap-3 hover:brightness-95 active:translate-y-[1px] transition"
              type="button"
            >
              <span className="bg-white rounded-sm p-1">
                <img src="/google.png" alt="Google logo" className="w-5 h-5" />
              </span>
              Sign up with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="h-[1px] flex-1 bg-[#e1e7ea]" />
              <span className="text-sm text-[#6b7c85]">or</span>
              <div className="h-[1px] flex-1 bg-[#e1e7ea]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="w-full h-11 rounded-[6px] border border-[#d8e0e3] px-3 focus:outline-none focus:ring-2 focus:ring-[#2bd97c]"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full h-11 rounded-[6px] border border-[#d8e0e3] px-3 focus:outline-none focus:ring-2 focus:ring-[#2bd97c]"
              />
              {error && <div className="text-sm text-red-600">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-[6px] !bg-[#2bd97c] text-[#032b41] font-semibold hover:opacity-90 active:translate-y-[1px] transition"
              >
                {loading ? "Signing up..." : "Sign up"}
              </button>
            </form>

            <div className="text-center mt-4 text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onOpenLogin}
                className="text-[#0055ff] hover:underline"
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
