import React from "react";

interface EnclosingButtonProps {
  className?: string;
}

const EnclosingButton: React.FC<EnclosingButtonProps> = ({
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.25 14.25V3.75C5.25 3.19772 4.80228 2.75 4.25 2.75H3.25C2.69772 2.75 2.25 3.19772 2.25 3.75V14.25C2.25 14.8023 2.69772 15.25 3.25 15.25H4.25C4.80228 15.25 5.25 14.8023 5.25 14.25Z"
          fill="white"
        />
        <path
          d="M5.25 14.25V3.75C5.25 3.19772 4.80228 2.75 4.25 2.75H3.25C2.69772 2.75 2.25 3.19772 2.25 3.75V14.25C2.25 14.8023 2.69772 15.25 3.25 15.25H4.25C4.80228 15.25 5.25 14.8023 5.25 14.25Z"
          stroke="#919191"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5 5.75L15.75 9L12.5 12.25"
          stroke="#919191"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.75 9H8.25"
          stroke="#919191"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default EnclosingButton;
