"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";


interface LoginModalProps {
  onClose: () => void;
  onOpenSignup: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onOpenSignup }) => {
  const router = useRouter();
  const {
    login,
    register,
    loginAsGuest,
    loginWithGoogle,
    logout,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const finish = () => {
    onClose();
    router.push("/for-you")

  };

  /** Guest Login */
  const handleGuestLogin = async () => {
    try {
      await loginAsGuest();
      setError("");
      finish(); 
    } catch (error) {
      console.error("Guest login failed:", error);
      setError("Guest login failed. Try again.");
    }
  };


  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      setError("");
      finish();
    } catch (err: any) {
      console.error("Google login error:", err);
      setError("Google login failed. Please try again.");
    }
  };

  /** Login */
  const handleLogin = async () => {
    try {
      await login(email, password);
      setError("");
      finish();
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-email") setError("Invalid email address.");
      else if (err.code === "auth/user-not-found") setError("User not found.");
      else if (err.code === "auth/wrong-password") setError("Incorrect password.");
      else setError("Login failed. Please try again.");
    }
  };

  /** Register */
  const handleRegister = async () => {
    try {
      await register(email, password);
      setError("");
      finish(); 
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === "auth/invalid-email") setError("Invalid email address.");
      else if (err.code === "auth/email-already-in-use")
        setError("Email already in use.");
      else setError("Registration failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    await logout();
  
  };

  return (
    <div className="sidebar__overlay" onClick={onClose}>
      <div className="auth__wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="auth">
          <div className="auth__content">
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

            <div className="auth__title">Log into Summarist</div>

            {/* Guest Login Button */}
            <button
              type="button"
              className="btn guest__btn--wrapper"
              onClick={handleGuestLogin}
            >
              <div>Login as a Guest</div>
            </button>

            {/* Separator */}
            <div className="auth__separator">
              <span className="auth__separator--text">or</span>
            </div>

            <button
              type="button"
              className="btn google__btn--wrapper"
              onClick={handleGoogleLogin}
            >
              <figure className="google__icon--mask">
                <img alt="google" src="/google.png" />
              </figure>
              <div>Login with Google</div>
            </button>

            {/* Separator */}
            <div className="auth__separator">
              <span className="auth__separator--text">or</span>
            </div>

            {/* Error Message */}
            {error && <div className="text-red-500 mb-2">{error}</div>}

            {/* Login Form */}
            <div className="auth__main--form">
              <input
                className="auth__main--input"
                type="text"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="auth__main--input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button type="button" className="btn" onClick={handleLogin}>
                <span>Login</span>
              </button>

              {/* If you expose registration here, wire this button to handleRegister */}
              {/* <button type="button" className="btn" onClick={handleRegister}>
                <span>Create account</span>
              </button> */}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="auth__forgot--password">Forgot your password?</div>
          <button type="button" className="auth__switch--btn" 
          onClick={onOpenSignup}>
            Don't have an account?
          </button>

        </div>
      </div>
    </div>
  );
};

export default LoginModal;
