import React from "react";

interface UserIconProps {
  className?: string;
  isActive?: boolean;
}

const UserIcon: React.FC<UserIconProps> = ({ className, isActive = false }) => {
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
      {/* Face Shape */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.4941 11.3635C16.6881 11.8785 16.3811 12.4475 15.8581 12.6225C14.9815 12.9153 13.8078 13.1965 12.4108 13.2436C12.3925 13.1857 12.3725 13.1278 12.3507 13.0698C11.7374 11.4422 10.5394 10.0973 9.00928 9.29764C9.82916 8.64288 10.8682 8.25146 12.0001 8.25146C14.0581 8.25146 15.8091 9.54545 16.4941 11.3635Z"
        fill="white"
      />
      {/* Head */}
      <path
        d="M12 5.75C13.1046 5.75 14 4.85457 14 3.75C14 2.64543 13.1046 1.75 12 1.75C10.8954 1.75 10 2.64543 10 3.75C10 4.85457 10.8954 5.75 12 5.75Z"
        fill="white"
      />
      {/* Body outline */}
      <path
        d="M5.75 8.25C6.85457 8.25 7.75 7.35457 7.75 6.25C7.75 5.14543 6.85457 4.25 5.75 4.25C4.64543 4.25 3.75 5.14543 3.75 6.25C3.75 7.35457 4.64543 8.25 5.75 8.25Z"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Legs outline */}
      <path
        d="M9.60884 15.122C10.1318 14.947 10.4388 14.378 10.2448 13.863C9.55984 12.045 7.80884 10.751 5.75084 10.751C3.69284 10.751 1.94184 12.045 1.25684 13.863C1.06284 14.379 1.36984 14.948 1.89284 15.122C2.85484 15.443 4.17384 15.75 5.75184 15.75C7.32984 15.75 8.64784 15.443 9.60884 15.122Z"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Head outline */}
      <path
        d="M12 5.75C13.1046 5.75 14 4.85457 14 3.75C14 2.64543 13.1046 1.75 12 1.75C10.8954 1.75 10 2.64543 10 3.75C10 4.85457 10.8954 5.75 12 5.75Z"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Body connection */}
      <path
        d="M12.7489 13.227C13.9969 13.15 15.0529 12.891 15.8579 12.622C16.3809 12.447 16.6879 11.878 16.4939 11.363C15.8089 9.54498 14.0579 8.25098 11.9999 8.25098C11.0229 8.25098 10.1149 8.54298 9.35693 9.04398"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UserIcon;
