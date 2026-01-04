"use client";

import { useState, useEffect, useRef } from "react";
import { useDashboard } from "../../../context/DashboardContext";
import { createUser, fetchInsurance, fetchCompanies } from "../../../services/axios";
import { toast } from "react-toastify";
import { User } from "../../../types/dashboard.types";
import ActionButtons from "./components/ActionButtons";
import Input from "./components/Input";

// Custom Calendar Icon Component with onClick functionality
const CustomCalendarIcon = ({ onClick }) => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}
    className="cursor-pointer"
  >
    <path
      d="M2.25 4.75C2.25 3.64543 3.14543 2.75 4.25 2.75H13.75C14.8546 2.75 15.75 3.64543 15.75 4.75V6.25H2.25V4.75Z"
      fill="white"
    />
    <path
      d="M5.75 2.75V0.75"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.25 2.75V0.75"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.75 2.75H4.25C3.14543 2.75 2.25 3.64543 2.25 4.75V13.25C2.25 14.3546 3.14543 15.25 4.25 15.25H13.75C14.8546 15.25 15.75 14.3546 15.75 13.25V4.75C15.75 3.64543 14.8546 2.75 13.75 2.75Z"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.25 6.25H15.75"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.25 11.75C11.8023 11.75 12.25 11.3023 12.25 10.75C12.25 10.1977 11.8023 9.75 11.25 9.75C10.6977 9.75 10.25 10.1977 10.25 10.75C10.25 11.3023 10.6977 11.75 11.25 11.75Z"
      fill="#1E4477"
      stroke="#1E4477"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Custom dropdown arrow component
const Arrows = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 9l-7 7-7-7"
    ></path>
  </svg>
);

// Insurance Plan Chip with remove option
const LabelChip = ({ label, onRemove }) => (
  <div className="mr-2 mb-1 flex items-center rounded-full bg-gray-100 pt-[0.3125rem] pr-[0.3125rem] pb-[0.3125rem] pl-2">
    <div className="mr-1 text-[13px] leading-[16px] font-medium text-[#1e4477]">
      {label}
    </div>
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onRemove}
      className="cursor-pointer"
    >
      <path
        d="M14 4L4 14"
        stroke="#919191"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 4L14 14"
        stroke="#919191"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);


// Custom Select Component to match Input styling
const CustomSelect = ({
  id,
  name,
  value,
  onChange,
  required,
  label,
  options,
  loading = false,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
  loading?: boolean;
}) => {
  return (
    <div className="mb-3 flex flex-col items-start self-stretch">
      <div className="relative flex h-14 flex-col items-start gap-2.5 self-stretch rounded border border-[#d8dadc] bg-white">
        <label
          htmlFor={id}
          className="absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]"
        >
          {label}
          {required && <span>*</span>}
        </label>
        <div className="content flex h-12 w-full items-center gap-2.5 py-1">
          <select
            id={id}
            name={name}
            className="font-roboto w-full appearance-none bg-white px-[0.9375rem] py-1 text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155] focus:outline-none"
            value={value}
            onChange={onChange}
            required={required}
            disabled={loading}
          >
            {loading ? (
              <option value="" disabled>
                Loading organizations...
              </option>
            ) : (
              options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <Arrows />
          </div>
        </div>
      </div>
    </div>
  );
};

// Multi-Select Component for Insurance Plans
const MultiSelect = ({
  id,
  name,
  selectedValues,
  onSelect,
  onRemove,
  required,
  label,
  options,
  labelRenderer,
  loading = false,
}: {
  id: string;
  name: string;
  selectedValues: string[];
  onSelect: (value: string) => void;
  onRemove: (value: string) => void;
  required?: boolean;
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
  labelRenderer: (value: string) => string;
  loading?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    // Keep dropdown open for multiple selections
  };

  return (
    <div
      className="mb-3 flex flex-col items-start self-stretch"
      ref={dropdownRef}
    >
      <div className="relative flex min-h-14 flex-col items-start gap-2.5 self-stretch rounded border border-[#d8dadc] bg-white">
        <label
          htmlFor={id}
          className="absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]"
        >
          {label}
          {required && <span>*</span>}
        </label>

        <div
          className="content flex min-h-12 w-full cursor-pointer flex-wrap items-center gap-1 px-[0.9375rem] py-1"
          onClick={toggleDropdown}
        >
          {/* Display selected values as chips */}
          {selectedValues.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedValues.map((value) => (
                <LabelChip
                  key={value}
                  label={labelRenderer(value)}
                  onRemove={(e) => {
                    e.stopPropagation(); // Prevent toggling dropdown when removing
                    onRemove(value);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="font-roboto text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155]">
              {loading
                ? "Loading insurance plans..."
                : options.length <= 1
                ? "No insurance plans available"
                : "Select Insurance Plans"}
            </div>
          )}

          <div
            className="ml-auto text-gray-500"
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown();
            }}
          >
            <Arrows />
          </div>
        </div>

        {/* Dropdown menu with improved styling */}
        {isOpen && (
          <div className="absolute top-full left-0 z-50 max-h-48 w-full overflow-y-auto rounded-b-md border border-t-0 border-[#d8dadc] bg-white shadow-lg">
            {loading ? (
              <div className="px-[0.9375rem] py-2 text-gray-500">
                Loading insurance plans...
              </div>
            ) : options.length > 1 ? (
              options
                .filter((option) => option.value !== "")
                .map((option) => (
                  <div
                    key={option.value}
                    className={`cursor-pointer px-[0.9375rem] py-2 hover:bg-gray-100 ${
                      selectedValues.includes(option.value) ? "bg-gray-50" : ""
                    }`}
                    onClick={() =>
                      !selectedValues.includes(option.value) &&
                      handleSelect(option.value)
                    }
                  >
                    <span className="font-roboto text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155]">
                      {option.label}
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

        {/* Hidden input for form validation if needed */}
        <input
          type="hidden"
          name={name}
          value={selectedValues.join(",")}
          required={required}
        />
      </div>
    </div>
  );
};

// Role Chip Component
const RoleChip = ({ role }: { role: string }) => {
  let bgColor = "bg-[#e8fbf7]";
  let textColor = "text-[#0c6d5a]";

  if (role === "admin") {
    bgColor = "bg-[#E8F3FF]";
    textColor = "text-[#1e4477]";
  }

  return (
    <div
      className={`flex h-7 items-center justify-center rounded-full px-2 pt-[0.3125rem] pb-[0.3125rem] ${bgColor} font-['Roboto'] text-[11px] leading-[16px] font-medium ${textColor} whitespace-nowrap`}
    >
      {role}
    </div>
  );
};

// Insurance Plan type - updated to match API response
interface InsurancePlan {
  id: string;
  plan_name: string;
  plan_grp: string;
  coverage_type: string | null;
  provider: string | null;
  benefit_effective_start_dt: string | null;
  active_organizations: number;
  notes: string | null;
  plan_type: string;
}

// Company type to match API response
interface CompanyApiType {
  org_name: string;
  org_address: string;
  billing_contact_name: string;
  billing_contact_email: string;
  id: string;
  employee_count: number;
  admins: any[];
  benefit_plans: any[];
  start_date: string;
  renewal_date: string | null;
}

interface UserFormProps {
  onClose: () => void;
  onSubmit?: (newUser: User) => Promise<void>;
}

interface FormData {
  name: string;
  dateOfBirth: string;
  ssnLast4: string;
  email: string;
  phone: string;
  organization: string;
  startDate: string;
  role: string;
  assignedInsurance: string[];
}


const AddUserForm = ({ onClose }: UserFormProps) => {
  const { refreshData } = useDashboard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    dateOfBirth: "",
    ssnLast4: "",
    email: "",
    phone: "",
    organization: "",
    startDate: "",
    role: "",
    assignedInsurance: [],
  });
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [loadingInsurance, setLoadingInsurance] = useState(false);
  const [companies, setCompanies] = useState<CompanyApiType[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // References for date inputs to programmatically open date pickers
  const dateOfBirthRef = useRef<HTMLInputElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);

  // Load companies when component mounts
  useEffect(() => {
    // Fetch companies directly using the fetchCompanies function
    const loadOrganizations = async () => {
      try {
        setLoadingCompanies(true);
        // Using the fetchCompanies function from axios
        const companiesData = await fetchCompanies();
        setCompanies(companiesData);
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
        toast.error("Failed to load organizations");
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadOrganizations();
  }, []);

  // Fetch insurance plans when organization changes
  useEffect(() => {
    // Only fetch insurance plans if an organization is selected
    if (formData.organization) {
      const loadInsurancePlans = async () => {
        try {
          setLoadingInsurance(true);
          // Reset selected insurance plans when organization changes
          setFormData(prev => ({
            ...prev,
            assignedInsurance: []
          }));
          
          // Fetch insurance plans filtered by organization ID
          const plans = await fetchInsurance(
            undefined, // searchTerm
            undefined, // direction
            formData.organization // organization_id
          );
          
          setInsurancePlans(plans);
        } catch (error) {
          console.error("Failed to fetch insurance plans:", error);
          toast.error("Failed to load insurance plans for this organization");
          setInsurancePlans([]);
        } finally {
          setLoadingInsurance(false);
        }
      };

      loadInsurancePlans();
    } else {
      // Clear insurance plans if no organization is selected
      setInsurancePlans([]);
      setFormData(prev => ({
        ...prev,
        assignedInsurance: []
      }));
    }
  }, [formData.organization]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Close role select dropdown if role was changed
    if (name === "role") {
      setRoleSelectOpen(false);
    }
  };

  const handleRoleClick = () => {
    setRoleSelectOpen(!roleSelectOpen);
  };

  const selectRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
    setRoleSelectOpen(false);
  };

  // Handle insurance plan selection
  const handleInsuranceSelect = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedInsurance: [...prev.assignedInsurance, value],
    }));
  };

  // Handle insurance plan removal
  const handleInsuranceRemove = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedInsurance: prev.assignedInsurance.filter(
        (item) => item !== value
      ),
    }));
  };

  // Get insurance plan label by value (ID)
  const getInsurancePlanLabel = (value: string): string => {
    const plan = insurancePlans.find((plan) => plan.id === value);
    return plan ? plan.plan_name : value;
  };

  // Map frontend role values to API role values
  const mapRoleToApiRole = (uiRole: string): string => {
    const roleMap: Record<string, string> = {
      User: "subscriber",
      Admin: "admin",
    };

    return roleMap[uiRole] || "subscriber"; // Default to subscriber if no match
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Split the name into first and last name for the API
      const [firstName = "", lastName = ""] = formData.name.split(" ", 2);

      // Map the selected role to the appropriate API role value
      const apiRole = mapRoleToApiRole(formData.role);

      const userData = {
        first_name: firstName || "string",
        last_name: lastName,
        email: formData.email,
        work_email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        ssn_last4: formData.ssnLast4 || "0000",
        gender_assigned: "not_specified",
        role: apiRole, // Use the mapped role value
        status: "active",
        member_group_id: formData.organization,
        // Include start date in the API request
        start_date: formData.startDate
          ? new Date(formData.startDate).toISOString().split("T")[0]
          : null,
        // Pass selected insurance plan IDs as benefit_plan_ids
        benefit_plan_ids: formData.assignedInsurance,
      };

      console.log("Submitting user data:", userData);
      await createUser(userData);
      toast.success("User created successfully!");
      await refreshData();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create user";
      console.error("API Error:", error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare options for dropdowns
  const organizationOptions = [
    { value: "", label: "Select Organization" },
    ...(companies && companies.length > 0
      ? companies.map((company) => ({
          value: company.id,
          label: company.org_name, // Use org_name from API response
        }))
      : []),
  ];

  const roleOptions = [
    { value: "User", label: "User" },
    { value: "Admin", label: "Admin" },
  ];

  // Prepare insurance options using fetched plans with the correct property names
  const insuranceOptions = [
    { value: "", label: "Select Insurance Plan" },
    ...insurancePlans.map((plan) => ({
      value: plan.id,
      label: plan.plan_name,
    })),
  ];

  // Function to open date pickers when calendar icon is clicked
  const openDatePicker = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) {
      ref.current.type = "date";
      ref.current.focus();
      ref.current.click();
    }
  };

  return (
    <div className="fixed top-0 right-0 flex h-screen w-[35%] flex-col bg-white shadow-lg">
      <div className="bg-[#2B4C7E] p-4">
        <h1 className="text-xl font-normal text-white">Add User</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3 py-2 pl-1">
            {/* Name Field */}
            <Input
              formData={formData}
              valueName="name"
              placeholder="Sally Jenkins"
              required={true}
              handleChange={handleChange}
              label="Full Name"
              complex={false}
            />

            {/* Date of Birth */}
            <Input
              formData={formData}
              valueName="dateOfBirth"
              placeholder="MM/DD/YY"
              required={true}
              handleChange={handleChange}
              label="Date of Birth"
              complex={true}
              inputRef={dateOfBirthRef}
              onFocus={(e) => {
                e.target.type = "date";
              }}
              onBlur={(e) => {
                if (!e.target.value) {
                  e.target.type = "text";
                }
              }}
            >
              <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                <CustomCalendarIcon
                  onClick={() => openDatePicker(dateOfBirthRef)}
                />
              </div>
            </Input>

            {/* SSN Last 4 */}
            <Input
              formData={formData}
              valueName="ssnLast4"
              placeholder="0000"
              required={true}
              handleChange={handleChange}
              label="Last 4 digits of SSN"
              complex={false}
              inputClassName="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            {/* Email */}
            <Input
              formData={formData}
              type="email"
              valueName="email"
              placeholder="sallyjenkins@corp.com"
              required={true}
              handleChange={handleChange}
              label="Email"
              complex={false}
            />

            {/* Phone Number */}
            <Input
              formData={formData}
              type="tel"
              valueName="phone"
              placeholder="(000) 000-0000"
              required={true}
              handleChange={handleChange}
              label="Phone Number"
              complex={false}
            />

            {/* Organization - now using fetchCompanies data */}
            <CustomSelect
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              required={true}
              label="Organization"
              options={organizationOptions}
              loading={loadingCompanies}
            />

            {/* Start Date */}
            <Input
              formData={formData}
              valueName="startDate"
              placeholder="MM/DD/YY"
              required={false}
              handleChange={handleChange}
              label="Start Date"
              complex={true}
              inputRef={startDateRef}
              onFocus={(e) => {
                e.target.type = "date";
              }}
              onBlur={(e) => {
                if (!e.target.value) {
                  e.target.type = "text";
                }
              }}
            >
              <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                <CustomCalendarIcon
                  onClick={() => openDatePicker(startDateRef)}
                />
              </div>
            </Input>

            {/* Role - Custom implementation with role chip */}
            <div className="mb-3 flex flex-col items-start self-stretch">
              <div className="relative flex h-14 flex-col items-start gap-2.5 self-stretch rounded border border-[#d8dadc] bg-white">
                <label
                  htmlFor="role"
                  className="absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]"
                >
                  Role<span>*</span>
                </label>

                {/* Role selector/display area */}
                <div
                  className="content flex h-12 w-full cursor-pointer items-center justify-between px-[0.9375rem] py-1"
                  onClick={handleRoleClick}
                >
                  {formData.role ? (
                    <div className="flex flex-1 items-center">
                      <RoleChip role={formData.role} />
                    </div>
                  ) : (
                    <span className="font-roboto text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155]">
                      Select Role
                    </span>
                  )}

                  <div className="flex items-center text-gray-500">
                    <Arrows />
                  </div>
                </div>

                {/* Role dropdown */}
                {roleSelectOpen && (
                  <div className="absolute top-full left-0 z-20 w-full rounded-b-md border border-t-0 border-[#d8dadc] bg-white shadow-lg">
                    {roleOptions.map((option) => (
                      <div
                        key={option.value}
                        className="cursor-pointer px-[0.9375rem] py-2 hover:bg-gray-50"
                        onClick={() => selectRole(option.value)}
                      >
                        <span className="font-roboto text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155]">
                          {option.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hidden input for form validation */}
                <input
                  type="hidden"
                  name="role"
                  value={formData.role}
                  required
                />
              </div>
            </div>

            {/* Multi-select Insurance Plans - now disabled until organization is selected */}
            <MultiSelect
              id="assignedInsurance"
              name="assignedInsurance"
              selectedValues={formData.assignedInsurance}
              onSelect={handleInsuranceSelect}
              onRemove={handleInsuranceRemove}
              label="Assigned Insurance"
              options={insuranceOptions}
              labelRenderer={getInsurancePlanLabel}
              loading={loadingInsurance}
            />
          </div>
        </div>

        {/* Action Buttons - Fixed to bottom */}
        <div className="mt-auto border-t border-gray-200 p-3">
          <ActionButtons
            isSubmitting={isSubmitting}
            onClose={onClose}
            disableSubmit={
              isSubmitting ||
              !formData.name ||
              !formData.dateOfBirth ||
              !formData.ssnLast4 ||
              !formData.email ||
              !formData.phone ||
              !formData.organization ||
              !formData.role
            }
            submittingText="Adding..."
            submitText="Add"
          />
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;