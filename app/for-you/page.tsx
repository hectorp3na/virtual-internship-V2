"use client";

import React, { useState } from "react";

import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "@/hooks/useAuth"; 
import SearchBar from "../../components/SearchBar";
import Sidebar from "../../components/Sidebar";
import SelectedForYou from "../../components/SelectedForYou";
import RecommendedForYou from "../../components/RecommendedForYou";
import SuggestedBooks from "../../components/SuggestedBooks";
import LoginModal from "../../components/LoginModal"; 
import SignUpModal from "../../components/SignUpModal";


function useAuthModals() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const openLogin = () => { setIsSignUpModalOpen(false); setIsLoginModalOpen(true); };
  const openSignup = () => { setIsLoginModalOpen(false); setIsSignUpModalOpen(true); };
  const closeLogin = () => setIsLoginModalOpen(false);
  const closeSignup = () => setIsSignUpModalOpen(false);

  return { isLoginModalOpen, isSignUpModalOpen, openLogin, openSignup, closeLogin, closeSignup };
}

export default function ForYouPage() {
  const { user: currentUser } = useAuth();
  const [activeSize, setActiveSize] = useState<"small" | "medium" | "large" | "xlarge">("small");
  const [sidebarOpen, setSidebarOpen] = useState(false);

 const {
    isLoginModalOpen,
    isSignUpModalOpen,
    openLogin,
    openSignup,
    closeLogin,
    closeSignup,
  } = useAuthModals();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:block bg-white">
        <Sidebar
          activeSize={activeSize}
          setActiveSize={setActiveSize}
          onLogoutClick={handleLogout}
          onLoginClick={openLogin}
          currentUser={currentUser}
        />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-transparent bg-opacity-40 transition-opacity" onClick={() => setSidebarOpen(false)} />
          <aside
            className="relative z-50 h-full w-[375px] max-w-full bg-[#f6f7fb] flex flex-col shadow-2xl animate-slide-in-left"
            style={{ minWidth: 320 }}
          >
            <Sidebar
              isDrawer
              activeSize={activeSize}        
              setActiveSize={setActiveSize}      
              onLogoutClick={handleLogout}
              onLoginClick={openLogin}
              currentUser={currentUser}
            />
          </aside>
        </div>
      )}

           {/* Auth Modals */}
      {isLoginModalOpen && (
        <LoginModal onClose={closeLogin} onOpenSignup={openSignup} />
      )}
      {isSignUpModalOpen && (
        <SignUpModal onClose={closeSignup} onOpenLogin={openLogin} />
      )}


      {/* Main Content */}
      <main className="flex-1 py-6 px-4 ml-0 md:ml-[200px] overflow-y-auto">
        <div className="border-b border-[#e1e7ea] mb-6 w-full flex items-center justify-end">
          <div className="flex items-center gap-2">
            <SearchBar />
            <button
              className="block md:hidden ml-3 p-2 mb-6"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg width="32" height="32" fill="none" stroke="#032b41" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-10">
          <SelectedForYou />
        </div>
        <div className="mt-10">
          <RecommendedForYou />
        </div>
        <div className="mt-10">
          <SuggestedBooks />
        </div>
      </main>
    </div>
  );
}
