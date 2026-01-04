import { Calendar } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDashboard } from "../../../../../context/DashboardContext"; // Adjust path as needed
import { Check } from "lucide-react";
import NoBox from "./NoBox";

// Import the SVG as a component
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M13.6051 4.75L13.0991 14.355C13.0431 15.417 12.1651 16.25 11.1021 16.25H6.89704C5.83304 16.25 4.95604 15.417 4.90004 14.355L4.39404 4.75" fill="white"/>
  <path d="M13.6051 4.75L13.0991 14.355C13.0431 15.417 12.1651 16.25 11.1021 16.25H6.89704C5.83304 16.25 4.95604 15.417 4.90004 14.355L4.39404 4.75" stroke="#1E4477" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M2.75 4.75H15.25" stroke="#1E4477" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6.75 4.75V2.75C6.75 2.198 7.198 1.75 7.75 1.75H10.25C10.802 1.75 11.25 2.198 11.25 2.75V4.75" stroke="#1E4477" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7.375 8L7.625 13" stroke="#1E4477" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10.625 8L10.375 13" stroke="#1E4477" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
);

// Updated Toggler component
const Toggler = ({ toggle, selectedCount }: { toggle: () => void; selectedCount: number }) => (
  <div
    className="flex h-[40px] w-full flex-row items-center justify-between border border-[#d8dadc] px-[15px] py-[4px] rounded-t-[4px] hover:cursor-pointer hover:bg-[#d8dadc]"
    onClick={toggle}
  >
    <div className={`text-[14px] flex-1 ${selectedCount > 0 ? 'text-[#334155]' : 'text-[#919191]'}`}>
      {selectedCount > 0 ? `${selectedCount} selected` : 'Select Organization(s)'}
    </div>
    <div className="h-6 w-6">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20.3332 8.66699L11.9998 17.0003L3.6665 8.66699" stroke="#1E4477" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  </div>
);

interface Item {
  id: string | number;
  text: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  displayStartDate?: string;
  displayEndDate?: string;
}

type Props = {
  selectedItems: Item[];
  setSelectedItems: (items: Item[]) => void;
  companies: Item[]; // Ensure this prop is passed from InsuranceAddForm
  lockedOrgId?: string;
};

const OrganizationAssigner = ({ selectedItems, setSelectedItems, lockedOrgId }: Props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { companies, loadCompanies } = useDashboard();
  const toggle = () => setShowDropdown((prev) => !prev);
  const startDateRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const endDateRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});


  // Convert companies to items format
  const items: Item[] = companies.map((company) => ({
    id: company.id,
    text: company.organization
  }));

  // Fetch companies when component mounts if needed
  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);
  console.log('OrganizationAssigner companies:', companies); // Debug

  const toggleItemSelection = (item: { id: string | number; text: string } | any) => {
    const itemId = item.id;
    const itemText = item.text || item.organization || 'Unnamed';
    
    const isItemSelected = selectedItems.some((i) => i.id === itemId);
    if (isItemSelected && itemId === lockedOrgId) {
      return; // Prevent removal of the locked organization
    }
    
    const newSelectedItems = isItemSelected
      ? selectedItems.filter((i) => i.id !== itemId)
      : [...selectedItems, { id: itemId, text: itemText, effectiveStartDate: '', effectiveEndDate: '', displayStartDate: '', displayEndDate: '' }];
    
    setSelectedItems(newSelectedItems);
  };

  // Format date for display (MM/DD/YY)
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(2);
    return `${month}/${day}/${year}`;
  };

  // Parse display date back to API format (YYYY-MM-DD)
  const parseDisplayDate = (displayDate: string) => {
    if (!displayDate || !displayDate.includes('/')) return '';
    const [month, day, year] = displayDate.split('/');
    return `20${year}-${month}-${day}`;
  };

  // Handler for date input changes - keep in MM/DD/YY format
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: string | number, field: 'effectiveStartDate' | 'effectiveEndDate') => {
    const displayField = field === 'effectiveStartDate' ? 'displayStartDate' : 'displayEndDate';
    let value = e.target.value;
    
    // If using the date picker, convert to our display format
    if (e.target.type === 'date' && value) {
      const apiDate = value; // Store the original YYYY-MM-DD format for API
      
      const updatedItems = selectedItems.map(item => {
        if (item.id === itemId) {
          return { 
            ...item, 
            [field]: apiDate, 
            [displayField]: formatDateForDisplay(apiDate)
          };
        }
        return item;
      });
      
      setSelectedItems(updatedItems);
    } else {
      // For manual input, handle the formatting directly
      // Only allow digits and slashes
      value = value.replace(/[^\d/]/g, '');
      
      // Auto-format as user types (MM/DD/YY)
      if (value.length > 0) {
        // First, strip any existing slashes
        const digitsOnly = value.replace(/\//g, '');
        
        if (digitsOnly.length <= 2) {
          // Just show the month digits
          value = digitsOnly;
        } else if (digitsOnly.length <= 4) {
          // Format as MM/DD
          value = `${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2)}`;
        } else {
          // Format as MM/DD/YY
          value = `${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2, 4)}/${digitsOnly.substring(4, 6)}`;
        }
      }
      
      // Update the display value
      const updatedItems = selectedItems.map(item => {
        if (item.id === itemId) {
          // If we have a complete date in MM/DD/YY format, update the API format too
          const isComplete = /^\d{2}\/\d{2}\/\d{2}$/.test(value);
          return { 
            ...item, 
            [displayField]: value,
            [field]: isComplete ? parseDisplayDate(value) : item[field]
          };
        }
        return item;
      });
      
      setSelectedItems(updatedItems);
    }
  };

  // Open custom date picker modal instead of native browser picker
  const handleCalendarClick = (id: string | number, type: 'start' | 'end') => {
    // Instead of using the native date picker, we'll focus the input
    if (type === 'start' && startDateRefs.current[String(id)]) {
      startDateRefs.current[String(id)]?.focus();
    } else if (type === 'end' && endDateRefs.current[String(id)]) {
      endDateRefs.current[String(id)]?.focus();
    }
  };

  return (
    <div className="space-y-1">
      <h1 className="text-[#334155] text-[14px] font-normal leading-[20px] tracking-[0.25px] font-['Roboto']">
        Assign this insurance plan to an organization
      </h1>
      {selectedItems.length === 0 ? (
        <NoBox mode="assignPlan" />
      ) : (
        <div className="border border-[#D8DADC] rounded-[5px] overflow-hidden">
          <div className="flex h-[40px] flex-row items-center justify-center border-b border-[#D8DADC] bg-[#F3F4F6] px-1 text-xs font-medium text-[#919191]">
            <div className="flex-3 leading-tight">Organization</div>
            <div className="flex-2 leading-tight text-left pl-1">Effective Start Date</div>
            <div className="flex-2 leading-tight text-left pl-1">Effective End Date</div>
            <div className="w-[20px]"></div>
          </div>
          {selectedItems.map((item) => (
            <div key={item.id} className="flex h-[40px] flex-row items-center justify-center px-1 text-xs border-b border-[#D8DADC] last:border-b-0">
              <div className="flex-3 leading-tight overflow-hidden text-ellipsis font-['Roboto'] text-[12px] font-normal leading-[16px] tracking-[0.4px] text-[#334155]">
                {item.text}
              </div>
              <div className="flex-2 px-1">
                <div className="flex w-[120px] items-center gap-[5px] rounded-[5px] border border-dashed border-[#D8DADC] bg-[#F3F4F6] p-[5px]">
                  <Calendar 
                    className="h-3 w-3 text-gray-400 cursor-pointer" 
                    onClick={() => handleCalendarClick(item.id, 'start')}
                  />
                  <input
                    ref={(el) => (startDateRefs.current[String(item.id)] = el)}
                    type="text"
                    placeholder="mm/dd/yy"
                    className="h-full w-full bg-transparent focus:outline-none focus:text-[#1E4477]"
                    value={item.displayStartDate || ''}
                    onChange={(e) => handleDateInputChange(e, item.id, 'effectiveStartDate')}
                    onKeyDown={(e) => {
                      const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', '/'];
                      if (!allowedKeys.includes(e.key) && !/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex-2 px-1">
                <div className="flex w-[120px] items-center gap-[5px] rounded-[5px] border border-dashed border-[#D8DADC] bg-[#F3F4F6] p-[5px]">
                  <Calendar 
                    className="h-3 w-3 text-gray-400 cursor-pointer" 
                    onClick={() => handleCalendarClick(item.id, 'end')}
                  />
                  <input
                    ref={(el) => (endDateRefs.current[String(item.id)] = el)}
                    type="text"
                    placeholder="mm/dd/yy"
                    className="h-full w-full bg-transparent focus:outline-none focus:text-[#1E4477]"
                    value={item.displayEndDate || ''}
                    onChange={(e) => handleDateInputChange(e, item.id, 'effectiveEndDate')}
                    onKeyDown={(e) => {
                      const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', '/'];
                      if (!allowedKeys.includes(e.key) && !/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>
              <div 
                className={`w-[20px] ${item.id === lockedOrgId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => item.id !== lockedOrgId && toggleItemSelection(item)}
              >
                <TrashIcon />
              </div>
            </div>
          ))}
        </div>
      )}
      <Toggler toggle={toggle} selectedCount={selectedItems.length} />
      {showDropdown && (
        <div className="max-h-[150px] w-full overflow-auto text-xs border border-t-0 border-[#D8DADC] rounded-b-[5px]">
          {companies.length > 0 ? (
  companies
    .filter(item => !selectedItems.some(selected => selected.id === item.id))
    .map((item) => {
      // Use the right property name
      const displayName = item.text || item.organization || 'Unnamed';
      return (
        <div
          key={item.id}
          className="flex h-[40px] min-h-[40px] w-full cursor-pointer items-center pl-2 border-b border-[#D8DADC] last:border-b-0"
          onClick={() => toggleItemSelection({id: item.id, text: displayName})}
        >
          <div className="mr-2 flex h-[18px] w-[18px] items-center justify-center rounded-[3px] border-[1px] border-[#D8DADC] bg-white">
            <Check size={14} color="white" strokeWidth={3} />
          </div>
          <span className="text-[12px] text-[#334155] font-['Roboto'] leading-[16px] tracking-[0.4px] whitespace-nowrap overflow-hidden text-ellipsis !text-black !block">
            {displayName}
          </span>
        </div>
      );
    })
) : (
  <div className="p-2 text-gray-500">No organizations available</div>
)}
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className={`flex h-[40px] min-h-[40px] w-full items-center pl-2 border-b border-[#D8DADC] last:border-b-0 ${item.id === lockedOrgId ? 'bg-gray-200 cursor-not-allowed' : 'cursor-pointer bg-[#F3F4F6]'}`}
              onClick={() => item.id !== lockedOrgId && toggleItemSelection(item)}
            >
              <div className="mr-2 flex h-[18px] w-[18px] items-center justify-center rounded-[3px] border-[1px] border-[#D8DADC] bg-[#18D9B3]">
                <Check size={14} color="white" strokeWidth={3} />
              </div>
              <span className="text-[12px] text-[#334155] font-['Roboto'] leading-[16px] tracking-[0.4px] whitespace-nowrap overflow-hidden text-ellipsis !text-black !block">
                {item.text || 'Unnamed'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizationAssigner;