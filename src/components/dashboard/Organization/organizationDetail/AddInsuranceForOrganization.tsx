import React, { useState, useEffect, useRef } from "react";
import Image7 from '../../../../assets/Image7.png';
import { fetchInsurance, fetchCompanyDetails, updateCompanyDetails } from "../../../../services/axios";
import { InfoIcon, ChevronIcon, SearchIcon, CloseIcon } from "./AssignIcons";

interface InsurancePlan {
  id: string;
  plan_name: string;
  provider: string | null;
  coverage_type?: string | null;
  plan_type?: string;
  benefit_effective_start_dt?: string | null;
}

interface AddInsuranceFormProps {
  insurancePlans: InsurancePlan[];
  onClose: () => void;
  onSuccess?: () => void;
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

const AddInsuranceForm: React.FC<AddInsuranceFormProps> = ({
  insurancePlans,
  onClose,
  onSuccess,
}) => {
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<InsurancePlan[]>([]);
  const [selectedSearchPlans, setSelectedSearchPlans] = useState<InsurancePlan[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [organizationPlans, setOrganizationPlans] = useState<InsurancePlan[]>([]);
  const [isLoadingOrganizationPlans, setIsLoadingOrganizationPlans] = useState(false);
  const [organizationDetails, setOrganizationDetails] = useState<any>(null);
  const [allInsurancePlans, setAllInsurancePlans] = useState<InsurancePlan[]>([]);
  const [isLoadingAllPlans, setIsLoadingAllPlans] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Get organization ID from URL
  const getOrganizationId = () => {
    return window.location.pathname.split('/').filter(Boolean).pop() || '';
  };

  // Fetch all insurance plans for the dropdown
  useEffect(() => {
    const fetchAllInsurancePlans = async () => {
      setIsLoadingAllPlans(true);
      try {
        const response = await fetchInsurance("");
        console.log("Fetched all insurance plans:", response);
        
        // Handle both array and object-with-result cases
        const plans = Array.isArray(response) ? response : response.result || [];
        setAllInsurancePlans(plans);
        
        if (!plans.length) {
          console.warn("No plans found in response:", response);
        }
      } catch (error) {
        console.error("Failed to fetch insurance plans:", error);
        setAllInsurancePlans([]);
      } finally {
        setIsLoadingAllPlans(false);
      }
    };
  
    fetchAllInsurancePlans();
  }, []);

  // Fetch current insurance plans for the organization
  useEffect(() => {
    const fetchOrganizationInsurancePlans = async () => {
      setIsLoadingOrganizationPlans(true);
      try {
        // Get organization ID from URL
        const organizationId = getOrganizationId();
        
        // Fetch organization details with proper ID
        const response = await fetchCompanyDetails(organizationId);
        setOrganizationDetails(response);
        
        if (response && response.benefit_plans) {
          // Map the benefit plans to our expected format
          const orgPlans: InsurancePlan[] = response.benefit_plans.map((plan: any) => ({
            id: plan.id,
            plan_name: plan.plan_name,
            provider: plan.provider,
            coverage_type: plan.coverage_type
          }));
          
          setOrganizationPlans(orgPlans);
          
          // Initialize selected plan IDs with the organization's current plans
          setSelectedPlanIds(orgPlans.map(plan => plan.id));
        }
      } catch (error) {
        console.error("Failed to fetch organization insurance plans:", error);
      } finally {
        setIsLoadingOrganizationPlans(false);
      }
    };

    fetchOrganizationInsurancePlans();
  }, []);

  // Handle clicks outside the dropdown and search results
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

  // Fix component z-index to prevent conflicts with background components
  useEffect(() => {
    if (formRef.current) {
      formRef.current.style.zIndex = "9999";
    }
    
    // Add a backdrop to prevent interaction with background components
    
  }, []);

  // Function to search insurance plans
  const searchInsurance = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
  
    setIsSearching(true);
    try {
      const response = await fetchInsurance(term);
      console.log("Search results:", response);
      
      // Handle both array and object-with-result cases
      const plans = Array.isArray(response) ? response : response.result || [];
      setSearchResults(plans);
      setShowSearchResults(true);
      
      if (!plans.length) {
        console.warn("No search results found for term:", term);
      }
    } catch (error) {
      console.error("Failed to fetch insurance data:", error);
      setSearchResults([]);
      setShowSearchResults(false);
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
  const handleSave = async () => {
    // Combine plans from both dropdown and search
    const dropdownPlanIds = selectedPlanIds;
    const searchPlanIds = selectedSearchPlans.map(plan => plan.id);
    
    // Combine all selected plan IDs (removing duplicates)
    const allSelectedPlanIds = [...new Set([...dropdownPlanIds, ...searchPlanIds])];
    
    if (allSelectedPlanIds.length === 0) {
      alert("Please select at least one insurance plan.");
      return;
    }
    
    try {
      const organizationId = getOrganizationId();
      
      // Prepare the data for updating the organization
      const updateData = {
        org_name: organizationDetails?.org_name || "",
        org_address: organizationDetails?.org_address || "",
        billing_contact_name: organizationDetails?.billing_contact_name || "",
        billing_contact_email: organizationDetails?.billing_contact_email || "",
        benefit_plan_ids: allSelectedPlanIds,
        start_date: organizationDetails?.start_date ,
        admin_emails: organizationDetails?.admins?.map((admin: any) => admin.email) || []
      };
      
      // Call the update function
      await updateCompanyDetails(organizationId, updateData);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Close the form
      onClose();
    } catch (error) {
      console.error("Failed to update organization insurance plans:", error);
      alert("Failed to update insurance plans. Please try again.");
    }
  };

  // Get selected plan names from dropdown
  const getSelectedPlanNames = () => {
    return selectedPlanIds.map(id => {
      // First check in all insurance plans
      const plan = allInsurancePlans.find(p => p.id === id);
      if (plan) return plan.plan_name;
      
      // Then check in organization plans if not found
      const orgPlan = organizationPlans.find(p => p.id === id);
      if (orgPlan) return orgPlan.plan_name;
      
      // Finally check in the provided insurancePlans prop
      const propPlan = insurancePlans.find(p => p.id === id);
      return propPlan ? propPlan.plan_name : "";
    }).filter(name => name !== "");
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (searchResults.length > 0) {
      setShowSearchResults(true);
    }
  };

  // Determine plans to display in dropdown
  const plansToDisplay = allInsurancePlans.length > 0 ? allInsurancePlans : insurancePlans;

  return (
    <div ref={formRef} className="fixed inset-y-0 right-0 w-[600px] h-full bg-white shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 self-stretch p-6 bg-[#E3E3E4] text-[#334155] text-center text-xl font-medium">
        Add Insurance Plan
      </div>

      {/* Content */}
      <div className="flex flex-col p-6 gap-4 flex-1 overflow-y-auto">
        <div className="flex flex-col items-start w-full">
          <div className="text-[#334155] text-sm font-normal mb-6 leading-5 tracking-[0.25px]">
            Add or remove insurance plans linked to this organization.
          </div>

          {/* Loading State for All Plans */}
          {isLoadingAllPlans && (
            <div className="w-full text-center py-4">
              Loading insurance plans...
            </div>
          )}

          {/* Select Insurance Dropdown */}
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
                  {plansToDisplay.length > 0 ? (
                    plansToDisplay.map((plan) => {
                      // Check if this plan is a current organization plan
                      const isOrganizationPlan = organizationPlans.some(orgPlan => orgPlan.id === plan.id);
                      
                      return (
                        <div
                          key={plan.id}
                          className={`flex items-center justify-between gap-2.5 self-stretch px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                            isOrganizationPlan ? 'bg-blue-50' : ''
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
                                {isOrganizationPlan && (
                                  <span className="ml-2 text-xs text-blue-600">
                                    (Current)
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
          onClick={handleSave}
          disabled={selectedPlanIds.length === 0 && selectedSearchPlans.length === 0}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AddInsuranceForm;