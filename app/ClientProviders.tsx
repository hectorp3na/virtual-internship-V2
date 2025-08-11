"use client";
import React from "react";
import { AuthModalProvider, useAuthModal } from "../contexts/AuthModalContext";
import { AuthProvider } from "@/hooks/useAuth";
import LoginModal from "../components/LoginModal";
import SignUpModal from "../components/SignUpModal";


export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthModalProvider>
        {children}
        <GlobalAuthModals />
      </AuthModalProvider>
    </AuthProvider>
  );
}

function GlobalAuthModals() {
  const { showAuth, mode, openLogin, openSignup, closeAuth } = useAuthModal();

  if (!showAuth) return null;

  return mode === "login" ? (
    <LoginModal onClose={closeAuth} onOpenSignup={openSignup} />
  ) : (
    <SignUpModal onClose={closeAuth} onOpenLogin={openLogin} />
  );
}

