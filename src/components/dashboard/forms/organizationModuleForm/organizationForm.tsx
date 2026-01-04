import { useEffect, useState } from "react";
import FormField, { FieldConfig } from "../../../reusables/formComponents/formInputFields";
import { Formik, Form, Field } from "formik";
import { Grid2 } from "@mui/material";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";
import { fetchInsurance } from "../../../../api/services/insuranceServices/insuranceService";
import * as Yup from "yup";
import {
  createCompany,
  fetchCompanyDetails
} from "../../../../api/services/dashboardServices/organizationService";
import { useDashboard } from "../../../../context/DashboardContext";
import { removeOrganization } from "../../../../commonComponents/DeletePopUp";
import Frame24 from "../../../../assets/Frame";
import { companyValidationSchema, CompanyFormValues, initialCompanyValues } from "../../../../schemas/OrganizationSchema";

interface CompanyFormProps {
  companyId?: string | number;
  mode?: "create" | "edit" | "view";
  onClose: () => void;
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

const CompanyForm: React.FC<CompanyFormProps> = ({
  companyId,
  mode = "create",
  onClose,
}) => {
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(mode);
  const [initialValues, setInitialValues] = useState<CompanyFormValues>({ ...initialCompanyValues });
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const { refreshData, deleteCompany, updateCompany } = useDashboard();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const [focusedField, setFocusedField] = useState("");

  useEffect(() => {
    const loadInsurancePlans = async () => {
      try {
        const plans = await fetchInsurance();
        setInsurancePlans(plans);
      } catch (error) {
        console.error("Failed to fetch insurance plans:", error);
        setInsurancePlans([]);
      }
    };
    loadInsurancePlans();
  }, []);

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        if (companyId) {
          const response = await fetchCompanyDetails(String(companyId));
          let selectedPlans: string[] = [];
          if (response?.benefit_plans && Array.isArray(response.benefit_plans) && response.benefit_plans.length > 0) {
            selectedPlans = response.benefit_plans.map((plan: any) => plan.id);
          }

          // Process admins data - handle both string arrays and object arrays
          let adminEmails: string[] = [];
          if (response?.admins && Array.isArray(response.admins)) {
            adminEmails = response.admins.map((admin: any) => {
              // If admin is already a string, use it directly
              if (typeof admin === 'string') {
                return admin;
              }
              else if (typeof admin === 'object' && admin !== null) {
                return admin.email || admin.work_email || '';
              }
              return '';
            }).filter(Boolean);
          }
          console.log('Processed admin emails:', adminEmails);
          setInitialValues({
            org_name: response.org_name || "",
            org_address: response.org_address || "",
            billing_contact_name: response.billing_contact_name || "",
            billing_contact_email: response.billing_contact_email || "",
            start_date: response?.start_date || "",
            benefit_plans: selectedPlans,
            admins: adminEmails,
          });
        } else {
          setInitialValues({ ...initialCompanyValues });
        }
      } catch (error) {
        console.error("Failed to fetch company details:", error);
      }
    };
    loadCompanyData();
  }, [companyId, mode]);

  const handleEditClick = () => {
    setFormMode("edit");
  };

  const handleDeleteClick = async () => {
    if (companyId) {
      try {
        await deleteCompany(companyId);
        await refreshData();
        onClose();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete organization";
        toast.error(errorMessage);
      }
    }
  };

  const insuranceSelectOptions = insurancePlans.length > 0
    ? insurancePlans.map((plan) => ({
      value: plan.id,
      label: plan.plan_name,
    }))
    : [];

  const formFields: FieldConfig[] = [
    {
      name: "org_name",
      label: "Organization Name*",
      placeholder: "Enter organization name",
      type: "text",
    },
    {
      name: "org_address",
      label: "Address*",
      placeholder: "123 Main St, New York, NY 10001",
      type: "text",
    },
    {
      name: "billing_contact_name",
      label: "Billing Contact*",
      placeholder: "Sally Jenkins",
      type: "text",
    },
    {
      name: "billing_contact_email",
      label: "Billing Email*",
      placeholder: "sallyjenkins@corp.com",
      type: "email",
    },
    {
      name: "start_date",
      label: "Start Date",
      placeholder: "Select Date",
      type: "date",
    },
    {
      name: "benefit_plans",
      label: "Insurance Plans",
      type: "multi-select",
      placeholder: "Select insurance plans",
      options: insuranceSelectOptions,
    },
  ];

  const handleSubmit = async (values: CompanyFormValues) => {
    try {
      const payload = {
        org_name: values.org_name,
        org_address: values.org_address,
        billing_contact_name: values.billing_contact_name,
        billing_contact_email: values.billing_contact_email,
        benefit_plan_ids: values.benefit_plans,
        admin_emails: values.admins || [], // Already processed to be string[]
      };
      if (values.start_date) {
        payload.start_date = values.start_date;
      }

      if (formMode === "edit" && companyId) {
        await updateCompany(String(companyId), payload);
        onClose();
      } else if (formMode === "create") {
        await createCompany(payload);
        await refreshData();
        toast.success("Organization added successfully!");
        onClose();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save company";
      console.error("API Error:", error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed top-0 right-0 flex h-screen w-[35%] flex-col bg-white shadow-lg">
      {/* Header - Always fixed at top */}
      <div
        className={`p-4 ${formMode === "create"
          ? "bg-[#2B4C7E] text-white"
          : formMode === "edit"
            ? "bg-[#E3E3E4] text-[#334155]"
            : "bg-[#E3E3E4] text-[#334155]"
          }`}
      >
        <h1 className="text-xl font-normal">
          {formMode === "create"
            ? "Add Organization"
            : formMode === "edit"
              ? "Edit Organization Information"
              : "Organization Information"}
        </h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={companyValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, resetForm, setFieldValue, errors, touched }) => {
          // Function to handle adding a new email
          const addEmail = () => {
            if (tempEmail && tempEmail.trim() !== "") {
              const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
              if (emailRegex.test(tempEmail)) {
                const updatedEmails = [...values.admins, tempEmail];
                setFieldValue("admins", updatedEmails);
                setTempEmail("");
              } else {
                toast.error("Please enter a valid email address");
              }
            }
          };

          // Function to handle Enter key press
          const handleEmailKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addEmail();
            }
          };

          // Function to remove an email
          const removeEmail = (index: number) => {
            const updatedEmails = [...values.admins];
            updatedEmails.splice(index, 1);
            setFieldValue("admins", updatedEmails);
          };

          return (
            <>
              <Form id="organization-form" className="flex flex-col h-[calc(100%-116px)]">
                {/* Scrollable area for form fields */}
                <div className="flex-1 overflow-y-auto pt-6 pb-6 pr-5 pl-5">
                  <Grid2
                    container
                    spacing={2}
                  >
                    {formFields.map((field) => (
                      <Grid2
                        key={field.name}
                        sx={{ flexBasis: { xs: "100%", sm: "100%" } }}
                      >
                        <Field
                          name={field.name}
                          component={FormField}
                          fieldConfig={{
                            ...field,
                            disabled: formMode === "view" || field.disabled,
                          }}
                        />
                      </Grid2>
                    ))}

                    {/* Custom Admin Emails Field */}
                    <Grid2 sx={{ flexBasis: { xs: "100%", sm: "100%" } }}>
                      <div className="mb-4">
                        {/* Display added emails as chips */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {values.admins.map((email: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 rounded-full bg-[#E5F0FD] px-3 py-1 text-[14px] text-[#1e4477]"
                            >
                              {email}
                              {formMode !== "view" && (
                                <button
                                  type="button"
                                  onClick={() => removeEmail(index)}
                                  className="ml-1 text-[#1e4477] hover:text-[#234066]"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Display validation error if any */}
                        {errors.admins && touched.admins && (
                          <div className="mt-1 text-[12px] text-red-500">
                            {errors.admins as string}
                          </div>
                        )}

                        {/* Only show input field if not in view mode */}
                        {formMode !== "view" && (
                          <div className="mt-2">
                            {formMode === "create" && (
                              <div
                                className="mb-[10px] text-[#334155] font-roboto text-[14px] font-normal leading-[20px] tracking-[0.25px]"
                              >
                                Invite an Admin to manage this organization's account
                              </div>
                            )}
                            <div
                              className={`flex h-[42px] items-center gap-[15px] self-stretch rounded-md border ${focusedField === "tempEmail" ? "border-[#18D9B3]" : "border-[#d8dadc]"
                                } relative bg-white`}
                            >
                              {formMode === "edit" && (
                                <label
                                  htmlFor="tempEmail"
                                  className="absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]"
                                >
                                  Admins <span className="text-[#1e4477]">*</span>
                                </label>
                              )}

                              <div className="flex w-full items-center px-[10px]">
                                <input
                                  id="tempEmail"
                                  name="tempEmail"
                                  type="email"
                                  value={tempEmail}
                                  onChange={(e) => setTempEmail(e.target.value)}
                                  onKeyDown={handleEmailKeyDown}
                                  onFocus={() => setFocusedField("tempEmail")}
                                  onBlur={() => setFocusedField("")}
                                  placeholder={
                                    values.admins.length > 0
                                      ? "Add another Email"
                                      : "Email"
                                  }
                                  className="font-roboto w-full text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155] placeholder-gray-400 outline-none"
                                  required={values.admins.length === 0}
                                />
                                {tempEmail && (
                                  <div onClick={addEmail} className="cursor-pointer">
                                    <Frame24 />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Grid2>
                  </Grid2>

                  {formMode === "edit" && companyId && (
                    <div className="p-4 border-t border-gray-200 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Organization
                      </button>

                      {/* Render the imported confirmation dialog when showDeleteConfirm is true */}
                      {showDeleteConfirm &&
                        removeOrganization({
                          isOpen: showDeleteConfirm,
                          onClose: () => setShowDeleteConfirm(false),
                          onConfirm: handleDeleteClick
                        })
                      }
                    </div>
                  )}
                </div>
              </Form>

              {/* Action buttons - Fixed at bottom outside of scrollable area */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      onClose();
                    }}
                    className="flex-1 h-10 px-6 py-2 text-[14px] font-medium text-[#1e4477] border border-[#d8dadc] rounded-[0.3125rem] hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  {formMode === "view" ? (
                    <button
                      type="button"
                      onClick={handleEditClick}
                      className="flex-1 h-10 px-6 py-2 text-[14px] font-medium text-white bg-[#1E4477] rounded-[0.3125rem] hover:bg-[#234066] flex items-center justify-center gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                  ) : (
                    <button
                      type="submit"
                      form="organization-form"
                      className="flex-1 h-10 px-6 py-2 text-[14px] font-medium text-white bg-[#1E4477] rounded-[0.3125rem] hover:bg-[#234066]"
                    >
                      {formMode === "edit" ? "Save" : "Add"}
                    </button>
                  )}
                </div>
              </div>
            </>
          );
        }}
      </Formik>
    </div>
  );
};

export default CompanyForm;