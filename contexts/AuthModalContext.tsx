"use client"
import React, { createContext, useContext, useState } from "react";

const AuthModalContext = createContext<{
  showAuth: boolean;
  openAuth: () => void;
  closeAuth: () => void;
}>({
  showAuth: false,
  openAuth: () => {},
  closeAuth: () => {},
});

export function useAuthModal() {
  return useContext(AuthModalContext);
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [showAuth, setShowAuth] = useState(false);

  const openAuth = () => setShowAuth(true);
  const closeAuth = () => setShowAuth(false);

  return (
    <AuthModalContext.Provider value={{ showAuth, openAuth, closeAuth }}>
      {children}
    </AuthModalContext.Provider>
  );
}
