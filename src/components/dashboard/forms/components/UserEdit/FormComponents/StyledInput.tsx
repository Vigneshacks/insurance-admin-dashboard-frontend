import React, { useState } from "react";
import cn from "../../../../../../utils/cn";

interface StyledInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  pattern?: string;
  maxLength?: number;
  containerClassName?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  children?: React.ReactNode;
  isFocused?: boolean;
}

const StyledInput: React.FC<StyledInputProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  pattern = undefined,
  maxLength = undefined,
  containerClassName,
  inputRef = null,
  onFocus = undefined,
  onBlur = undefined,
  placeholder = "",
  children = null,
  isFocused = false
}) => {
  const [focused, setFocused] = useState(isFocused);
  
const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    if (onFocus) onFocus(e);
};
  
const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    if (onBlur) onBlur(e);
};
  
  // Border color will ONLY be active when focused, not when value exists
  const borderColor = focused ? "border-[#18D9B3]" : "border-[#d8dadc]";
  
  return (
    <div className={cn("flex flex-col items-start self-stretch mb-5 mx-6", containerClassName)}>
      <div className={`flex flex-col items-start gap-2.5 self-stretch h-14 rounded border ${borderColor} bg-white relative`}>
        <label
          className="absolute left-[-0.25rem] flex items-center py-0 px-1 top-[-0.75rem] bg-white text-[#1e4477] z-10 text-[12px] leading-[16px]"
          htmlFor={name}
        >
          {label} {required && <span className="text-[#1e4477]">*</span>}
        </label>
        
        <div className="content flex items-center gap-2.5 py-1 h-12 w-full relative">
          <input
            id={name}
            ref={inputRef}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            pattern={pattern}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155] w-full px-[0.9375rem] py-1 focus:outline-none"
          />
          {children}
        </div>
      </div>
    </div>
  );
};

export default StyledInput;