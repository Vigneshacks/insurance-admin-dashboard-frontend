// src/components/EditButton.tsx
import React from 'react';

interface EditButtonProps {
  onClick: () => void; // Add onClick prop
}

const EditButton: React.FC<EditButtonProps> = ({ onClick }) => {
  return (
    <button className="cursor-pointer" onClick={onClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.5606 7.47043L10.5306 4.44043L4.266 10.705C3.32896 11.642 2.76299 15.1756 2.75119 15.2498C2.7504 15.2499 2.75 15.25 2.75 15.25L2.751 15.251C2.751 15.251 2.75106 15.2506 2.75119 15.2498C2.82545 15.238 6.35897 14.672 7.296 13.735L13.5606 7.47043Z"
          fill="white"
        />
        <path
          d="M10.547 4.42188L13.578 7.45288"
          stroke="#1E4477"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.75 15.2498C2.75 15.2498 6.349 14.6817 7.296 13.7347C8.243 12.7877 14.623 6.40775 14.623 6.40775C15.46 5.57075 15.46 4.21375 14.623 3.37775C13.786 2.54075 12.429 2.54075 11.593 3.37775C11.593 3.37775 5.213 9.75775 4.266 10.7048C3.319 11.6518 2.751 15.2508 2.751 15.2508L2.75 15.2498Z"
          stroke="#1E4477"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default EditButton;