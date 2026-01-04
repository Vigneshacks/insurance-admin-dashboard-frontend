import ActionButtons from "../../forms/components/UserEdit/FormComponents/ActionButtons";
import Input from "../../forms/components/Input";
import DropdownInput from "./components/DropDownInput";
import { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import OrganizationAssigner from "./components/OrganizationAssigner";
import DocumentsUploader from "./components/DocumentsUploader";
import {
  fetchInsuranceById,
  InsuranceFormData,
} from "../../../../services/axios";
import { useDashboard } from "../../../../context/DashboardContext";
import { SaveInsurancePlan } from "../../../../commonComponents/InsuranceEditPopUp";

interface InsuranceEditFormProps {
  insuranceId: string;
  onClose: () => void;
}

export interface Organization {
  id: string | number;
  text: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  displayStartDate?: string;
  displayEndDate?: string;
}

export interface Document {
  id: string;
  name: string;
  url?: string;
  uploadedDate?: string;
  file?: File;
}

const InsuranceEditForm = ({
  insuranceId,
  onClose,
}: InsuranceEditFormProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<InsuranceFormData>({
    planName: "",
    provider: "",
    planType: "",
    startDate: "",
    notes: "",
    selectedOrganizations: [],
    documents: [],
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const { updateInsurancePlan, refreshData } = useDashboard();
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  useEffect(() => {
    const fetchInsuranceDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetchInsuranceById(insuranceId);

        // Format date from ISO to YYYY-MM-DD
        const formatDate = (dateString: string) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        };

        const formatDisplayDate = (dateString: string) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          const year = date.getFullYear().toString().slice(2);
          return `${month}/${day}/${year}`;
        };

        // Extract organizations from the response
        const organizations = response.organizations.map((org) => {
          const startDate = formatDate(org.benefit_effective_start_dt);
          const endDate = org.benefit_effective_end_dt
            ? formatDate(org.benefit_effective_end_dt)
            : undefined;

          return {
            id: org.id,
            text: org.org_name,
            effectiveStartDate: startDate,
            effectiveEndDate: endDate,
            displayStartDate: formatDisplayDate(org.benefit_effective_start_dt),
            displayEndDate: org.benefit_effective_end_dt
              ? formatDisplayDate(org.benefit_effective_end_dt)
              : "",
          };
        });

        // Handle document information
        const documents: Document[] = [];
        if (response.file_url) {
          documents.push({
            id: "existing-doc",
            name: response.file_name || "Document.pdf",
            url: response.file_url,
            uploadedDate: formatDate(response.benefit_effective_start_dt),
          });
        }

        // Map API response to form data
        setFormData({
          planName: response.plan_name || "",
          provider: response.provider || "",
          planType: response.coverage_type || "",
          startDate: formatDate(response.benefit_effective_start_dt),
          notes: response.notes || "",
          selectedOrganizations: organizations,
          documents: documents,
        });
      } catch (error) {
        console.error("Error fetching insurance details:", error);
        alert("Failed to load insurance details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsuranceDetails();
  }, [insuranceId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const handleDocumentUpdate = (documents: Document[]) => {
    setFormData((prev) => ({
      ...prev,
      documents: documents,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Create a copy of the form data for submission
      const updatedFormData = {
        ...formData,
        // Include the first new uploaded file (if any)
        documents:
          uploadedFiles.length > 0
            ? [
              {
                id: "new-upload",
                name: uploadedFiles[0].name,
                file: uploadedFiles[0],
                uploadedDate: new Date().toISOString().split("T")[0],
              },
            ]
            : formData.documents,
        // Format organizations properly
        selectedOrganizations: formData.selectedOrganizations.map((org) => {
          const formattedOrg = {
            ...org,
            id: typeof org.id === "string" ? org.id : org.id.toString(),
          };

          // Remove the effectiveEndDate field if it's undefined or empty
          if (!formattedOrg.effectiveEndDate) {
            const { effectiveEndDate, ...restOrg } = formattedOrg;
            return restOrg;
          }

          return formattedOrg;
        }),
      };

      // Call the API function to update the insurance
      await updateInsurancePlan(insuranceId, updatedFormData);
      onClose();
    } catch (error) {
      console.error("Error updating insurance plan:", error);
      alert(
        "Error updating insurance plan. Please check the console for details."
      );
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const setSelectedOrganizations = (organizations: Organization[]) => {
    setFormData((prev) => ({
      ...prev,
      selectedOrganizations: organizations.map((org) => ({
        ...org,
        id: typeof org.id === "string" ? org.id : org.id.toString(),
      })),
    }));
  };

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
  };

  if (isLoading) {
    return (
      <div className="fixed top-0 right-0 flex h-screen w-[35%] items-center justify-center border-l border-gray-200 bg-white shadow-lg">
        <p>Loading insurance details...</p>
      </div>
    );
  }

  return (
    <div
      ref={formRef}
      className="fixed top-0 right-0 z-50 h-screen w-[35%] border-l border-gray-200 bg-white shadow-lg"
    >
      <div className="bg-[#E3E3E4] p-4">
        <h1 className="text-xl font-normal text-[#334155]">
          Edit Insurance Plan
        </h1>
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
            required={false}
            handleChange={handleChange}
            label="Plan Name"
            complex={false}
          />

          <Input
            formData={formData}
            valueName="provider"
            placeholder="Primera Blue Cross"
            required={false}
            handleChange={handleChange}
            label="Provider"
            complex={false}
          />

          <DropdownInput
            formData={formData}
            valueName="planType"
            placeholder="Select a plan type."
            required={false}
            label="Plan Type"
            options={planTypeOptions}
            handleChange={handleChange}
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
            onFocus={(e) => {
              e.target.type = "date";
            }}
            onBlur={(e) => {
              if (!e.target.value) {
                e.target.type = "text";
              }
            }}
          >
            <Calendar className="absolute top-1/2 right-3 h-3 w-3 -translate-y-1/2 transform text-gray-400" />
          </Input>

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
          />

          <DocumentsUploader
            onFilesChange={handleFileUpload}
            onDocumentUpdate={handleDocumentUpdate}
            initialDocuments={formData.documents}
          />
        </div>

        <div className="absolute right-0 bottom-0 left-0 mb-8 bg-white px-6">
          <ActionButtons
            isSubmitting={isSubmitting}
            onClose={onClose}
            disableSubmit={isSubmitting}
            submittingText="Updating..."
            submitText="Save"
          />
        </div>
        {showConfirmation && (
          <SaveInsurancePlan
            isOpen={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            onConfirm={handleConfirmSubmit}
          />
        )}
      </form>
    </div>
  );
};

export default InsuranceEditForm;
