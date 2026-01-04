"use client";

import { useState, useEffect } from "react";
import { Calendar, Search, X } from "lucide-react";
import { ComapnyAddProps, createCompany, fetchInsurance } from "../../../services/axios";
import { useDashboard } from "../../../context/DashboardContext";
import { toast } from "react-toastify";
import { Company } from "../../../types/dashboard.types";
import ActionButtons from "./components/ActionButtons";
import Input from "./components/Input";
import InputMultiSelect from "./components/InputMultiSelect";
// Import the arrow icon (update the path as needed)
import { Arrows } from "./components/UserEdit/FormComponents/Icon";

interface FormData {
  companyName: string;
  address: string;
  billingContact: string;
  billingEmail: string;
  insurancePlans: Array<{ id: string, name: string }>;
  startDate: string;
  adminEmails: string[];
}

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

type PropsAddCompanyForm = {
  onClose: () => void;
  onSubmit: (newCompany: Company) => Promise<void>;
};

const AddCompanyForm = ({ onClose, onSubmit }: PropsAddCompanyForm) => {
  const { refreshData } = useDashboard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insurancePlansData, setInsurancePlansData] = useState<InsurancePlan[]>([]);
  const [isLoadingInsurancePlans, setIsLoadingInsurancePlans] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    address: "",
    billingContact: "",
    billingEmail: "",
    insurancePlans: [],
    startDate: "",
    adminEmails: [],
  });

  const [tempEmail, setTempEmail] = useState("");
  
  // Add state to track which field is focused
  const [focusedField, setFocusedField] = useState("");

  // Fetch insurance plans when component mounts
  useEffect(() => {
    const loadInsurancePlans = async () => {
      try {
        setIsLoadingInsurancePlans(true);
        const data = await fetchInsurance();
        setInsurancePlansData(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch insurance plans";
        toast.error(errorMessage);
      } finally {
        setIsLoadingInsurancePlans(false);
      }
    };

    loadInsurancePlans();
  }, []);
  const formatDate = (input: string) => {
    // Only keep digits and slashes
    const cleaned = input.replace(/[^0-9/]/g, '');
    
    // Limit to 8 characters (MM/DD/YY)
    const limited = cleaned.slice(0, 8);
    
    return limited;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      // Only update if the input matches our allowed characters and follows basic MM/DD/YY structure
      if (/^([0-1]?[0-9]?)?\/?([0-3]?[0-9]?)?\/?([0-9]{0,2})?$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: formatDate(value),
        }));
      }
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInsurancePlanChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    if (value) {
      const selectedPlan = insurancePlansData.find(plan => plan.id === value);
      
      if (selectedPlan && !formData.insurancePlans.some(plan => plan.id === selectedPlan.id)) {
        setFormData((prev) => ({
          ...prev,
          insurancePlans: [...prev.insurancePlans, { 
            id: selectedPlan.id, 
            name: selectedPlan.plan_name 
          }],
        }));
      }
    }
  };

  const removeInsurancePlan = (planIdToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      insurancePlans: prev.insurancePlans.filter(
        (plan) => plan.id !== planIdToRemove
      ),
    }));
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tempEmail) {
      e.preventDefault();
      addEmail();
    }
  };
  
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addEmail = () => {
    if (
      tempEmail &&
      !formData.adminEmails.includes(tempEmail) &&
      isValidEmail(tempEmail)
    ) {
      setFormData((prev) => ({
        ...prev,
        adminEmails: [...prev.adminEmails, tempEmail],
      }));
      setTempEmail("");
    } else if (tempEmail && !isValidEmail(tempEmail)) {
      toast.error("Please enter a valid email address");
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      adminEmails: prev.adminEmails.filter((email) => email !== emailToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.adminEmails.length === 0 && !tempEmail) {
      toast.error("At least one admin email is required");
      return;
    }
    if (tempEmail && isValidEmail(tempEmail)) {
      await addEmail();
    }
    if (formData.adminEmails.length === 0) {
      toast.error("At least one valid admin email is required");
      return;
    }
    setIsSubmitting(true);

    try {
      // Extract benefit plan IDs from the insurancePlans array
      const benefitPlanIds = formData.insurancePlans.map(plan => plan.id);
      
      // Format date to match API requirements (YYYY-MM-DD)
      const formattedData = {
        companyName: formData.companyName,
        address: formData.address,
        billingContact: formData.billingContact,
        billingEmail: formData.billingEmail,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString().split("T")[0]
          : undefined,
        adminEmails:
          formData.adminEmails.length > 0 ? formData.adminEmails : undefined,
        benefitPlanIds: benefitPlanIds.length > 0 ? benefitPlanIds : undefined,
      };

      await createCompany(formattedData as ComapnyAddProps);
      toast.success("Company created successfully!");
      await refreshData(); // Refresh the companies list
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create organization";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const InsurancePlanSelect = ({ formData, handleInsurancePlanChange, removeInsurancePlan, insurancePlansData, isLoading }) => {
    return (
      <div className="flex flex-col items-start self-stretch">
        {/* Display selected insurance plans ABOVE the input field */}
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.insurancePlans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center rounded-md bg-gray-100 px-2 py-1"
            >
              <span className="text-xs">{plan.name}</span>
              <span
                onClick={() => removeInsurancePlan(plan.id)}
                className="ml-2 cursor-pointer text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </span>
            </div>
          ))}
        </div>
  
        <div className={`flex flex-col items-start gap-2.5 self-stretch h-14 rounded border ${focusedField === 'insurancePlan' ? 'border-[#18D9B3]' : 'border-[#d8dadc]'} bg-white relative`}>
          <label
            htmlFor="insurancePlan"
            className="absolute left-[-0.25rem] flex items-center py-0 px-1 top-[-0.75rem] bg-white text-[12px] leading-[16px] text-[#1e4477] z-10"
          >
            Insurance Plan
          </label>
          
          <div className="content flex items-center gap-2.5 pr-[0.9375rem] py-1 h-12 w-full relative">
            <div className="relative w-full">
              <select
                id="insurancePlan"
                name="insurancePlan"
                className="font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155] w-full px-[0.9375rem] py-1 appearance-none focus:outline-none"
                value=""
                onChange={handleInsurancePlanChange}
                onFocus={() => setFocusedField('insurancePlan')}
                onBlur={() => setFocusedField("")}
                disabled={isLoading}
              >
                <option value="">Select insurance plan(s)</option>
                {insurancePlansData.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.plan_name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Arrows className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed top-0 right-0 h-screen w-[35%] bg-white shadow-lg">
      <div className="bg-[#1e4477] p-4">
        <h1 className="text-xl font-normal text-white">Add Organization</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex h-[calc(100vh-50px)] flex-col justify-between"
      >
        <div className="flex-1 space-y-5 overflow-y-auto p-3 pt-[30px]">
          {/* Organization */}
          <div className="flex flex-col items-start self-stretch">
            <div className={`flex flex-col items-start gap-2.5 self-stretch h-14 rounded border ${focusedField === 'companyName' ? 'border-[#18D9B3]' : 'border-[#d8dadc]'} bg-white relative`}>
              <label
                htmlFor="companyName"
                className="absolute left-[-0.25rem] flex items-center py-0 px-1 top-[-0.75rem] bg-white text-[12px] leading-[16px] text-[#1e4477] z-10"
              >
                Organization Name <span className="text-[#1e4477]">*</span>
              </label>
              
              <div className="content flex items-center gap-2.5 pr-[0.9375rem] py-1 h-12 w-full relative">
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('companyName')}
                  onBlur={() => setFocusedField("")}
                  placeholder="Placeholder"
                  className="font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155] w-full px-[0.9375rem] py-1 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col items-start self-stretch">
            <div className={`flex flex-col items-start gap-2.5 self-stretch h-14 rounded border ${focusedField === 'address' ? 'border-[#18D9B3]' : 'border-[#d8dadc]'} bg-white relative`}>
              <label
                htmlFor="address"
                className="absolute left-[-0.25rem] flex items-center py-0 px-1 top-[-0.75rem] bg-white text-[12px] leading-[16px] text-[#1e4477] z-10"
              >
                Address <span className="text-[#1e4477]">*</span>
              </label>
              
              <div className="content flex items-center gap-2.5 pr-[0.9375rem] py-1 h-12 w-full relative">
                <Search className="absolute top-1/2 left-1 h-3 w-3 -translate-y-1/2 transform text-gray-400" />
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('address')}
                  onBlur={() => setFocusedField("")}
                  placeholder="123 Main St, New York, NY 10001"
                  className="font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155] w-full px-[0.9375rem] py-1 outline-none pl-5"
                  required
                />
              </div>
            </div>
          </div>

          {/* Billing Contact */}
          <div className="flex flex-col items-start self-stretch">
            <div className={`flex flex-col items-start gap-2.5 self-stretch h-14 rounded border ${focusedField === 'billingContact' ? 'border-[#18D9B3]' : 'border-[#d8dadc]'} bg-white relative`}>
              <label
                htmlFor="billingContact"
                className="absolute left-[-0.25rem] flex items-center py-0 px-1 top-[-0.75rem] bg-white text-[12px] leading-[16px] text-[#1e4477] z-10"
              >
                Billing Contact <span className="text-[#1e4477]">*</span>
              </label>
              
              <div className="content flex items-center gap-2.5 pr-[0.9375rem] py-1 h-12 w-full relative">
                <input
                  id="billingContact"
                  name="billingContact"
                  type="text"
                  value={formData.billingContact}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('billingContact')}
                  onBlur={() => setFocusedField("")}
                  placeholder="Sally Jenkins"
                  className="font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155] w-full px-[0.9375rem] py-1 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Billing Email */}
          <div className="flex flex-col items-start self-stretch">
            <div className={`flex flex-col items-start gap-2.5 self-stretch h-14 rounded border ${focusedField === 'billingEmail' ? 'border-[#18D9B3]' : 'border-[#d8dadc]'} bg-white relative`}>
              <label
                htmlFor="billingEmail"
                className="absolute left-[-0.25rem] flex items-center py-0 px-1 top-[-0.75rem] bg-white text-[12px] leading-[16px] text-[#1e4477] z-10"
              >
                Billing Email <span className="text-[#1e4477]">*</span>
              </label>
              
              <div className="content flex items-center gap-2.5 pr-[0.9375rem] py-1 h-12 w-full relative">
                <input
                  id="billingEmail"
                  name="billingEmail"
                  type="email"
                  value={formData.billingEmail}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('billingEmail')}
                  onBlur={() => setFocusedField("")}
                  placeholder="sallyjenkins@corp.com"
                  className="font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155] w-full px-[0.9375rem] py-1 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Insurance Plan */}
          <InsurancePlanSelect 
            formData={formData}
            handleInsurancePlanChange={handleInsurancePlanChange}
            removeInsurancePlan={removeInsurancePlan}
            insurancePlansData={insurancePlansData}
            isLoading={isLoadingInsurancePlans}
          />

          {/* Start Date */}
          <div className="flex flex-col items-start self-stretch">
            <div className={`flex flex-col items-start gap-2.5 self-stretch h-14 rounded border ${focusedField === 'startDate' ? 'border-[#18D9B3]' : 'border-[#d8dadc]'} bg-white relative`}>
              <label
                htmlFor="startDate"
                className="absolute left-[-0.25rem] flex items-center py-0 px-1 top-[-0.75rem] bg-white text-[12px] leading-[16px] text-[#1e4477] z-10"
              >
                Start Date <span className="text-[#1e4477]">*</span>
              </label>
              
              <div className="content flex items-center gap-2.5 pr-[0.9375rem] py-1 h-12 w-full relative">
                <input
                  id="startDate"
                  name="startDate"
                  type="text"
                  value={formData.startDate}
                  onChange={handleChange}
              onFocus={() => setFocusedField('startDate')}
              onBlur={() => setFocusedField("")}
              placeholder="MM/DD/YY"
              className="font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155] w-full px-[0.9375rem] py-1 outline-none"
              required
            />
                <Calendar className="absolute top-1/2 right-3 h-3 w-3 -translate-y-1/2 transform text-gray-400" />
              </div>
            </div>
          </div>

          {/* Admin Invitation */}
          <div className="flex flex-col items-start self-stretch">
            <div className={`flex flex-col items-start gap-2.5 self-stretch h-14 rounded border ${focusedField === 'tempEmail' ? 'border-[#18D9B3]' : 'border-[#d8dadc]'} bg-white relative`}>
              <label
                htmlFor="tempEmail"
                className="absolute left-[-0.25rem] flex items-center py-0 px-1 top-[-0.75rem] bg-white text-[12px] leading-[16px] text-[#1e4477] z-10"
              >
                Invite an Admin to manage this organization's account <span className="text-[#1e4477]">*</span>
              </label>
              
              <div className="content flex items-center gap-2.5 pr-[0.9375rem] py-1 h-12 w-full relative">
                <input
                  id="tempEmail"
                  name="tempEmail"
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  onKeyDown={handleEmailKeyDown}
                  onFocus={() => setFocusedField('tempEmail')}
                  onBlur={() => setFocusedField("")}
                  placeholder={formData.adminEmails.length > 0 ? "Add another Email" : "Email"}
                  className="font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px] text-[#334155] w-full px-[0.9375rem] py-1 outline-none"
                  required={formData.adminEmails.length === 0}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.adminEmails.map((email) => (
                <div
                  key={email}
                  className="flex items-center rounded-md bg-gray-100 px-2 py-1"
                >
                  <span className="text-xs">{email}</span>
                  <span
                    onClick={() => removeEmail(email)}
                    className="ml-2 cursor-pointer text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <ActionButtons
            isSubmitting={isSubmitting}
            onClose={onClose}
            disableSubmit={
              isSubmitting ||
              !formData.companyName ||
              !formData.address ||
              !formData.billingContact ||
              !formData.billingEmail ||
              (formData.adminEmails.length === 0 && !tempEmail)
            }
            submittingText="Adding..."
            submitText="Add"
          />
        </div>
      </form>
    </div>
  );
};

export default AddCompanyForm;