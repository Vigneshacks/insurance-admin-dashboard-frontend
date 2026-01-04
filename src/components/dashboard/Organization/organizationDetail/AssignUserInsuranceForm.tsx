import React, { useState, useEffect, useRef } from "react";
import Image7 from '../../../../assets/Image7.png';
import { fetchInsurance, fetchEmployees } from "../../../../services/axios";
import { InfoIcon, ChevronIcon, SearchIcon, CloseIcon} from "./AssignIcons";

interface InsurancePlan {
  id: string;
  plan_name: string;
  provider: string | null;
  coverage_type?: string | null;
  plan_type?: string;
  benefit_effective_start_dt?: string | null;
}

interface UserInsuranceInfo {
  userId: string;
  plans: InsurancePlan[];
}

interface AssignInsuranceFormProps {
  selectedUserCount: number;
  selectedUsers?: string[]; // Array of selected user IDs
  insurancePlans: InsurancePlan[];
  onAssign: (selectedPlanIds: string[]) => void; // Updated to accept an array
  onClose: () => void;
}

const LabelChip: React.FC<{ label: string; onRemove: (e: React.MouseEvent) => void }> = ({ label, onRemove }) => (
  <div className="flex items-center pt-[0.3125rem] pb-[0.3125rem] pr-[0.3125rem] pl-2 rounded-full bg-gray-100 mr-2 mb-1">
    <div className="text-[11px] overflow-hidden text-[#494949] font-medium leading-[16px]">
      {label}
    </div>
    <div className="ml-1 cursor-pointer" onClick={onRemove}>
      <CloseIcon />
    </div>
  </div>
);

const AssignInsuranceForm: React.FC<AssignInsuranceFormProps> = ({
  selectedUserCount = 0,
  selectedUsers = [],
  insurancePlans,
  onAssign,
  onClose,
}) => {
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<InsurancePlan[]>([]);
  const [selectedSearchPlans, setSelectedSearchPlans] = useState<InsurancePlan[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [userCurrentPlans, setUserCurrentPlans] = useState<UserInsuranceInfo[]>([]);
  const [isLoadingUserPlans, setIsLoadingUserPlans] = useState(false);
  const [commonPlanId, setCommonPlanId] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Get organization ID from URL
  const getOrganizationId = () => {
    return window.location.pathname.split('/').filter(Boolean).pop() || '';
  };

  // Fetch current insurance plans for selected users
  useEffect(() => {
    const fetchUserInsurancePlans = async () => {
      if (selectedUsers && selectedUsers.length > 0) {
        setIsLoadingUserPlans(true);
        try {
          // Create an array to store each user's plans
          const userPlansData: UserInsuranceInfo[] = [];
          
          // Loop through each selected user and fetch their company details
          for (const userId of selectedUsers) {
            try {
              // Get company ID from URL
              const companyId = getOrganizationId();
              
              // Fetch employee data with proper company ID
              const response = await fetchEmployees(companyId);
              
              // Find the specific user in the employees list
              const userDetails = response.result.find((emp: any) => emp.id === userId);
              
              if (userDetails && userDetails.benefit_plan) {
                // Map the benefit plans to our expected format
                const userPlans: InsurancePlan[] = userDetails.benefit_plan.map((plan: any) => ({
                  id: plan.id,
                  plan_name: plan.plan_name,
                  provider: plan.provider,
                  coverage_type: plan.coverage_type
                }));
                
                userPlansData.push({ userId, plans: userPlans });
              } else {
                userPlansData.push({ userId, plans: [] });
              }
            } catch (error) {
              console.error(`Failed to fetch details for user ${userId}:`, error);
              userPlansData.push({ userId, plans: [] });
            }
          }
          
          setUserCurrentPlans(userPlansData);
          
          // Find common plans across all users (if any)
          findCommonPlans(userPlansData);
          
        } catch (error) {
          console.error("Failed to fetch user insurance plans:", error);
        } finally {
          setIsLoadingUserPlans(false);
        }
      }
    };

    fetchUserInsurancePlans();
  }, [selectedUsers]);
  
  // Find common plans across all users
  const findCommonPlans = (userPlansData: UserInsuranceInfo[]) => {
    if (userPlansData.length === 0) return;
    
    // Get all plans from the first user
    const firstUserWithPlans = userPlansData.find(user => user.plans.length > 0);
    
    if (!firstUserWithPlans) {
      // No users have plans
      setCommonPlanId(null);
      return;
    }
    
    // Check each plan from the first user to see if all other users have it
    const commonPlans = firstUserWithPlans.plans.filter(plan => 
      userPlansData.every(user => 
        user.plans.some(userPlan => userPlan.id === plan.id)
      )
    );
    
    if (commonPlans.length > 0) {
      setCommonPlanId(commonPlans[0].id);
      // Initialize with common plans
      setSelectedPlanIds(commonPlans.map(plan => plan.id));
    } else {
      setCommonPlanId(null);
    }
  };

  // Handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to search insurance plans with organization_id
  const searchInsurance = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Get organization ID from URL
      const organizationId = getOrganizationId();
      
      // Call fetchInsurance with organization_id parameter
      const result = await fetchInsurance(term, undefined, organizationId);
      setSearchResults(result);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Failed to fetch insurance data", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Effect to handle search term changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchInsurance(searchTerm);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle plan selection from dropdown
  const handlePlanSelect = (planId: string) => {
    setSelectedPlanIds(prev => {
      if (prev.includes(planId)) {
        return prev.filter(id => id !== planId);
      } else {
        return [...prev, planId];
      }
    });
  };

  // Handle plan selection from search
  const handleSearchPlanSelect = (plan: InsurancePlan) => {
    // Check if the plan is already selected
    const isAlreadySelected = selectedSearchPlans.some(p => p.id === plan.id);
    
    if (isAlreadySelected) {
      setSelectedSearchPlans(prev => prev.filter(p => p.id !== plan.id));
    } else {
      setSelectedSearchPlans(prev => [...prev, plan]);
    }
  };

  // Remove selected plan by ID
  const handleRemovePlan = (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPlanIds(prev => prev.filter(id => id !== planId));
  };

  // Remove selected search plan
  const handleRemoveSearchPlan = (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSearchPlans(prev => prev.filter(plan => plan.id !== planId));
  };

  // Handle form submission
  const handleAssign = () => {
    // Combine plans from both dropdown and search
    const dropdownPlanIds = selectedPlanIds;
    const searchPlanIds = selectedSearchPlans.map(plan => plan.id);
    
    // Combine all selected plan IDs (removing duplicates)
    const allSelectedPlanIds = [...new Set([...dropdownPlanIds, ...searchPlanIds])];
    
    if (allSelectedPlanIds.length === 0) {
      alert("Please select at least one insurance plan.");
      return;
    }
    
    // Send ALL selected plan IDs to the parent component
    onAssign(allSelectedPlanIds);
  };

  // Get selected plan names from dropdown
  const getSelectedPlanNames = () => {
    return selectedPlanIds.map(id => {
      const plan = insurancePlans.find(p => p.id === id);
      return plan ? plan.plan_name : "";
    }).filter(name => name !== "");
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (searchResults.length > 0) {
      setShowSearchResults(true);
    }
  };

  // Check if a user has a specific plan
  const getUsersWithPlan = (planId: string) => {
    if (!userCurrentPlans.length) return 0;
    
    return userCurrentPlans.filter(user => 
      user.plans.some(plan => plan.id === planId)
    ).length;
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[600px] h-full bg-white shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 self-stretch p-6 bg-[#1E4477] text-white text-center text-xl font-medium">
        Assign Insurance Plan
      </div>

      {/* Content */}
      <div className="flex flex-col p-6 gap-4 flex-1 overflow-y-auto">
        <div className="flex flex-col items-start w-full">
          <div className="text-[#334155] text-sm font-normal mb-6 leading-5 tracking-[0.25px]">
            Assign <span className="font-bold">{selectedUserCount}</span> users to an insurance plan
          </div>

          {/* Select Insurance Dropdown - FIXED SECTION */}
          <div className="flex flex-col items-start w-full mb-4">
            <div className="relative w-full" ref={dropdownRef}>
              <div
                className="flex flex-col w-[550px] h-[56px] rounded border border-gray-300 bg-white cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex items-center justify-between w-full px-4 py-3">
                  <div className="flex flex-wrap items-center w-5/6">
                    <div className="absolute -top-2 left-2 px-1 bg-white text-xs text-[#1e4477]">
                      Select Insurance 
                    </div>
                    {selectedPlanIds.length > 0 ? (
                      <>
                        {getSelectedPlanNames().map((name, index) => (
                          <LabelChip 
                            key={`org-plan-${index}`}
                            label={name} 
                            onRemove={(e) => handleRemovePlan(selectedPlanIds[index], e)} 
                          />
                        ))}
                      </>
                    ) : (
                      <div className="text-sm text-gray-400">
                        Select organization-associated insurance plans
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="p-2 rounded-full">
                      <ChevronIcon isOpen={isDropdownOpen} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dropdown Options */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-bl rounded-br border border-[#d8dadc] bg-white shadow-lg">
                  {insurancePlans.length > 0 ? (
                    insurancePlans.map((plan) => {
                      // Calculate how many users already have this plan
                      const usersWithThisPlan = getUsersWithPlan(plan.id);
                      
                      return (
                        <div
                          key={plan.id}
                          className={`flex items-center justify-between gap-2.5 self-stretch px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                            commonPlanId === plan.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlanSelect(plan.id);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {/* Insurance Icon */}
                            <div className="flex items-center justify-center w-8 h-8 rounded-sm">
                              <img
                                src={Image7}
                                alt="Insurance Icon"
                                className="w-6 h-6"
                              />
                            </div>

                            {/* Plan Name */}
                            <div className="flex flex-col">
                              <div className="text-slate-700 text-sm font-medium">
                                {plan.plan_name}
                                {usersWithThisPlan > 0 && selectedUserCount > 0 && (
                                  <span className="ml-2 text-xs text-blue-600">
                                    ({usersWithThisPlan === selectedUserCount ? 'All users' : `${usersWithThisPlan}/${selectedUserCount} users`})
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-500 text-xs">
                                {plan.provider || "No provider"}
                              </div>
                            </div>
                          </div>

                          {/* Checkbox */}
                          <div className="flex items-center justify-center w-5 h-5">
                            {selectedPlanIds.includes(plan.id) ? (
                              <div className="w-5 h-5 rounded-sm bg-[#18D9B3] flex items-center justify-center">
                                <svg
                                  width={16}
                                  height={16}
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M6.67 10.9333L4 8.26667L4.94 7.33333L6.67 9.06667L11.06 4.66667L12 5.6L6.67 10.9333Z"
                                    fill="white"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-sm border-2 border-[#18D9B3]"></div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-4 px-4 text-center text-gray-500">
                      No insurance plans available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Divider with "OR" */}
          <div className="flex items-center justify-center w-full my-4">
            <div className="h-px bg-gray-300 flex-grow"></div>
            <div className="mx-4 text-gray-400 text-xs font-medium">OR</div>
            <div className="h-px bg-gray-300 flex-grow"></div>
          </div>

          {/* Search Insurance Field */}
          <div className="flex flex-col items-start w-full mb-6">
            <div className="relative w-full" ref={searchRef}>
              <div className="flex flex-col w-[550px] rounded border border-gray-300 bg-white">
                <div className="flex flex-col w-full px-4 py-3">
                  <div className="flex-1">
                    <div className="absolute -top-2 left-2 px-1 bg-white text-xs text-[#1e4477]">
                      Search Insurance 
                    </div>
                    
                    {/* Display selected search plans */}
                    {selectedSearchPlans.length > 0 && (
                      <div className="flex flex-wrap mb-2">
                        {selectedSearchPlans.map((plan) => (
                          <LabelChip 
                            key={`search-plan-${plan.id}`}
                            label={plan.plan_name} 
                            onRemove={(e) => handleRemoveSearchPlan(plan.id, e)} 
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Search input */}
                    <div className="flex items-center">
                      <SearchIcon />
                      <input
                        type="text"
                        className="w-full text-sm placeholder-gray-400 focus:outline-none"
                        placeholder="Search for plans that are already in Decipher"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={handleSearchFocus}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              {showSearchResults && searchResults.length > 0 && searchTerm && (
                <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-bl rounded-br border border-[#d8dadc] bg-white shadow-lg">
                  {searchResults.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between gap-2.5 self-stretch px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSearchPlanSelect(plan)}
                    >
                      <div className="flex items-center gap-2">
                        {/* Info Icon */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-sm">
                          <InfoIcon />
                        </div>

                        {/* Plan Name */}
                        <div className="flex flex-col">
                          <div className="text-slate-700 text-sm font-medium">
                            {plan.plan_name}
                          </div>
                          <div className="text-slate-500 text-xs">
                            {plan.provider || plan.coverage_type || plan.plan_type || "No provider"}
                          </div>
                        </div>
                      </div>

                      {/* Checkbox */}
                      <div className="flex items-center justify-center w-5 h-5">
                        {selectedSearchPlans.some(p => p.id === plan.id) ? (
                          <div className="w-5 h-5 rounded-sm bg-[#18D9B3] flex items-center justify-center">
                            <svg
                              width={16}
                              height={16}
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M6.67 10.9333L4 8.26667L4.94 7.33333L6.67 9.06667L11.06 4.66667L12 5.6L6.67 10.9333Z"
                                fill="white"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-sm border-2 border-[#18D9B3]"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Loading State */}
              {isSearching && (
                <div className="absolute z-10 w-full mt-1 p-4 rounded-bl rounded-br border border-[#d8dadc] bg-white shadow-lg text-center">
                  Searching...
                </div>
              )}
              
              {/* No Results */}
              {searchTerm && !isSearching && showSearchResults && searchResults.length === 0 && (
                <div className="absolute z-10 w-full mt-1 p-4 rounded-bl rounded-br border border-[#d8dadc] bg-white shadow-lg text-center text-gray-500">
                  No insurance plans found
                </div>
              )}
            </div>
          </div>

          {/* Selected Plans Summary */}
          {(selectedPlanIds.length > 0 || selectedSearchPlans.length > 0) && (
            <div className="w-full mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <div className="text-sm font-medium text-blue-700">
                Selected Plans: {selectedPlanIds.length + selectedSearchPlans.length}
              </div>
              <div className="text-xs text-blue-600">
                {[...getSelectedPlanNames(), ...selectedSearchPlans.map(p => p.plan_name)].join(", ")}
              </div>
            </div>
          )}

          <div className="flex-grow"></div>
        </div>
      </div>

          {/* Selected Plan Counter */}
{/* Selected Plan Counter */}
<div className="flex justify-end w-full" style={{ marginBottom: '15px', paddingRight: '30px' }}>
  <div className="text-[#1E4477]">
    <span style={{ 
      fontSize: '14px', 
      fontWeight: 700, 
      lineHeight: '20px', 
      letterSpacing: '0.25px' 
    }}>
      {selectedPlanIds.length + selectedSearchPlans.length}
    </span>
    <span style={{ 
      fontSize: '14px', 
      fontWeight: 400, 
      lineHeight: '20px', 
      letterSpacing: '0.25px' 
    }}>
      {" insurance plan selected"}
    </span>
  </div>
</div>


      {/* Action Buttons */}
      <div className="flex items-center justify-start gap-2.5 p-6 ">
        <button
          className="h-10 w-[270px] px-6 py-2 rounded border border-gray-300 bg-white text-[#1e4477] text-sm font-medium"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className={`h-10 w-[270px] px-6 py-2 rounded ${
            selectedPlanIds.length > 0 || selectedSearchPlans.length > 0
              ? "bg-[#E3E3E4] text-[#919191]"
              : "bg-[#e3e3e4] text-[#919191]"
          } text-sm font-medium`}
          onClick={handleAssign}
          disabled={selectedPlanIds.length === 0 && selectedSearchPlans.length === 0}
        >
          Assign
        </button>
      </div>
    </div>
  );
};

export default AssignInsuranceForm;