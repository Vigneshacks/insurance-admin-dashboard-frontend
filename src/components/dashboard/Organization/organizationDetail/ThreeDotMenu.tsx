import React, { useState, useRef, useEffect } from 'react';
import { BsThreeDots } from 'react-icons/bs'; // Changed from BsThreeDotsVertical to BsThreeDots

interface ThreeDotMenuProps {
  onSeeAll: () => void;
  onAddNewPlan: () => void;
}

const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({ onSeeAll, onAddNewPlan }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <BsThreeDots
        className="cursor-pointer text-[#1E4477] hover:text-blue-800"
        onClick={toggleMenu}
        size={18}
      />
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-10 flex flex-col items-start gap-2.5 w-36 rounded border border-[#d8dadc] bg-white shadow-md">
          <div className="w-full">
            <div 
              onClick={() => {
                onSeeAll();
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded hover:bg-[#e8f3ff] text-[#1e4477] text-xs font-medium cursor-pointer"
            >
              See all
            </div>
          </div>
          <div 
            onClick={() => {
              onAddNewPlan();
              setIsOpen(false);
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[#1e4477] text-xs font-medium cursor-pointer hover:bg-[#e8f3ff]"
          >
            Add new plan
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDotMenu;