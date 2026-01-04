// components/LabelChip.tsx
import React from "react";

interface LabelChipProps {
  label: string;
  onRemove: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
}

const LabelChip: React.FC<LabelChipProps> = ({ label, onRemove }) => (
  <div className="mr-2 mb-1 flex items-center rounded-full bg-[#F3F4F6] pt-[0.3125rem] pr-[0.3125rem] pb-[0.3125rem] pl-2">
    <div className="font-roboto mr-1 text-[11px] leading-[16px] font-medium text-[#494949]">
      {label}
    </div>
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onRemove}
      className="cursor-pointer"
    >
      <path
        d="M14 4L4 14"
        stroke="#919191"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 4L14 14"
        stroke="#919191"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export default LabelChip;
