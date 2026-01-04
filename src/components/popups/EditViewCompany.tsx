import React, { useEffect, useState } from 'react';

interface CustomColumnVisibilityPopupProps {
  isOpen: boolean;
  onClose: () => void;
  columns: string[];
  visibleColumns: string[];
  onVisibilityChange: (selectedColumns: string[]) => void;
  title?: string;
}

const CustomColumnVisibilityPopup: React.FC<CustomColumnVisibilityPopupProps> = ({
  isOpen,
  onClose,
  columns,
  visibleColumns,
  onVisibilityChange,
  title
}) => {
  const [selectedColumns, setSelectedColumns] = useState(visibleColumns);

  useEffect(() => {
    setSelectedColumns(visibleColumns);
  }, [visibleColumns]);

  useEffect(() => {
    if (isOpen) {
      // Add a light overlay to dim the background
      const overlay = document.createElement('div');
      overlay.id = 'column-popup-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'; // Light dim effect
      overlay.style.zIndex = '40';
      document.body.appendChild(overlay);
    } else {
      // Remove the overlay when popup closes
      const overlay = document.getElementById('column-popup-overlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
    }
    
    return () => {
      // Cleanup function to ensure overlay is removed when component unmounts
      const overlay = document.getElementById('column-popup-overlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  interface HandleColumnToggle {
    (columnName: string): void;
  }

  const handleColumnToggle: HandleColumnToggle = (columnName) => {
    setSelectedColumns(prev => {
      if (prev.includes(columnName)) {
        // Don't allow deselecting if it would result in no columns being visible
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter(col => col !== columnName);
      } else {
        return [...prev, columnName];
      }
    });
  };

  const handleApply = () => {
    onVisibilityChange(selectedColumns);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="w-[400px] rounded-lg bg-white shadow-xl pointer-events-auto">
        {/* Header */}
        <div className="flex items-center gap-2.5 rounded-t-lg bg-[#1e4477] p-6">
          <div className="font-roboto text-[22px] leading-[28px] text-white">
            {title || 'Edit Dashboard View'}
          </div>
          <button onClick={onClose} className="ml-auto text-white hover:text-gray-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.6666 5.33301L5.33325 18.6663" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.33325 5.33301L18.6666 18.6663" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="font-roboto text-[14px] leading-[20px] text-slate-700">
            Select the columns you'd like to see in your Dashboard overview
          </p>
          
          <div className="mt-4 space-y-2">
            {columns.map((column) => (
              <div 
                key={column}
                className="flex cursor-pointer items-center gap-2.5 py-1"
                onClick={() => handleColumnToggle(column)}
              >
                <div className="flex h-[1.125rem] w-[1.125rem] items-center justify-center rounded-sm border border-[#d8dadc]">
                  {selectedColumns.includes(column) && (
                    <div className="relative h-full w-full rounded-sm bg-[#18d9b3]">
                      <svg 
                        className="absolute"
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10 16.4L6 12.4L7.4 11L10 13.6L16.6 7L18 8.4L10 16.4Z" fill="white" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="font-roboto text-[12px] leading-[16px] text-slate-700">
                  {column}
                </span>
              </div>
            ))}
          </div>

          {/* Footer Buttons */}
          <div className="mt-6 flex gap-2.5">
            <button 
              onClick={onClose}
              className="flex h-10 items-center justify-center gap-2 rounded-[0.3125rem] border border-[#d8dadc] px-6 font-roboto text-[14px] font-medium leading-[20px] text-[#1e4477] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply}
              className="flex h-10 items-center justify-center gap-2 rounded-[0.3125rem] bg-[#1e4477] px-6 font-roboto text-[14px] font-medium leading-[20px] text-white hover:bg-[#173660]"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomColumnVisibilityPopup;