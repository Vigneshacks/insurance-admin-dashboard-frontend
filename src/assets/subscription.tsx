import React from "react";

interface SubscriptionIconProps {
  className?: string;
  isActive?: boolean;
}

const SubscriptionIcon: React.FC<SubscriptionIconProps> = ({
  className,
  isActive = false,
}) => {
  // Color change based on active state
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
      {/* Subscription background */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.25 14.25H3.75C2.64543 14.25 1.75 13.3546 1.75 12.25V7.25H16.25V12.25C16.25 13.3546 15.3546 14.25 14.25 14.25Z"
        fill="white"
      />
      {/* Horizontal line */}
      <path
        d="M1.75 7.25H16.25"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Outer subscription box */}
      <path
        d="M3.75 14.25H14.25C15.3546 14.25 16.25 13.3546 16.25 12.25V5.75C16.25 4.64543 15.3546 3.75 14.25 3.75H3.75C2.64543 3.75 1.75 4.64543 1.75 5.75V12.25C1.75 13.3546 2.64543 14.25 3.75 14.25Z"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Vertical lines for Subscription */}
      <path
        d="M4.25 11.25H7.25"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.75 11.25H13.75"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SubscriptionIcon;
