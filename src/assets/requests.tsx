import React from "react";

interface RequestIconProps {
  className?: string;
  isActive?: boolean;
}

const RequestIcon: React.FC<RequestIconProps> = ({
  className,
  isActive = false,
}) => {
  // Color changes based on active state
  const strokeColor = isActive ? "#1E4477" : "#919191";

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer rectangle representing the body of the request */}
      <path
        d="M15.75 13.25C14.645 13.25 13.75 12.355 13.75 11.25V6.5C13.75 3.877 11.623 1.75 9 1.75C6.377 1.75 4.25 3.877 4.25 6.5V11.25C4.25 12.355 3.355 13.25 2.25 13.25H15.75Z"
        fill="white"
      />
      {/* Outline for the request body */}
      <path
        d="M15.75 13.25C14.645 13.25 13.75 12.355 13.75 11.25V6.5C13.75 3.877 11.623 1.75 9 1.75C6.377 1.75 4.25 3.877 4.25 6.5V11.25C4.25 12.355 3.355 13.25 2.25 13.25H15.75Z"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Handle or button-like feature representing a request action */}
      <path
        d="M7.80127 15.5L7.80127 15.5H10.2L10.1998 15.5002L10.2008 15.4998L10.2007 15.5C10.0747 16.0986 9.5775 16.5 9.00099 16.5C8.42448 16.5 7.92725 16.0986 7.80127 15.5ZM7.80119 15.5L7.80118 15.5L7.80115 15.5002L7.80106 15.5001L7.80099 15.5H7.80119Z"
        fill={strokeColor}
        stroke={strokeColor}
      />
    </svg>
  );
};

export default RequestIcon;
