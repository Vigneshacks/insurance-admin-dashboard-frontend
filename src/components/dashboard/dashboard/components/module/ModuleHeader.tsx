import React, { ReactNode } from "react";
import { GoPencil } from "react-icons/go";
import cn from "../../../../../utils/cn";

type Props = {
  label: ReactNode;
  callbackOnAdd?: () => void;
  callbackOnEdit?: () => void;
  callbackOnAddUser?: () => void;
  className?: string;
};

const ModuleHeader: React.FC<Props> = ({
  label,
  callbackOnAdd,
  callbackOnEdit,
  callbackOnAddUser,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className || ""
      )}
    >
      <h1 className="text-2xl font-medium text-blue-950">{label}</h1>
      <div className="flex space-x-2">
        {/* Edit View Button */}
        <button
          className="flex h-[28px] items-center gap-1 rounded-md border border-[#D8DADC] bg-white px-[10px] py-[5px] text-[11px] leading-[16px] font-medium tracking-[0.5px] text-[#1E4477] font-['Roboto']"
          onClick={callbackOnEdit}
        >
          <GoPencil className="text-[#1E4477]" />
          Edit View
        </button>
        {callbackOnAdd && (
          <button
            className="flex h-[28px] items-center gap-[5px] rounded-[5px] bg-[#1E4477] px-[10px] py-[5px] text-[11px] leading-[16px] font-medium tracking-[0.5px] text-white font-['Roboto']"
            onClick={callbackOnAdd}
          >
            Add New
          </button>
        )}
        {callbackOnAddUser && (
          <button
            className="flex h-[28px] items-center gap-[5px] rounded-[5px] bg-[#1E4477] px-[10px] py-[5px] text-[11px] leading-[16px] font-medium tracking-[0.5px] text-white font-['Roboto']"
            onClick={callbackOnAddUser}
          >
            Add New 
          </button>
        )}
      </div>
    </div>
  );
};

export default ModuleHeader;