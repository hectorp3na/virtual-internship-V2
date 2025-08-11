"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { AuthModalProvider, useAuthModal } from "../contexts/AuthModalContext";
import LoginModal from "../components/LoginModal";
import SignUpModal from "../components/SignUpModal";

function AuthModalContainer() {
  const { showAuth, mode, closeAuth, openLogin, openSignup } = useAuthModal();
  if (!showAuth) return null;
  return mode === "login" 
    ? <LoginModal onClose={closeAuth} onOpenSignup={openSignup} />
    : <SignUpModal onClose={closeAuth} onOpenLogin={openLogin} />
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthModalProvider>
        {children}
        <AuthModalContainer />
      </AuthModalProvider>
    </AuthProvider>
  );
}
