import React from "react";
import Link from "next/link";

interface SidebarLinkProps {
  href?: string;
  icon: React.ReactNode;
  text: string;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  href,
  icon,
  text,
  disabled = false,
  active = false,
  onClick,
}) => {
  const content = (
    <>
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-[#2bd97c]" />
      )}
      <span className="text-lg ml-2">{icon}</span>
      <span>{text}</span>
    </>
  );

  if (disabled) {
    return (
      <div
        className="flex items-center gap-3 py-2 pl-5 pr-3 rounded opacity-50 cursor-not-allowed relative"
        aria-disabled
      >
        {content}
      </div>
    );
  }

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-3 py-2 pl-5 pr-3 rounded transition w-full text-left relative ${
          active ? "bg-[#f1f6f4] font-bold" : "hover:bg-[#f1f6f4]"
        } text-[#032b41] text-sm font-medium`}
      >
        {content}
      </button>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 py-2 pl-5 pr-3 rounded transition relative ${
          active ? "bg-[#f1f6f4] font-bold" : "hover:bg-[#f1f6f4]"
        } text-[#032b41] text-sm font-medium`}
      >
        {content}
      </Link>
    );
  }

  
  return (
    <div className="flex items-center gap-3 py-2 pl-5 pr-3 rounded transition relative text-[#032b41] text-sm font-medium">
      {content}
    </div>
  );
};

export default SidebarLink;
