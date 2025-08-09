"use client";
import { useState, useEffect, useContext, createContext } from "react";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from "firebase/auth";


import { auth } from "../../firebase";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const friendlyThrow = (code?: string, fallback = "Request failed. Please try again.") => {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        throw new Error("Invalid email or password.");
      case "auth/invalid-email":
        throw new Error("Please enter a valid email address.");
      case "auth/too-many-requests":
        throw new Error("Too many attempts. Try again later.");
      case "auth/popup-closed-by-user":
        throw new Error("Sign-in was canceled.");
      default:
        throw new Error(fallback);
    }
  };

  /** Login with email/password */
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      console.error("Login error:", err?.code, err?.message);
      friendlyThrow(err?.code, "Login failed. Please try again.");
    }
  };

  /** Register with email/password */
  const register = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      console.error("Register error:", err?.code, err?.message);
      friendlyThrow(err?.code, "Registration failed. Please try again.");
    }
  };

  /** Guest login (ensure this user exists in the SAME Firebase project) */
  const loginAsGuest = async () => {
    try {
      const guestEmail = "guest@example.com";
      const guestPassword = "guest123";
      await signInWithEmailAndPassword(auth, guestEmail, guestPassword);
    } catch (err: any) {
      console.error("Guest login error:", err?.code, err?.message);
      friendlyThrow(err?.code, "Guest login failed. Please try again.");
    }
  };

  /** Google login */
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google login error:", err?.code, err?.message);
      friendlyThrow(err?.code, "Google login failed. Please try again.");
    }
  };

  /** Logout */
  const logout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // optional
    } catch (err: any) {
      console.error("Logout error:", err?.code, err?.message);
      friendlyThrow(err?.code, "Logout failed. Please try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginAsGuest, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
