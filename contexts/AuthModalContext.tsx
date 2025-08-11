"use client";

import { createContext, useContext, useState } from "react";

type Mode = "login" | "signup";
type Ctx = {
  showAuth: boolean;
  mode: Mode;
  openLogin: () => void;
  openSignup: () => void;
  closeAuth: () => void;
};

const AuthModalCtx = createContext<Ctx | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const openLogin = () => { setMode("login"); setShowAuth(true); };
  const openSignup = () => { setMode("signup"); setShowAuth(true); };
  const closeAuth = () => setShowAuth(false);

  return (
    <AuthModalCtx.Provider value={{ showAuth, mode, openLogin, openSignup, closeAuth }}>
      {children}
    </AuthModalCtx.Provider>
  );
}

export const useAuthModal = () => {
  const ctx = useContext(AuthModalCtx);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
};
