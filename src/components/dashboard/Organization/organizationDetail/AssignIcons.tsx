import React from 'react';

// Info Icon Component
export const InfoIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 16.25C13.0041 16.25 16.25 13.0041 16.25 9C16.25 4.99594 13.0041 1.75 9 1.75C4.99594 1.75 1.75 4.99594 1.75 9C1.75 13.0041 4.99594 16.25 9 16.25Z" fill="white"/>
    <path d="M9 16.25C13.0041 16.25 16.25 13.0041 16.25 9C16.25 4.99594 13.0041 1.75 9 1.75C4.99594 1.75 1.75 4.99594 1.75 9C1.75 13.0041 4.99594 16.25 9 16.25Z" stroke="#1E4477" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12.819V8.25" stroke="#1E4477" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 6.75C8.448 6.75 8 6.301 8 5.75C8 5.199 8.448 4.75 9 4.75C9.552 4.75 10 5.75 10 5.75C10 6.301 9.552 6.75 9 6.75Z" fill="#1E4477"/>
  </svg>
);

// Chevron Icon Component
interface ChevronIconProps {
  isOpen: boolean;
}

export const ChevronIcon: React.FC<ChevronIconProps> = ({ isOpen }) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d={isOpen ? "M3.66663 15.3333L12 7.00033L20.3333 15.3337" : "M20.3333 8.66699L12 17.0003L3.66663 8.66699"}
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Search Icon Component
export const SearchIcon: React.FC = () => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-2"
  >
    <path
      d="M10.3333 17.0003C14.0152 17.0003 17 14.0155 17 10.3337C17 6.65177 14.0152 3.66699 10.3333 3.66699C6.6514 3.66699 3.66663 6.65177 3.66663 10.3337C3.66663 14.0155 6.6514 17.0003 10.3333 17.0003Z"
      fill="white"
    />
    <path
      d="M20.3333 20.3335L15.0466 15.0469"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.3333 17.0003C14.0152 17.0003 17 14.0155 17 10.3337C17 6.65177 14.0152 3.66699 10.3333 3.66699C6.6514 3.66699 3.66663 6.65177 3.66663 10.3337C3.66663 14.0155 6.6514 17.0003 10.3333 17.0003Z"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Close Icon Component
export const CloseIcon: React.FC = () => (
  <svg width={18} height={18} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 4L4 14" stroke="#919191" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 4L14 14" stroke="#919191" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);