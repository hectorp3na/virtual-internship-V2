import React from "react";
import SearchBar from "../../components/SearchBar";
import Sidebar from "../../components/Sidebar";
import SelectedForYou from "../../components/SelectedForYou";
import RecommendedForYou from "../../components/RecommendedForYou";
import SuggestedBooks from "../../components/SuggestedBooks";

export default function ForYouPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className=" bg-white ">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 py-6 px-8 ml-[200px] overflow-y-auto p">
        <div className="border-b border-[#e1e7ea] mb-6 w-full">
        <SearchBar  />
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
