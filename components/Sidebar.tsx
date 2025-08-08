"use client";

import { usePathname } from "next/navigation";
import React, { Dispatch, SetStateAction } from "react";
import SidebarLink from "./SidebarLink";
import {
  FiHome,
  FiBook,
  FiStar,
  FiSearch,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiLogIn,
} from "react-icons/fi";

const fontSizes = {
  small: { label: "Aa", px: 16 },
  medium: { label: "Aa", px: 18 },
  large: { label: "Aa", px: 22 },
  xlarge: { label: "Aa", px: 26 },
} as const;

type SidebarProps = {
  activeSize: keyof typeof fontSizes;
  setActiveSize: Dispatch<SetStateAction<keyof typeof fontSizes>>;
  isDrawer?: boolean;
  onLogoutClick?: () => void;
  onLoginClick?: () => void;
  currentUser: any;
};

const Sidebar: React.FC<SidebarProps> = ({
  activeSize = "small",
  setActiveSize,
  isDrawer = false,
  onLogoutClick,
  onLoginClick,
  currentUser,
}) => {
  const pathname = usePathname();
  const isPlayerPage = /^\/player\/[^/]+$/.test(pathname);

  const menuLinksTop = [
    {
      href: "/for-you",
      text: "For you",
      icon: <FiHome />,
      active:
        pathname === "/for-you" ||
        pathname.startsWith("/book/") ||
        pathname.startsWith("/player/"),
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
      href: "",
    },
    {
      text: "Search",
      icon: <FiSearch />,
      disabled: true,
      href: "",
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
      href: "",
    },
  ];

  return (
    <aside
      className={isDrawer ? "sidebar w-full bg-white h-full" : "sidebar fixed"}
    >
      {/* Logo */}
      <div className="sidebar__logo flex items-center">
        <img
          src="https://summarist.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.1b1c490b.png&w=640&q=75"
          alt="Summarist Logo"
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Sidebar Links */}
      <div className="sidebar__wrapper">
        {/* Top Links */}
        <div className="sidebar__top">
          {menuLinksTop.map((item, i) => (
            <SidebarLink key={i} {...item} />
          ))}

          {isPlayerPage && (
            <div className="flex gap-4 items-end justify-start pl-5">
              {Object.entries(fontSizes).map(([sizeKey, f]) => (
                <button
                  key={sizeKey}
                  onClick={() =>
                    setActiveSize(sizeKey as keyof typeof fontSizes)
                  }
                  className="flex flex-col items-center focus:outline-none"
                  type="button"
                >
                  <span
                    className={`font-sans font-semibold transition-all ${
                      activeSize === sizeKey
                        ? "text-[#032b41]"
                        : "text-[#6b7280]"
                    }`}
                    style={{ fontSize: f.px, letterSpacing: 1.1 }}
                  >
                    {f.label}
                  </span>
                  {activeSize === sizeKey && (
                    <div className="w-6 h-1 mt-1 rounded bg-[#2bd97c]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Links */}
        <div
          className={`sidebar__bottom ${
            isPlayerPage ? "pb-[72px] max-[767px]:pb-[220px]" : ""
          }`}
        >
          {menuLinksBottom.map((item, i) => (
            <SidebarLink key={i} {...item} />
          ))}

          {/* Conditional Login / Logout */}
          {currentUser ? (
            <SidebarLink
              text="Logout"
              icon={<FiLogOut />}
              href=""
              onClick={onLogoutClick}
            />
          ) : (
            <SidebarLink
              text="Login"
              icon={<FiLogIn />}
              href=""
              onClick={onLoginClick}
            />
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
