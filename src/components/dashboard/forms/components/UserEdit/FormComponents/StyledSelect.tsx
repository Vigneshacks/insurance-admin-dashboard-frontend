import React, { useState } from "react";
import cn from "../../../../../../utils/cn";

import { Arrows } from "./Icon";

interface StyledSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  options?: { id: string; name: string }[];
  containerClassName?: string;
}

const StyledSelect: React.FC<StyledSelectProps> = ({
  label,
  name,
  value,
  onChange,
  required = false,
  options = [],
  containerClassName,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={cn(
        "mx-6 mb-5 flex flex-col items-start self-stretch",
        containerClassName
      )}
    >
      <div
        className={`flex h-14 flex-col items-start gap-2.5 self-stretch rounded border ${isFocused ? "border-[#18D9B3]" : "border-[#d8dadc]"} relative bg-white`}
      >
        <label
          className="absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]"
          htmlFor={name}
        >
          {label} {required && <span className="text-[#1e4477]">*</span>}
        </label>

        <div className="content relative flex h-12 w-full items-center gap-2.5 py-1">
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="font-roboto w-full appearance-none bg-white px-[0.9375rem] py-1 text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155] focus:outline-none"
          >
            <option value="">{`Select ${label}`}</option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
            <Arrows />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyledSelect;
