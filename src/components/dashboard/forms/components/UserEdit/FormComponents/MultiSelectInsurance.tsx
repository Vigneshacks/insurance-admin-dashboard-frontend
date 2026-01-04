import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Arrows } from "./Icon";
import InsuranceChip from "./InsuranceChip";
import { fetchInsurance } from "../../../../../../services/axios";
import { toast } from "react-toastify";

interface MultiSelectInsuranceProps {
  label: string;
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  options?: { id: number; name: string }[];
  required?: boolean;
  loading?: boolean;
}

const MultiSelectInsurance: React.FC<MultiSelectInsuranceProps> = ({
  label,
  selectedIds,
  onChange,
  options: initialOptions = [],
  required = false,
  loading: initialLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [options, setOptions] = useState<{ id: number; name: string }[]>(initialOptions);
  const [loading, setLoading] = useState(initialLoading);

  useEffect(() => {
    // If no options are provided, fetch them dynamically
    if (initialOptions.length === 0 && !initialLoading) {
      const loadInsurancePlans = async () => {
        try {
          setLoading(true);
          const plans = await fetchInsurance();
          const formattedPlans = plans.map(plan => ({
            id: plan.id,
            name: plan.plan_name
          }));
          setOptions(formattedPlans);
        } catch (error) {
          console.error("Failed to fetch insurance plans:", error);
          toast.error("Failed to load insurance plans");
        } finally {
          setLoading(false);
        }
      };

      loadInsurancePlans();
    }
  }, [initialOptions, initialLoading]);

  const toggleDropdown = () => {
    if (!loading) {
      setIsOpen(!isOpen);
      setIsFocused(!isOpen);
    }
  };

  const handleSelect = (id: number) => {
    const newSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];
    
    onChange(newSelectedIds);
  };

  const handleRemove = (id: number) => {
    onChange(selectedIds.filter(selectedId => selectedId !== id));
  };

  const selectedInsurances = options.filter(option => 
    selectedIds.includes(option.id)
  );

  return (
    <div className="flex flex-col items-start self-stretch mb-5 mx-6">
      <div className={`flex flex-col items-start gap-2.5 self-stretch min-h-14 rounded border ${isFocused ? "border-[#18D9B3]" : "border-[#d8dadc]"} bg-white relative`}>
        <label
          className="absolute left-[-0.25rem] flex items-center py-0 px-1 top-[-0.75rem] bg-white text-[#1e4477] z-10 text-[12px] leading-[16px]"
          htmlFor="assigned_insurance"
        >
          {label} {required && <span className="text-[#1e4477]">*</span>}
        </label>
        
        <div 
          className="content flex flex-wrap items-center py-1 min-h-12 w-full px-[0.9375rem] cursor-pointer"
          onClick={toggleDropdown}
        >
          {loading ? (
            <span className="font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155]">
              Loading insurance plans...
            </span>
          ) : selectedInsurances.length > 0 ? (
            selectedInsurances.map((insurance) => (
              <InsuranceChip 
                key={insurance.id} 
                insurance={insurance} 
                onRemove={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.stopPropagation();
                  handleRemove(insurance.id);
                }}
              />
            ))
          ) : (
            <span className="font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155]">
              Select Insurance Plans
            </span>
          )}
          
          <div className="ml-auto flex items-center text-gray-500">
            <Arrows />
          </div>
        </div>
        
        {isOpen && !loading && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-b-md z-20 border border-t-0 border-[#d8dadc] max-h-48 overflow-y-auto">
            {options.length > 0 ? (
              options.map(option => (
                <div 
                  key={option.id}
                  className="px-[0.9375rem] py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option.id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(option.id)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  <span className="font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155]">
                    {option.name}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-[0.9375rem] py-2 text-gray-500">
                No insurance plans available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectInsurance;