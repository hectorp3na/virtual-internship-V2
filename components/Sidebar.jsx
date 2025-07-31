"use client"

import { usePathname } from "next/navigation";
import React from "react";
import { useState } from "react";
import {
  FiHome,
  FiBook,
  FiStar,
  FiSearch,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
} from "react-icons/fi";

const fontSizes = [
  { size: "small", label: "Aa", px: 16 },
  { size: "medium", label: "Aa", px: 18 },
  { size: "large", label: "Aa", px: 22 },
  { size: "xlarge", label: "Aa", px: 26 },
];


const Sidebar = ({ activeSize, setActiveSize }) => {
  const pathname = usePathname();

   const isPlayerPage =
    /^\/player\/[^/]+$/.test(pathname);
  

  const menuLinksTop = [
    {
      href: "/for-you",
      text: "For you",
      icon: <FiHome />,
      active: pathname === "/for-you",
    },
    {
      href: "/library",
      text: "My Library",
      icon: <FiBook />,
      active: pathname === "/library",
    },
    {
      text: "Highlights",
      icon: <FiStar />,
      disabled: true,
    },
    {
      text: "Search",
      icon: <FiSearch />,
      disabled: true,
    },
    
  ];

  const menuLinksBottom = [
    {
      href: "/settings",
      text: "Settings",
      icon: <FiSettings />,
      active: pathname === "/settings",
    },
    {
      text: "Help & Support",
      icon: <FiHelpCircle />,
      disabled: true,
    },
    {
      href: "/logout",
      text: "Logout",
      icon: <FiLogOut />,

    },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo flex items-center">
      <img
    src="https://summarist.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.1b1c490b.png&w=640&q=75"
    alt="Summarist Logo"
    style={{ objectFit: "contain" }}
  />
  <span
    style={{
      marginLeft: 12,
      fontWeight: 700,
      fontSize: 22,
      color: "#1A2B49",
      letterSpacing: "-0.5px",
    }}
  >
 
  </span>
</div>

      <div className="sidebar__wrapper">
        <div className="sidebar__top">
          {menuLinksTop.map((item, i) => (
            <SidebarLink key={i} {...item} />
          ))}
          {isPlayerPage && (
          <div className="flex gap-4 items-end justify-center">
          {fontSizes.map((f) => (
            <button
              key={f.size}
              onClick={() => setActiveSize(f.size)}
              className="flex flex-col items-center focus:outline-none"
            >
              <span
                className={`
                  font-sans font-semibold ${f.svgClass} transition-all
                  ${activeSize === f.size ? "text-[#032b41]" : "text-[#032b41]"}
                `}
                style={{
                  fontSize: f.px,
                  letterSpacing: 1.1,
                }}
              >
                {f.label}
              </span>
              {activeSize === f.size && (
                <div className="w-6 h-1 mt-1 rounded bg-[#2bd97c]" />
              )}
            </button>
          ))}
        </div>
          )}
        </div>  
        <div className="sidebar__bottom">
          {menuLinksBottom.map((item, i) => (
            <SidebarLink key={i} {...item} />
          ))}
        </div>
      </div>
    </aside>
  );
};

const SidebarLink = ({ href, text, icon, active, disabled }) => {
  const Wrapper = href && !disabled ? "a" : "div";
  return (
    <Wrapper
      className={`
        flex items-center gap-3 py-2 px-3 rounded transition
        ${active ? "bg-[#f1f6f4] font-bold" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#f1f6f4]"}
      `}
      href={href || "#"}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      style={{
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </Wrapper>
  );
};

export default Sidebar;
