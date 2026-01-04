// components/TableMenu/TableMenu.tsx

import React from "react";
import { MenuProps } from "../../types/tableTypes";

const TableMenu: React.FC<MenuProps> = ({
  row,
  type,
  isOpen,
  onView,
  onEdit,
  onRemove,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 z-30 inline-flex flex-col items-end p-2">
      <div className="flex flex-col items-start gap-2.5 self-stretch pr-2">
        <div className="flex w-[9.0625rem] flex-col items-start gap-2.5 rounded-[0.3125rem] border border-[#d8dadc] bg-white">
          <MenuItem
            label="View"
            onClick={() => onView(row)}
            className="bg-[#e8f3ff] hover:bg-[#d1e5ff]"
          />
          <MenuItem
            label="Edit"
            onClick={() => onEdit(row)}
            className="hover:bg-[#e8f3ff]"
          />
          {onRemove && (
            <MenuItem
              label={
                type === "organization" ? "Remove organization" : "Remove user"
              }
              onClick={() => onRemove(row)}
              className="text-[#d21414] hover:bg-[#ffe8e8]"
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface MenuItemProps {
  label: string;
  onClick: () => void;
  className?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  label,
  onClick,
  className = "",
}) => (
  <div
    onClick={onClick}
    className={`flex cursor-pointer items-center gap-2.5 self-stretch p-2 ${className}`}
  >
    <span className="text-[11px] leading-4 font-medium tracking-[0.5px]">
      {label}
    </span>
  </div>
);

export default TableMenu;
