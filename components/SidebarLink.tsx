import React from "react";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  disabled?: boolean;
  active?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  href,
  icon,
  text,
  disabled = false,
  active = false,
}) => {
 
  const Wrapper = href && !disabled ? "a" : "div";

  return (
    <Wrapper
      className={`
        flex items-center gap-3 py-2 pl-5 pr-3 rounded transition
        ${active ? "bg-[#f1f6f4] font-bold" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#f1f6f4]"}
        relative
      `}
      href={href || "#"}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      style={{
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      {/* Green active bar on left */}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-[#2bd97c]"
          style={{ minHeight: 24 }}
        />
      )}
      <span className="text-lg ml-2">{icon}</span>
      <span>{text}</span>
    </Wrapper>
  );
};

export default SidebarLink;
