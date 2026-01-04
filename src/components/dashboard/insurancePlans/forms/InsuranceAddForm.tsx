import ActionButtons from "../../forms/components/UserEdit/FormComponents/ActionButtons";
import Input from "../../forms/components/Input";
import DropdownInput from "./components/DropDownInput";
import { useState, useRef, useEffect } from "react";
import OrganizationAssigner from "./components/OrganizationAssigner";
import DocumentsUploader from "./components/DocumentsUploader";
import { fetchCompanies } from "../../../../services/axios";
import { useDashboard } from "../../../../context/DashboardContext";
import { InsuranceFormData } from "../../../../types/dashboard.types";
import CalendarIcon from "../../forms/components/CalenderForm"; // Import the CalendarIcon component

interface InsuranceAddFormProps {
  onClose: () => void;
  companyId?: string;
  companyName?: string;
}

interface Organization {
  id: string | number;
  text: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
}

const InsuranceAddForm = ({
  onClose,
  companyId,
  companyName,
}: InsuranceAddFormProps) => {
  const { createInsurancePlan } = useDashboard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize formData with pre-selected organization if companyId and companyName are provided
  const [formData, setFormData] = useState<InsuranceFormData>(() => {
    const initialData: InsuranceFormData = {
      planName: "",
      provider: "",
      planType: "",
      startDate: "",
      notes: "",
      selectedOrganizations: [],
      documents: [],
    };

    // Only add the pre-selected organization if both companyId and companyName are defined
    if (companyId !== undefined && companyName !== undefined) {
      initialData.selectedOrganizations = [
        {
          id: companyId,
          text: companyName,
          effectiveStartDate: undefined,
          effectiveEndDate: undefined,
        },
      ];
    }

    return initialData;
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [companies, setCompanies] = useState<Organization[]>([]);

  // Handle clicks outside the form to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const formatDate = (dateString: string) => {
    // Remove any non-digit characters
    const digitsOnly = dateString.replace(/\D/g, "");

    // Limit to 6 digits (DDMMYY)
    const trimmedDigits = digitsOnly.slice(0, 6);

    // Format the date
    if (trimmedDigits.length < 4) {
      return trimmedDigits;
    } else if (trimmedDigits.length < 6) {
      return `${trimmedDigits.slice(0, 2)}/${trimmedDigits.slice(2)}`;
    } else {
      return `${trimmedDigits.slice(0, 2)}/${trimmedDigits.slice(2, 4)}/${trimmedDigits.slice(4)}`;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Special handling for startDate to maintain DD/MM/YY format
    if (name === "startDate") {
      const formattedDate = formatDate(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formattedDate,
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // New function to handle date selection from calendar
  const handleDateSelect = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      startDate: date,
    }));
  };

  const planTypeOptions = ["HEALTH", "DENTAL", "VISION", "OTHER"];

  const handleOrganizationDateChange = (
    orgId: string | number,
    field: "effectiveStartDate" | "effectiveEndDate",
    value: string
  ) => {
    const finalValue =
      field === "effectiveEndDate" && value === "" ? undefined : value;
    setFormData((prev) => ({
      ...prev,
      selectedOrganizations: prev.selectedOrganizations.map((org) =>
        org.id === orgId ? { ...org, [field]: finalValue } : org
      ),
    }));
  };

  const fetchCompaniesData = async () => {
    try {
      const response = await fetchCompanies();
      console.log("Raw fetchCompanies response:", response);

      // Handle direct array or result property
      const companiesArray = Array.isArray(response)
        ? response
        : response.result || [];
      if (!companiesArray.length) {
        console.error("No companies found in response:", response);
        return [];
      }

      const fetched = companiesArray.map((company) => {
        const orgName =
          company.organization ||
          company.org_name ||
          company.name ||
          "Unnamed Organization";
        console.log("Transformed company:", { id: company.id, text: orgName }); // Debug each transformation
        return {
          id: company.id,
          text: orgName,
          effectiveStartDate: undefined,
          effectiveEndDate: undefined,
        };
      });
      console.log("Fetched companies:", fetched); // Debug final array
      return fetched;
    } catch (error) {
      console.error("Error fetching companies:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadCompanies = async () => {
      const fetchedCompanies = await fetchCompaniesData();
      console.log("Setting companies state:", fetchedCompanies); // Debug state update
      setCompanies(fetchedCompanies);
    };
    loadCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    console.log("Selected organizations:", formData.selectedOrganizations);
    console.log("Uploaded files:", uploadedFiles);

    try {
      setIsSubmitting(true);

      // Prepare the documents array
      const updatedFormData: InsuranceFormData = {
        ...formData,
        documents: uploadedFiles.map((file, index) => ({
          id: `temp-${index}`,
          name: file.name,
          file: file,
          uploadedDate: new Date().toISOString().split("T")[0],
        })),
      };

      console.log("Submitting with data:", updatedFormData);

      // Use context function instead of directly calling the API
      await createInsurancePlan(updatedFormData);

      console.log("Submission successful, closing form");
      onClose();
    } catch (error) {
      console.error("Error creating insurance plan:", error);
      alert("Error creating insurance plan. ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const setSelectedOrganizations = (organizations: Organization[]) => {
    if (companyId && companyName) {
      // Ensure the pre-selected organization remains and cannot be removed
      const preSelectedOrg = {
        id: companyId,
        text: companyName,
        effectiveStartDate: formData.selectedOrganizations.find(
          (org) => org.id === companyId
        )?.effectiveStartDate,
        effectiveEndDate: formData.selectedOrganizations.find(
          (org) => org.id === companyId
        )?.effectiveEndDate,
      };
      const otherOrgs = organizations.filter((org) => org.id !== companyId);
      setFormData((prev) => ({
        ...prev,
        selectedOrganizations: [preSelectedOrg, ...otherOrgs],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedOrganizations: organizations,
      }));
    }
  };

  const handleFileUpload = (files: File[]) => {
    console.log("Files uploaded:", files);
    setUploadedFiles(files);
  };

  return (
    <div
      ref={formRef}
      className="fixed top-0 right-0 z-50 h-screen w-[35%] border-l border-gray-200 bg-white shadow-lg"
    >
      <div className="bg-[#2B4C7E] p-4">
        <h1 className="text-xl font-normal text-white">Add Insurance Plan</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex h-[calc(100vh-50px)] flex-col p-3"
      >
        <div className="scrollbar-none space-y-3 overflow-auto py-2 pl-1">
          <Input
            formData={formData}
            valueName="planName"
            placeholder="Heritage"
            required
            handleChange={handleChange}
            label="Plan Name"
            complex={false}
          />

          <Input
            formData={formData}
            valueName="provider"
            placeholder="Primera Blue Cross"
            required
            handleChange={handleChange}
            label="Provider"
            complex={false}
          />

          <DropdownInput
            formData={formData}
            valueName="planType"
            placeholder="Select a plan type."
            required
            label="Plan Type"
            options={planTypeOptions}
            handleChange={handleChange}
          />

          {/* Modified Start Date Input with Calendar Icon */}
          {/* Start Date Input with Calendar Icon */}
          <div className="flex flex-col items-start self-stretch">
            <div className="relative flex h-14 flex-col items-start gap-2.5 self-stretch rounded border border-[#d8dadc] bg-white">
              <label
                htmlFor="startDate"
                className="absolute top-[-0.75rem] left-[-0.25rem] z-10 flex items-center bg-white px-1 py-0 text-[12px] leading-[16px] text-[#1e4477]"
              >
                Start Date
                <span>*</span>
              </label>
              <div className="content relative flex h-12 w-full items-center gap-2.5 py-1 pr-[0.9375rem]">
                <input
                  id="startDate"
                  type="text"
                  name="startDate"
                  placeholder="MM/DD/YY"
                  className="font-roboto w-full px-[0.9375rem] py-1 text-[14px] leading-[20px] font-normal tracking-[0.25px] text-[#334155] focus:outline-none"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
                <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                  <CalendarIcon
                    onDateSelect={handleDateSelect}
                    position="top-right"
                  />
                </div>
              </div>
            </div>
          </div>

          <Input
            formData={formData}
            valueName="notes"
            placeholder="Enter additional details about this plan"
            required={false}
            handleChange={handleChange}
            label="Notes"
            complex={false}
            textarea={true}
            inputClassName="h-[60px]"
          />

          <OrganizationAssigner
            selectedItems={formData.selectedOrganizations}
            setSelectedItems={setSelectedOrganizations}
            companies={companies}
            lockedOrgId={companyId}
          />

          <DocumentsUploader onFilesChange={handleFileUpload} />
        </div>

        {/* Action Buttons */}
        <div className="absolute right-0 bottom-0 left-0 mb-4 border-t border-gray-200 bg-white px-6 py-1">
          <ActionButtons
            isSubmitting={isSubmitting}
            onClose={onClose}
            disableSubmit={
              isSubmitting ||
              !formData.planName ||
              !formData.provider ||
              !formData.planType ||
              uploadedFiles.length === 0 // Only the fields marked with * are mandatory
            }
            submittingText="Creating..."
            submitText="Add"
          />
        </div>
      </form>
    </div>
  );
};

export default InsuranceAddForm;
