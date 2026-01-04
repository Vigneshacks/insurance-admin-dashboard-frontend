import React from "react";

interface RoleChipProps {
  role: string;
}

const RoleChip: React.FC<RoleChipProps> = ({ role }) => {
  let bgColor = "bg-[#e8fbf7]";
  let textColor = "text-[#0c6d5a]";
  
  // Trim and convert to lowercase for more reliable comparison
  const normalizedRole = role.trim().toLowerCase();
  
  // Log the role to help with debugging
  console.log("Role:", role, "Normalized:", normalizedRole);
  
  if (normalizedRole === "admin") {
    bgColor = "bg-[#E8F3FF]";
    textColor = "text-[#1e4477]";
  }
  
  return (
    <div className={`flex items-center justify-center pt-[0.3125rem] pb-[0.3125rem] px-2 h-7 rounded-full ${bgColor} font-['Roboto'] text-[11px] font-medium leading-[16px] ${textColor} whitespace-nowrap`}>
      {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
    </div>
  );
};

export default RoleChip;