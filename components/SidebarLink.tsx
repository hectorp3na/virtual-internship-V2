import React from "react";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  disabled?: boolean;
}

export default function SidebarLink({ href, icon, text, disabled }: SidebarLinkProps) {
  const Wrapper = disabled ? "div" : "a";
  return (
    <Wrapper
      className={`sidebar__link--wrapper ${disabled ? "sidebar__link--not-allowed" : ""}`}
      href={disabled ? undefined : href}
    >
      <div className="sidebar__link--line"></div>
      <div className="sidebar__icon--wrapper">{icon}</div>
      <div className="sidebar__link--text">{text}</div>
    </Wrapper>
  );
}
