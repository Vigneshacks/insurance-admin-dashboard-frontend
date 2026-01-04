import React from "react";
import { X } from "lucide-react";

interface Insurance {
  name: string;
}

interface InsuranceChipProps {
  insurance: Insurance;
  onRemove: () => void;
}

const InsuranceChip: React.FC<InsuranceChipProps> = ({ insurance, onRemove }) => {
  return (
    <div className="flex items-center gap-1 py-1 px-2 bg-[#e8f3ff] rounded-full text-[#1e4477] text-xs mr-1 my-1">
      {insurance.name}
      <X className="h-3 w-3 cursor-pointer" onClick={onRemove} />
    </div>
  );
};

export default InsuranceChip;