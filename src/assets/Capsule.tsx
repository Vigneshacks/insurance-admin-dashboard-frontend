import React from "react";

type CapsuleProps = {
  children: React.ReactNode;
  className?: string;
};

const Capsule: React.FC<CapsuleProps> = ({ children, className = "" }) => (
  <div
    className={`inline-flex h-7 items-center gap-2.5 overflow-hidden rounded-full bg-gray-100 px-2 py-[0.3125rem] text-[11px] leading-[16px] font-medium text-[#494949] ${className}`}
  >
    {children}
  </div>
);

export default Capsule;
