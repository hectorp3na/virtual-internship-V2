"use client";
import { AuthProvider } from "./hooks/useAuth";
import { AuthModalProvider, useAuthModal } from "../contexts/AuthModalContext";
import LoginModal from "../components/LoginModal";

function AuthModalContainer() {
  const { showAuth, closeAuth } = useAuthModal();
  return showAuth ? <LoginModal onClose={closeAuth} /> : null;
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
