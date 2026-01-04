import React, { useState, useRef, useEffect } from 'react';

const CalendarIcon = ({ onDateSelect, position = "bottom-right" }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
  };

  const generateCalendar = () => {
    const currentDate = new Date(selectedDate);
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-6 h-6"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected =
        selectedDate.getDate() === i &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;
      days.push(
        <div
          key={i}
          onClick={() => {
            const newDate = new Date(year, month, i);
            setSelectedDate(newDate);
            if (onDateSelect) {
              onDateSelect(formatDate(newDate));
            }
            setShowCalendar(false);
          }}
          className={`w-6 h-6 flex items-center justify-center rounded-full cursor-pointer text-xs ${
            isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
          }`}
        >
          {i}
        </div>
      );
    }
    return days;
  };

  const prevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getPositionClass = () => {
    switch (position) {
      case "left":
        return "absolute z-200 right-full mr-2 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-2 border border-gray-200 w-48";
      case "bottom-left":
        return "absolute z-200 right-auto left-0 top-full mt-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200 w-48";
      case "bottom-right":
        // Position below the icon, aligned to the right
        return "absolute z-200 right-0 left-auto top-full mt-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200 w-48";
      case "top-left":
        return "absolute z-200 right-auto left-0 bottom-full mb-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200 w-48";
      case "top-right":
        return "absolute z-200 right-0 left-auto bottom-full mt-1 bg-white rounded-lg shadow-lg p-2 border border-gray-200 w-48";
      default:
        return "absolute z-200 right-0 left-auto top-full mt-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200 w-48";
    }
  };

  const handleIconClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("Calendar Icon Clicked for", position); // Enhanced debugging
    setShowCalendar((prev) => !prev);
  };

  return (
    <div className="relative" ref={calendarRef}>
      <div
        onClick={handleIconClick}
        className="cursor-pointer z-40" // Increased z-index for icon
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2.25 4.75C2.25 3.64543 3.14543 2.75 4.25 2.75H13.75C14.8546 2.75 15.75 3.64543 15.75 4.75V6.25H2.25V4.75Z" fill="white" />
          <path d="M5.75 2.75V0.75" stroke="#1E4477" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.25 2.75V0.75" stroke="#1E4477" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.75 2.75H4.25C3.14543 2.75 2.25 3.64543 2.25 4.75V13.25C2.25 14.3546 3.14543 15.25 4.25 15.25H13.75C14.8546 15.25 15.75 14.3546 15.75 13.25V4.75C15.75 3.64543 14.8546 2.75 13.75 2.75Z" stroke="#1E4477" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.25 6.25H15.75" stroke="#1E4477" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11.25 11.75C11.8023 11.75 12.25 11.3023 12.25 10.75C12.25 10.1977 11.8023 9.75 11.25 9.75C10.6977 9.75 10.25 10.1977 10.25 10.75C10.25 11.3023 10.6977 11.75 11.25 11.75Z" fill="#1E4477" stroke="#1E4477" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {showCalendar && (
        <div className={getPositionClass()}>
          <div className="flex justify-between items-center mb-2 text-xs">
            <button onClick={(e) => { e.stopPropagation(); prevMonth(); }} className="text-gray-600 hover:text-gray-800 px-1" type="button">←</button>
            <div className="font-medium text-xs">{monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</div>
            <button onClick={(e) => { e.stopPropagation(); nextMonth(); }} className="text-gray-600 hover:text-gray-800 px-1" type="button">→</button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-xs text-gray-500 text-center w-6 h-6 flex items-center justify-center">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">{generateCalendar()}</div>
          <div className="mt-2 text-center text-xs text-gray-700">{formatDate(selectedDate)}</div>
        </div>
      )}
    </div>
  );
};

export default CalendarIcon;