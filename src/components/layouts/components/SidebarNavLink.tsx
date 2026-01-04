import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ActivePageType } from "../../../types/ActivePageType";

interface SidebarNavLinkProps {
  id: ActivePageType;
  to: string;
  icon: () => React.ReactNode;
  label: string;
  setActivePage: (page: ActivePageType) => void;
  disabled?: boolean;
  isCollapsed: boolean;
  className?: string;
  style?: React.CSSProperties;
  badgeCount?: number;
  isSidebarBottom?: boolean; // New prop to identify bottom buttons
}

const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({
  id,
  to,
  icon: Icon,
  label,
  setActivePage,
  disabled,
  isCollapsed,
  className,
  style,
  badgeCount,
  isSidebarBottom = false, // Default to false
}) => {
  const location = useLocation();
  const isActive =
    id === "manage-subscription" || id === "insurance-plans"
      ? location.pathname.startsWith(to)
      : id === "companies"
        ? location.pathname.startsWith("/companies") ||
          location.pathname.startsWith("/dashboard/companies")
        : location.pathname === to;

  // Specific styling for sidebar bottom buttons
  const bottomButtonLabelStyle = isSidebarBottom
    ? {
        color: isActive ? "#1E4477" : "#1E4477", // Consistent color for bottom buttons
        fontFamily: "Roboto",
        fontSize: "14px",
        fontStyle: "normal",
        fontWeight: 500,
        lineHeight: "20px", // 142.857%
        letterSpacing: "0.1px",
      }
    : undefined;

  return (
    <div className="relative">
      <Link
        to={to}
        onClick={() => {
          setActivePage(id);
        }}
        className={`flex items-center ${isCollapsed ? "justify-center" : "px-2"} gap-2 rounded-lg py-2 ${
          isActive
            ? isSidebarBottom
              ? "bg-[#E8F3FF] text-[#1E4477]"
              : "bg-[#E8F3FF] text-[#1E4477]"
            : "hover:bg-gray-200"
        } ${className || ""}`}
        style={{
          pointerEvents: disabled ? "none" : "auto",
          ...style,
        }}
      >
        <div className="relative">
          <Icon />
          {isCollapsed && badgeCount !== undefined && badgeCount > 0 && (
            <div className="absolute -top-2 -right-2 flex h-4 max-w-[2.125rem] min-w-[1rem] items-center justify-center rounded-full bg-[#1e4477] px-1 py-0 text-center text-[11px] leading-[16px] font-medium text-white">
              {badgeCount > 99 ? "99+" : badgeCount}
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="flex w-full items-center justify-between">
            <span
              style={
                bottomButtonLabelStyle || {
                  color: isActive ? "#1E4477" : "#919191",
                  lineHeight: "20px",
                }
              }
              className="text-[14px]"
            >
              {label}
            </span>
            {badgeCount !== undefined && badgeCount > 0 && (
              <div className="ml-1 flex h-4 max-w-[2.125rem] min-w-[1rem] items-center justify-center rounded-full bg-[#1e4477] px-1 py-0 text-center text-[11px] leading-[16px] font-medium text-white">
                {badgeCount > 99 ? "99+" : badgeCount}
              </div>
            )}
          </div>
        )}
      </Link>
    </div>
  );
};

export default SidebarNavLink;
