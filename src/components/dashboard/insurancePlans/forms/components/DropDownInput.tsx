import { memo, useState } from "react";
import cn from "../../../../../utils/cn";

interface DropdownInputProps {
  formData: any;
  valueName: string;
  placeholder?: string;
  required?: boolean;
  label: string;
  options: string[];
  handleChange: (e: { target: { name: string; value: string } }) => void;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  complex?: boolean;
  children?: React.ReactNode;
}

const CustomDropdownArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M20.3332 8.6665L11.9998 16.9998L3.6665 8.6665"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DropdownField = memo(
  ({
    valueName,
    placeholder,
    inputClassName,
    formData,
    options,
    isOpen,
    toggleDropdown,
    handleOptionSelect,
  }: {
    valueName: string;
    placeholder?: string;
    inputClassName?: string;
    formData: any;
    options: string[];
    isOpen: boolean;
    toggleDropdown: () => void;
    handleOptionSelect: (option: string) => void;
  }) => {
    const textStyles =
      "font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155]";

    return (
      <div className="relative w-full">
        <div
          className={cn(
            "flex h-12 w-full cursor-pointer items-center justify-between px-[0.9375rem] py-1",
            textStyles,
            inputClassName
          )}
          onClick={toggleDropdown}
        >
          <div>
            {formData[valueName] || placeholder || "Select an option..."}
          </div>
          <div
            className={cn("transition-transform", isOpen ? "rotate-180" : "")}
          >
            <CustomDropdownArrow />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-[150px] w-full overflow-auto rounded-md border border-[#d8dadc] bg-white shadow-lg">
            {options.map((option) => (
              <div
                key={option}
                className={cn(
                  "px-[0.9375rem] py-2 hover:cursor-pointer hover:bg-gray-100",
                  textStyles
                )}
                onClick={() => handleOptionSelect(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

const DropdownInput = (props: DropdownInputProps) => {
  const {
    formData,
    valueName,
    placeholder,
    required = false,
    label,
    options,
    handleChange,
    containerClassName,
    labelClassName,
    inputClassName,
    complex = false,
    children,
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionSelect = (option: string) => {
    handleChange({
      target: {
        name: valueName,
        value: option,
      },
    });
    setIsOpen(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col items-start self-stretch",
        containerClassName
      )}
    >
      <div className="relative flex h-14 flex-col items-start gap-2.5 self-stretch rounded border border-[#d8dadc] bg-white">
        <label
          htmlFor={valueName}
          className={cn(
            "absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]",
            labelClassName
          )}
        >
          {label}
          {required && <span>*</span>}
        </label>

        {!complex ? (
          <DropdownField
            valueName={valueName}
            placeholder={placeholder}
            inputClassName={inputClassName}
            formData={formData}
            options={options}
            isOpen={isOpen}
            toggleDropdown={toggleDropdown}
            handleOptionSelect={handleOptionSelect}
          />
        ) : (
          <div className="relative w-full">
            {children}
            <DropdownField
              valueName={valueName}
              placeholder={placeholder}
              inputClassName={inputClassName}
              formData={formData}
              options={options}
              isOpen={isOpen}
              toggleDropdown={toggleDropdown}
              handleOptionSelect={handleOptionSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(DropdownInput);
