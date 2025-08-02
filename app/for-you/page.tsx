"use client"

import React from "react";
import { useState } from "react";
import SearchBar from "../../components/SearchBar";
import Sidebar from "../../components/Sidebar";
import SelectedForYou from "../../components/SelectedForYou";
import RecommendedForYou from "../../components/RecommendedForYou";
import SuggestedBooks from "../../components/SuggestedBooks";

export default function ForYouPage() {
const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className=" hidden md:block bg-white ">
        <Sidebar />
      </aside>

       {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white h-full shadow-xl z-50">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 py-6 px-4 ml-0 md:ml-[200px] overflow-y-auto p">
        <div className="border-b border-[#e1e7ea] mb-6 w-full flex items-center justify-end">
          <div className="flex items-center gap-2">
        <SearchBar />
           {/* Burger menu for mobile */}
          <button
            className="block md:hidden ml-3 p-2 mb-6"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg width="32" height="32" fill="none" stroke="#032b41" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16"/>
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
