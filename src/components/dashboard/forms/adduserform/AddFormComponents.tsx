// components/FormComponents.tsx
import React, { useState, useEffect, useRef } from "react";
import { Arrows } from "../components/UserEdit/FormComponents/Icon";
import LabelChip from "./LabelChip";

// RoleChip Component
interface RoleChipProps {
  role: string;
}

export const RoleChip: React.FC<RoleChipProps> = ({ role }) => {
  let bgColor = "bg-[#e8fbf7]";
  let textColor = "text-[#0c6d5a]";
  if (role === "admin") {
    bgColor = "bg-[#E8F3FF]";
    textColor = "text-[#1e4477]";
  }
  return (
    <div
      className={`flex h-7 items-center justify-center rounded-full px-2 pt-[0.3125rem] pb-[0.3125rem] ${bgColor} font-['Roboto'] text-[11px] leading-[16px] font-medium ${textColor} whitespace-nowrap`}
    >
      {role}
    </div>
  );
};

// CustomSelect Component
interface CustomSelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
  loading?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  name,
  value,
  onChange,
  required,
  label,
  options,
  loading = false,
}) => {
  return (
    <div className="mb-3 flex flex-col items-start self-stretch">
      <div className="relative flex h-14 flex-col items-start gap-2.5 self-stretch rounded border border-[#d8dadc] bg-white">
        <label
          htmlFor={id}
          className="absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]"
        >
          {label}
          {required && <span>*</span>}
        </label>
        <div className="content flex h-12 w-full items-center gap-2.5 py-1">
          <select
            id={id}
            name={name}
            className="font-roboto w-full appearance-none bg-white px-[0.9375rem] py-1 text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155] focus:outline-none"
            value={value}
            onChange={onChange}
            required={required}
            disabled={loading}
          >
            {loading ? (
              <option value="" disabled>
                Loading organizations...
              </option>
            ) : (
              options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <Arrows />
          </div>
        </div>
      </div>
    </div>
  );
};

// MultiSelect Component
interface MultiSelectProps {
  id: string;
  name: string;
  selectedValues: string[];
  onSelect: (value: string) => void;
  onRemove: (value: string) => void;
  required?: boolean;
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
  labelRenderer: (value: string) => string;
  loading?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  id,
  name,
  selectedValues,
  onSelect,
  onRemove,
  required,
  label,
  options,
  labelRenderer,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (value: string) => onSelect(value);

  return (
    <div
      className="mb-3 flex flex-col items-start self-stretch"
      ref={dropdownRef}
    >
      <div className="relative flex min-h-14 flex-col items-start gap-2.5 self-stretch rounded border border-[#d8dadc] bg-white">
        <label
          htmlFor={id}
          className="absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]"
        >
          {label}
          {required && <span>*</span>}
        </label>
        <div
          className="content flex min-h-12 w-full cursor-pointer flex-wrap items-center gap-1 px-[0.9375rem] py-1"
          onClick={toggleDropdown}
        >
          {selectedValues.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedValues.map((value) => (
                <LabelChip
                  key={value}
                  label={labelRenderer(value)}
                  onRemove={() => onRemove(value)}
                />
              ))}
            </div>
          ) : (
            <div className="font-roboto text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155]">
              {loading
                ? "Loading insurance plans..."
                : options.length <= 1
                  ? "Select an organization associated insurance plan"
                  : "Select Insurance Plans"}
            </div>
          )}
          <div className="ml-auto text-gray-500" onClick={toggleDropdown}>
            <Arrows />
          </div>
        </div>
        {isOpen && (
          <div className="absolute top-full left-0 z-50 max-h-48 w-full overflow-y-auto rounded-b-md border border-t-0 border-[#d8dadc] bg-white shadow-lg">
            {loading ? (
              <div className="px-[0.9375rem] py-2 text-gray-500">
                Loading insurance plans...
              </div>
            ) : options.length > 1 ? (
              options
                .filter((option) => option.value !== "")
                .map((option) => (
                  <div
                    key={option.value}
                    className={`cursor-pointer px-[0.9375rem] py-2 hover:bg-gray-100 ${selectedValues.includes(option.value) ? "bg-gray-50" : ""}`}
                    onClick={() =>
                      !selectedValues.includes(option.value) &&
                      handleSelect(option.value)
                    }
                  >
                    <span className="font-roboto text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155]">
                      {option.label}
                    </span>
                  </div>
                ))
            ) : (
              <div className="px-[0.9375rem] py-2 text-gray-500">
                No insurance plans available
              </div>
            )}
          </div>
        )}
        <input
          type="hidden"
          name={name}
          value={selectedValues.join(",")}
          required={required}
        />
      </div>
    </div>
  );
};
