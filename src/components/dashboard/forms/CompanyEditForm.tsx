import React, { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { fetchInsurance } from "../../../services/axios";
import { toast } from "react-toastify";
import { fetchCompanyDetails } from "../../../services/axios";
import cn from "../../../utils/cn";
import { useDashboard } from "../../../context/DashboardContext";
import { removeOrganization } from "../../../commonComponents/DeletePopUp";
import { Arrows } from "./components/UserEdit/FormComponents/Icon";
import CompanyForm from "./organizationModuleForm/organizationForm";

interface CompanyAdmin {
  email: string;
  role: string;
  status: string;
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

interface CompanyDetails {
  org_name: string;
  org_address: string;
  billing_contact_name: string;
  billing_contact_email: string;
  id: string;
  employee_count: number;
  admins: CompanyAdmin[];
  benefit_plans: InsurancePlan[];
  start_date: string;
  renewal_date: string | null;
}

interface CompanyEditFormProps {
  companyId: string | number;
  onClose: () => void;
  showAdminEmails?: boolean; // Optional prop to control admin emails visibility
}

// Header Component - Matching the style from CompanyDetailsView
const Header = () => (
  <div className="flex items-center gap-2.5 self-stretch bg-[#e3e3e4] pt-[1.5625rem] pr-[1.5625rem] pb-[1.5625rem] pl-[1.5625rem]">
    <div className="view_organization_information text-center font-['Roboto'] text-[22px] leading-[28px] text-slate-700">
      Edit Organization Information
    </div>
  </div>
);

// Editable Input Component - Styled to match the CompanyDetailsView inputs
const EditableInput = ({
  label,
  name,
  value,
  type = "text",
  onChange,
  required = false,
  containerClassName,
}: {
  label: string;
  name: string;
  value: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  containerClassName?: string;
}) => (
  <div
    className={cn(
      "mx-6 mb-5 flex flex-col items-start self-stretch",
      containerClassName
    )}
  >
    <div className="relative flex h-14 flex-col items-start gap-2.5 self-stretch rounded border border-[#d8dadc] bg-[#f9fafb]">
      <label
        htmlFor={name}
        className="absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]"
      >
        {label}
        {required && <span className="ml-0.5 text-[#1e4477]">*</span>}
      </label>

      <div className="content relative flex h-12 w-full items-center gap-2.5 py-1">
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="font-roboto w-full border-none bg-transparent px-[0.9375rem] py-1 text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155] focus:ring-1 focus:ring-[#1e4477] focus:outline-none"
        />
      </div>
    </div>
  </div>
);

const CompanyEditForm: React.FC<CompanyEditFormProps> = ({
  companyId,
  onClose,
  showAdminEmails = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CompanyDetails | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { updateCompany, deleteCompany } = useDashboard();
  const [insurancePlansData, setInsurancePlansData] = useState<InsurancePlan[]>(
    []
  );
  const [isLoadingInsurancePlans, setIsLoadingInsurancePlans] = useState(true);
  const [focusedField, setFocusedField] = useState("");

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setIsLoadingInsurancePlans(true);

        // Fetch company details
        const companyResponse = await fetchCompanyDetails(companyId);
        setFormData(companyResponse);

        // Fetch insurance plans
        const plansResponse = await fetchInsurance();

        // Ensure you're setting the correct part of the response
        // If fetchInsurance returns an array directly, use it as is
        // If it's a single object, wrap it in an array
        const insurancePlans = Array.isArray(plansResponse)
          ? plansResponse
          : [plansResponse];

        setInsurancePlansData(insurancePlans);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch organization details");
      } finally {
        setLoading(false);
        setIsLoadingInsurancePlans(false);
      }
    };

    loadDetails();
  }, [companyId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleInsurancePlanChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    if (!formData) return;

    if (value) {
      const selectedPlan = insurancePlansData.find((plan) => plan.id === value);

      if (selectedPlan) {
        // Check if plan is already selected
        const isAlreadySelected = formData.benefit_plans.some(
          (plan) => plan.id === selectedPlan.id
        );

        if (!isAlreadySelected) {
          // Add the new plan to existing plans
          setFormData({
            ...formData,
            benefit_plans: [...formData.benefit_plans, selectedPlan],
          });
        }
      }
    }
  };

  const handleRemoveInsurancePlan = (planIdToRemove: string) => {
    if (formData) {
      setFormData({
        ...formData,
        benefit_plans: formData.benefit_plans.filter(
          (plan) => plan.id !== planIdToRemove
        ),
      });
    }
  };

  const handleAddAdmin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showAdminEmails) return;

    if (!newAdminEmail) {
      toast.error("Admin email is required");
      return;
    }

    if (formData) {
      const adminEmails = formData.admins.map((admin) => admin.email);
      if (!adminEmails.includes(newAdminEmail)) {
        setFormData({
          ...formData,
          admins: [
            ...formData.admins,
            { email: newAdminEmail, role: "admin", status: "active" },
          ],
        });
        setNewAdminEmail("");
      } else {
        toast.warning("Admin email already exists");
      }
    }
  };

  const handleRemoveAdmin = (emailToRemove: string) => {
    if (formData) {
      setFormData({
        ...formData,
        admins: formData.admins.filter(
          (admin) => admin.email !== emailToRemove
        ),
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData) return;

    // Validation checks
    if (
      !formData.org_name ||
      !formData.org_address ||
      !formData.billing_contact_name ||
      !formData.billing_contact_email ||
      (showAdminEmails && (!formData.admins || formData.admins.length === 0))
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      const updateData: any = {
        org_name: formData.org_name,
        org_address: formData.org_address,
        billing_contact_name: formData.billing_contact_name,
        billing_contact_email: formData.billing_contact_email,
        start_date: formData.start_date,
        admins: formData.admins,
      };

      // Add benefit plan IDs if there are plans selected
      if (formData.benefit_plans && formData.benefit_plans.length > 0) {
        updateData.benefit_plan_ids = formData.benefit_plans.map(
          (plan) => plan.id
        );
      }

      // Make sure we're explicitly handling admins

      // Debug logging
      console.log("Form data admins:", formData.admins);
      console.log("Update data being sent:", updateData);

      await updateCompany(companyId, updateData);
      toast.success("Company details updated successfully");
      onClose();
    } catch (error) {
      console.error("Full error:", error);
      toast.error("Failed to update organization details");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCompany(companyId);
      toast.success("Organization deleted successfully");
      onClose(); // Close the form after successful deletion
    } catch (error) {
      toast.error("Failed to delete organization");
    }
  };

  const InsurancePlanSelect = () => {
    return (
      <div className="mb-5 flex flex-col items-start self-stretch">
        {/* Display selected insurance plans */}
        <div className="mb-2 flex flex-wrap gap-2">
          {formData?.benefit_plans &&
            formData.benefit_plans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center rounded-md bg-gray-100 px-2 py-1"
              >
                <span className="text-xs">{plan.plan_name}</span>
                <button
                  onClick={() => handleRemoveInsurancePlan(plan.id)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
        </div>

        {/* Insurance plan dropdown - similar to AddCompanyForm */}
        <div
          className={`flex h-14 flex-col items-start gap-2.5 self-stretch rounded border ${focusedField === "insurancePlan" ? "border-[#18D9B3]" : "border-[#d8dadc]"} relative bg-[#f9fafb]`}
        >
          <label
            htmlFor="insurancePlan"
            className="absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]"
          >
            Insurance Plan
          </label>

          <div className="content relative flex h-12 w-full items-center gap-2.5 py-1 pr-[0.9375rem]">
            <div className="relative w-full">
              <select
                id="insurancePlan"
                name="insurancePlan"
                className="font-roboto w-full appearance-none bg-transparent px-[0.9375rem] py-1 text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155] focus:outline-none"
                value=""
                onChange={handleInsurancePlanChange}
                onFocus={() => setFocusedField("insurancePlan")}
                onBlur={() => setFocusedField("")}
                disabled={isLoadingInsurancePlans}
              >
                <option value="">Select insurance plan(s)</option>
                {insurancePlansData.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.plan_name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 transform">
                <Arrows className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed top-0 right-0 h-screen w-[35%] bg-white shadow-lg">
        <Header />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <p className="text-gray-600">Loading organization details...</p>
        </div>
      </div>
    );
  }

  if (!formData) return null;

  return (
    // <div className="fixed top-0 right-0 z-40 h-screen w-[35%] bg-white shadow-lg">
    //   <Header />

    //   <div className="flex h-[calc(100vh-64px)] flex-col justify-between overflow-hidden pt-5">
    //     <div className="flex-1 overflow-y-auto">
    //       <div className="space-y-3 pt-2">
    //         {/* Organization */}
    //         <EditableInput
    //           label="Organization Name"
    //           name="org_name"
    //           value={formData.org_name}
    //           onChange={handleInputChange}
    //           required
    //         />

    //         {/* Address */}
    //         <EditableInput
    //           label="Address"
    //           name="org_address"
    //           value={formData.org_address}
    //           onChange={handleInputChange}
    //           required
    //         />

    //         {/* Billing Contact */}
    //         <EditableInput
    //           label="Billing Contact"
    //           name="billing_contact_name"
    //           value={formData.billing_contact_name}
    //           onChange={handleInputChange}
    //           required
    //         />

    //         {/* Billing Email */}
    //         <EditableInput
    //           label="Billing Email"
    //           name="billing_contact_email"
    //           value={formData.billing_contact_email}
    //           type="email"
    //           onChange={handleInputChange}
    //           required
    //         />

    //         {/* Insurance Plan - now with dropdown selector */}
    //         <div className="mx-6">
    //           <InsurancePlanSelect />
    //         </div>

    //         {/* Start Date */}
    //         <EditableInput
    //           label="Start Date"
    //           name="start_date"
    //           value={formData.start_date}
    //           type="date"
    //           onChange={handleInputChange}
    //         />

    //         {/* Admin Emails */}
    //         {showAdminEmails && (
    //           <div className="mx-6 mb-5 flex flex-col items-start self-stretch">
    //             <div className="relative flex min-h-[3.5rem] flex-col items-start gap-2.5 self-stretch rounded border border-[#d8dadc] bg-[#f9fafb]">
    //               <label className="absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]">
    //                 Admin
    //                 <span className="ml-0.5 text-[#1e4477]">*</span>
    //               </label>

    //               <div className="w-full px-[0.9375rem] py-3">
    //                 <div className="mb-3 flex flex-wrap gap-2">
    //                   {formData.admins && formData.admins.length > 0 ? (
    //                     formData.admins.map((admin) => (
    //                       <div
    //                         key={admin.email}
    //                         className="flex items-center rounded-md bg-gray-100 px-2 py-1"
    //                       >
    //                         <span className="text-xs">{admin.email}</span>
    //                         <button
    //                           onClick={() => handleRemoveAdmin(admin.email)}
    //                           className="ml-2 text-gray-500 hover:text-red-500"
    //                         >
    //                           <X className="h-3 w-3" />
    //                         </button>
    //                       </div>
    //                     ))
    //                   ) : (
    //                     <span className="text-xs text-gray-500">
    //                       No admins assigned
    //                     </span>
    //                   )}
    //                 </div>

    //                 {/* Add New Admin Form - Only the input field as in the original */}
    //                 <form className="flex gap-2" onSubmit={handleAddAdmin}>
    //                   <input
    //                     type="email"
    //                     value={newAdminEmail}
    //                     onChange={(e) => setNewAdminEmail(e.target.value)}
    //                     placeholder="Add new admin email"
    //                     required // Added required attribute
    //                     className="h-[44px] flex-1 rounded-md border border-gray-300 px-2 text-xs focus:border-[#1e4477] focus:ring-1 focus:ring-[#1e4477] focus:outline-none"
    //                   />
    //                 </form>
    //               </div>
    //             </div>
    //           </div>
    //         )}

    //         <div className="mx-6 flex justify-end pt-2">
    //           <button
    //             className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
    //             onClick={() => setShowDeleteDialog(true)}
    //           >
    //             <Trash2 className="h-4 w-4" />
    //             Remove this Organization
    //           </button>
    //         </div>

    //         {/* Added extra space here for better gap before buttons */}
    //         <div className="h-8"></div>
    //       </div>
    //     </div>

    //     {/* Action Buttons */}
    //     <div className="mt-auto mb-6 p-2">
    //       <div className="flex gap-6">
    //         <button
    //           onClick={onClose}
    //           className="ml-6 flex h-10 flex-1 items-center justify-center gap-1 rounded-md border border-[#d8dadc] bg-white px-6 py-2.5 text-sm leading-5 font-medium text-[#1e4477] transition-colors hover:bg-gray-50"
    //         >
    //           Cancel
    //         </button>
    //         <button
    //           onClick={handleSubmit}
    //           disabled={saving}
    //           className="disabled:bg-opacity-70 mr-6 flex h-10 flex-1 items-center justify-center gap-1 rounded-md bg-[#E3E3E4] px-6 py-2.5 text-sm leading-5 font-medium text-[#919191] transition-colors hover:bg-[#163660]"
    //         >
    //           {saving ? "Saving..." : "Save "}
    //         </button>
    //       </div>
    //     </div>
    //   </div>

    //   {removeOrganization({
    //     isOpen: showDeleteDialog,
    //     onClose: () => setShowDeleteDialog(false),
    //     onConfirm: handleConfirmDelete,
    //   })}
    // </div>
    <div className="fixed inset-0 z-50 flex justify-end  bg-opacity-30">
      <CompanyForm mode="edit" onClose={onClose} companyId={companyId} />
    </div>
  );
};

export default CompanyEditForm;
