"use client";

import { useState, useEffect, useRef } from "react";
import { useDashboard } from "../../../../context/DashboardContext";
import {
  createUser,
  fetchInsurance,
  fetchCompanies,
} from "../../../../services/axios";
import { toast } from "react-toastify";
import { User } from "../../../../types/dashboard.types";
import ActionButtons from "../components/UserEdit/FormComponents/ActionButtons";
import Input from "../components/Input";
import CalendarIcon from "../components/CalenderForm";
import { Arrows } from "../components/UserEdit/FormComponents/Icon";

import { RoleChip, CustomSelect, MultiSelect } from "./AddFormComponents";
import UserForm from "../userModuleForm/userForm";

// Types
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

interface CompanyApiType {
  org_name: string;
  org_address: string;
  billing_contact_name: string;
  billing_contact_email: string;
  id: string;
  employee_count: number;
  admins: string[];
  benefit_plans: string[];
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

// Utility function to format and validate MM/DD/YY
const formatDateInput = (value: string): string => {
  let cleaned = value.replace(/[^0-9/]/g, "");
  if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

  if (cleaned.length > 2 && cleaned[2] !== "/") {
    cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
  }
  if (cleaned.length > 5 && cleaned[5] !== "/") {
    cleaned = cleaned.slice(0, 5) + "/" + cleaned.slice(5);
  }

  if (cleaned.length >= 2) {
    const month = parseInt(cleaned.slice(0, 2));
    if (month > 12 || month < 1) cleaned = "12" + cleaned.slice(2);
  }

  if (cleaned.length >= 5) {
    const day = parseInt(cleaned.slice(3, 5));
    if (day > 31 || day < 1)
      cleaned = cleaned.slice(0, 3) + "31" + cleaned.slice(5);
  }

  return cleaned;
};

// Function to restrict date input
const restrictDateInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
  if (allowedKeys.includes(e.key)) return;

  const value = (e.target as HTMLInputElement).value;
  const cursorPosition = (e.target as HTMLInputElement).selectionStart || 0;

  if (!/[0-9]/.test(e.key) && e.key !== "/") {
    e.preventDefault();
    return;
  }

  if (e.key === "/" && ![2, 5].includes(cursorPosition)) {
    e.preventDefault();
    return;
  }

  if (/[0-9]/.test(e.key) && [2, 5].includes(cursorPosition)) {
    e.preventDefault();
    return;
  }

  if (value.length >= 8 && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
};

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

  const dateOfBirthRef = useRef<HTMLInputElement>(
    null as unknown as HTMLInputElement
  );
  const startDateRef = useRef<HTMLInputElement>(
    null as unknown as HTMLInputElement
  );

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoadingCompanies(true);
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

  useEffect(() => {
    if (formData.organization) {
      const loadInsurancePlans = async () => {
        try {
          setLoadingInsurance(true);
          setFormData((prev) => ({ ...prev, assignedInsurance: [] }));
          const plans = await fetchInsurance(
            undefined,
            undefined,
            formData.organization
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
      setInsurancePlans([]);
      setFormData((prev) => ({ ...prev, assignedInsurance: [] }));
    }
  }, [formData.organization]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "dateOfBirth" || name === "startDate") {
      const formattedValue = formatDateInput(value);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (name === "role") setRoleSelectOpen(false);
  };

  const handleDateSelect = (
    field: "dateOfBirth" | "startDate",
    dateValue: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: dateValue }));
  };

  const handleRoleClick = () => setRoleSelectOpen(!roleSelectOpen);

  const selectRole = (role: string) => {
    setFormData((prev) => ({ ...prev, role }));
    setRoleSelectOpen(false);
  };

  const handleInsuranceSelect = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedInsurance: [...prev.assignedInsurance, value],
    }));
  };

  const handleInsuranceRemove = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedInsurance: prev.assignedInsurance.filter(
        (item) => item !== value
      ),
    }));
  };

  const getInsurancePlanLabel = (value: string): string => {
    const plan = insurancePlans.find((plan) => plan.id === value);
    return plan ? plan.plan_name : value;
  };

  const mapRoleToApiRole = (uiRole: string): string => {
    const roleMap: Record<string, string> = {
      User: "subscriber",
      Admin: "admin",
    };
    return roleMap[uiRole] || "subscriber";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const [firstName = "", lastName = ""] = formData.name.split(" ", 2);
      const apiRole = mapRoleToApiRole(formData.role);

      const userData = {
        first_name: firstName || "string",
        last_name: lastName,
        email: formData.email,
        work_email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth
          ? `20${formData.dateOfBirth.slice(6, 8)}-${formData.dateOfBirth.slice(0, 2)}-${formData.dateOfBirth.slice(3, 5)}`
          : new Date().toISOString().split("T")[0],
        ssn_last4: formData.ssnLast4 || "0000",
        gender_assigned: "not_specified",
        role: apiRole,
        status: "active",
        member_group_id: formData.organization,
        start_date: formData.startDate
          ? `20${formData.startDate.slice(6, 8)}-${formData.startDate.slice(0, 2)}-${formData.startDate.slice(3, 5)}`
          : null,
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

  const organizationOptions = [
    { value: "", label: "Select Organization" },
    ...(companies.length > 0
      ? companies.map((company) => ({
        value: company.id,
        label: company.org_name,
      }))
      : []),
  ];

  const roleOptions = [
    { value: "User", label: "User" },
    { value: "Admin", label: "Admin" },
  ];

  const insuranceOptions = [
    { value: "", label: "Select Insurance Plan" },
    ...insurancePlans.map((plan) => ({
      value: plan.id,
      label: plan.plan_name,
    })),
  ];

  return (
    <div className="fixed top-0 right-0 flex h-screen w-[35%] flex-col bg-white shadow-lg">
      <div className="bg-[#2B4C7E] p-4">
        <h1 className="text-xl font-normal text-white">Add User</h1>
      </div>
      {/* <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3 py-2 pl-1">
            <Input
              formData={formData}
              valueName="name"
              placeholder="Sally Jenkins"
              required={true}
              handleChange={handleChange}
              label="Name"
              complex={false}
            />
            <Input
              formData={formData}
              valueName="dateOfBirth"
              placeholder="MM/DD/YY"
              required={true}
              handleChange={handleChange}
              label="Date of Birth"
              complex={true}
              inputRef={dateOfBirthRef}
              onKeyDown={restrictDateInput}
            >
              <div className="absolute top-1/2 right-3 z-30 -translate-y-1/2 transform">
                <CalendarIcon
                  onDateSelect={(date: string) =>
                    handleDateSelect("dateOfBirth", date)
                  }
                  position="bottom-right"
                />
              </div>
            </Input>
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
            <Input
              formData={formData}
              valueName="startDate"
              placeholder="MM/DD/YY"
              required={false}
              handleChange={handleChange}
              label="Start Date"
              complex={true}
              inputRef={startDateRef}
              onKeyDown={restrictDateInput}
            >
              <div className="absolute top-1/2 right-3 z-30 -translate-y-1/2 transform">
                <CalendarIcon
                  onDateSelect={(date: string) =>
                    handleDateSelect("startDate", date)
                  }
                  position="bottom-right"
                />
              </div>
            </Input>
            <div className="mb-3 flex flex-col items-start self-stretch">
              <div className="relative flex h-14 flex-col items-start gap-2.5 self-stretch rounded border border-[#d8dadc] bg-white">
                <label
                  htmlFor="role"
                  className="absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]"
                >
                  Role<span>*</span>
                </label>
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
                <input
                  type="hidden"
                  name="role"
                  value={formData.role}
                  required
                />
              </div>
            </div>
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
        <div className="mt-auto border-t border-t-gray-200 p-3">
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
      </form> */}
      <div className="flex-1 overflow-y-auto">
        <UserForm onClose={onClose} mode="create" />
      </div>
      
    </div>
  );
};

export default AddUserForm;
