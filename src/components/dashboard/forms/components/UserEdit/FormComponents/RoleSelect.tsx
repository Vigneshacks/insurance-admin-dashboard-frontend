import React, { useState } from "react";
import {Arrows} from "./Icon";
import RoleChip from "./RoleChips";

interface RoleSelectProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const RoleSelect: React.FC<RoleSelectProps> = ({
  value,
  onChange,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setIsFocused(!isOpen);
  };

interface SelectRoleEvent {
    target: {
        name: string;
        value: string;
    };
}

const handleSelectRole = (role: string) => {
    const event: SelectRoleEvent = {
        target: {
            name: 'role',
            value: role
        }
    };
    
    onChange(event as React.ChangeEvent<HTMLInputElement>);
    setIsOpen(false);
};

  return (
    <div className="flex flex-col items-start self-stretch mb-5 mx-6">
      <div className={`flex flex-col items-start gap-2.5 self-stretch h-14 rounded border ${isFocused ? "border-[#18D9B3]" : "border-[#d8dadc]"} bg-white relative`}>
        <label
          className="absolute left-[-0.25rem] flex items-center py-0 px-1 top-[-0.75rem] bg-white text-[#1e4477] z-10 text-[12px] leading-[16px]"
          htmlFor="role"
        >
          Role {required && <span className="text-[#1e4477]">*</span>}
        </label>
        
        <div 
          className="content flex items-center justify-between py-1 h-12 w-full px-[0.9375rem] cursor-pointer"
          onClick={toggleDropdown}
        >
          {value ? (
            <div className="flex-1 flex items-center">
              <RoleChip role={value} />
            </div>
          ) : (
            <span className="font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155]">
              Select Role
            </span>
          )}
          
          <div className="flex items-center text-gray-500">
            <Arrows />
          </div>
        </div>
        
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-b-md z-20 border border-t-0 border-[#d8dadc]">
            <div 
              className="px-[0.9375rem] py-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleSelectRole("admin")}
            >
              <span className="font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155]">
                Admin
              </span>
            </div>
            <div 
              className="px-[0.9375rem] py-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleSelectRole("user")}
            >
              <span className="font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155]">
                User
              </span>
            </div>
          </div>
        )}
        
        {/* Hidden input for form validation */}
        <input 
          type="hidden" 
          name="role" 
          value={value} 
          required={required}
        />
      </div>
    </div>
  );
};

export default RoleSelect;