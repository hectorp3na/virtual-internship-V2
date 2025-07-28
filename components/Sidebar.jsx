"use client"

import { usePathname } from "next/navigation";
import React from "react";
import {
  FiHome,
  FiBook,
  FiStar,
  FiSearch,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
} from "react-icons/fi";

const Sidebar = () => {
  const pathname = usePathname();

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
      // No need for active on logout
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
      className={`sidebar__link--wrapper ${
        disabled ? "sidebar__link--not-allowed" : ""
      }`}
      href={href || "#"}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      style={{
        pointerEvents: disabled ? "none" : "auto",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <div className={`sidebar__link--line ${active ? "active--tab" : ""}`} />
      <div className="sidebar__icon--wrapper">{icon}</div>
      <div className="sidebar__link--text">{text}</div>
    </Wrapper>
  );
};

export default Sidebar;
