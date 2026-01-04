import React from 'react';

interface LabelChipsProps {
  label: string;
}

const Label: React.FC<LabelChipsProps> = ({ label }) => (
  <div className="flex items-center gap-2.5 pt-[0.3125rem] pb-[0.3125rem] px-2 h-7 rounded-full bg-gray-100 overflow-hidden text-[#494949] font-roboto text-xs font-medium leading-4">
    {label}
  </div>
);

export default Label;