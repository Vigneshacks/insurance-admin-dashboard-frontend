import { useState, useRef, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import OrganizationSelector from "../../forms/insuranceModuleForm/organizationSelector";
import { withErrorBoundary } from "react-error-boundary";
import { useDashboard } from "../../../../context/DashboardContext";
import { fetchInsuranceById } from "../../../../api/services/insuranceServices/insuranceService";

interface AssignInsuranceFormProps {
  insuranceIds: string[];
  onClose: () => void;
}

interface SelectedOrganization {
  id: string | number;
  text: string;
  effectiveStartDate: string | null;
  effectiveEndDate: string | null;
}

interface InsuranceFormData {
  planName: string;
  provider: string;
  planType: string;
  startDate: string;
  notes: string;
  selectedOrganizations: SelectedOrganization[];
  documents: {
    id: string;
    name: string;
    file?: File;
    url?: string;
    uploadedDate?: string;
  }[];
}

const AssignInsuranceForm = ({ insuranceIds, onClose }: AssignInsuranceFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [insuranceDetails, setInsuranceDetails] = useState<{ [key: string]: any }>({});
  const formRef = useRef<HTMLDivElement>(null);
  const [initialFormValues, setInitialFormValues] = useState<{
    selectedOrganizations: SelectedOrganization[];
  }>({
    selectedOrganizations: [],
  });
  const { updateInsurancePlan } = useDashboard();

  // Today's date in YYYY-MM-DD format
  const getTodayDate = () => new Date().toISOString().split("T")[0];

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (formRef.current && !formRef.current.contains(event.target as Node)) {
  //       onClose();
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [onClose]);

  useEffect(() => {
    const fetchInsuranceDetails = async () => {
      if (insuranceIds.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const insuranceId = insuranceIds[0];
        const response = await fetchInsuranceById(insuranceId);

        // Log the raw response to diagnose the issue
        console.log("Raw response from fetchInsuranceById:", response);

        const formatDate = (dateString?: string) => {
          if (!dateString) {
            console.warn("Missing date, defaulting to today");
            return getTodayDate();
          }

          // Try to parse the date
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            console.warn(`Invalid date format: ${dateString}, defaulting to today`);
            return getTodayDate();
          }

          // Extract the date parts to create a consistent YYYY-MM-DD format
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        // Map organizations with explicit logging
        const organizations = response.organizations.map((org: any) => {
          // Use the organization's specific effective date, fallback to insurance plan date if not available
          const effectiveStartDate = org.benefit_effective_start_dt || response.benefit_effective_start_dt;
          const effectiveEndDate = org.benefit_effective_end_dt;

          // Format dates for API
          const formattedStartDate = formatDate(effectiveStartDate);
          const formattedEndDate = effectiveEndDate ? formatDate(effectiveEndDate) : null;

          console.log(`Processing org ${org.id}: effectiveStartDate = ${formattedStartDate}`);

          return {
            id: org.id,
            text: org.org_name,
            effectiveStartDate: formattedStartDate,
            effectiveEndDate: formattedEndDate
          };
        });

        console.log("Fetched organizations:", organizations);

        setInitialFormValues({
          selectedOrganizations: organizations,
        });
        setInsuranceDetails(response);
      } catch (error) {
        console.error("Error fetching insurance details:", error);
        alert("Failed to load insurance details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsuranceDetails();
  }, [insuranceIds]);

  const validationSchema = Yup.object().shape({
    selectedOrganizations: Yup.array().of(
      Yup.object().shape({
        effectiveStartDate: Yup.string().nullable().required("Start date is required"),
      })
    ),
  });

  const handleSubmit = async (values: { selectedOrganizations: SelectedOrganization[] }) => {
    try {
      setIsSubmitting(true);

      const updatePromises = insuranceIds.map(async (insuranceId) => {
        try {
          let currentInsurance = insuranceDetails;
          if (Object.keys(currentInsurance).length === 0 || insuranceIds.length > 1) {
            currentInsurance = await fetchInsuranceById(insuranceId);
          }

          const formatDate = (dateString?: string) => {
            if (!dateString || isNaN(new Date(dateString).getTime())) {
              return getTodayDate();
            }
            const date = new Date(dateString);
            return date.toISOString().split("T")[0];
          };

          let documents = [];
          if (currentInsurance.file_url) {
            const displayFileName = currentInsurance.file_name?.split("/").pop() || "Document.pdf";
            documents = [
              {
                id: "existing-doc",
                name: displayFileName,
                url: currentInsurance.file_url,
                uploadedDate: formatDate(currentInsurance.benefit_effective_start_dt),
              },
            ];
          }

          // Create a formatted object with the existing insurance data
          const updatedFormData: InsuranceFormData = {
            planName: currentInsurance.plan_name || "",
            provider: currentInsurance.provider || "",
            planType: currentInsurance.coverage_type || currentInsurance.plan_type || "",
            startDate: formatDate(currentInsurance.benefit_effective_start_dt),
            notes: currentInsurance.notes || "",
            selectedOrganizations: values?.selectedOrganizations,
            documents: documents,
          };

          console.log(`Assigning organizations to insurance ID ${insuranceId}:`, values.selectedOrganizations);

          return updateInsurancePlan(insuranceId, updatedFormData);
        } catch (error) {
          console.error(`Error processing insurance ID ${insuranceId}:`, error);
          throw error;
        }
      });

      await Promise.all(updatePromises);
      console.log("Organizations assigned successfully");
      onClose();
    } catch (error) {
      console.error("Error assigning organizations:", error);
      alert(error instanceof Error ? error.message : "Failed to assign organizations");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={formRef}
      className="fixed top-0 right-0 h-screen w-[35%] bg-white shadow-lg z-50 border-l border-gray-200 flex flex-col"
    >
      <div className="bg-[#2B4C7E] p-4">
        <h1 className="text-xl font-normal text-white">Assign Organizations</h1>
      </div>

      <Formik
        enableReinitialize
        initialValues={initialFormValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, isValid }) => (
          <Form className="flex flex-col flex-grow">
            <div className="flex-grow overflow-auto p-3">
              <div className="scrollbar-none space-y-3 py-2 pl-1">
                {isLoading ? (
                  <div className="flex items-center justify-center h-20">
                    <p>Loading insurance details...</p>
                  </div>
                ) : (
                  <>
                    {insuranceIds.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Selected Insurance Plans</p>
                        <div className="p-3 bg-gray-100 rounded">
                          <p>{insuranceIds.length} insurance plan(s) selected</p>
                        </div>
                      </div>
                    )}

                    <OrganizationSelector />
                    {errors?.selectedOrganizations && (
                      <div className="text-red-500 text-sm mt-2">
                        {errors?.selectedOrganizations[0]?.effectiveStartDate}
                      </div>
                    )}

                  </>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 mt-auto">
              <div className="flex justify-center items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-[270px] h-10 rounded-[0.3125rem] border border-[#d8dadc] bg-white text-[#1e4477] font-medium text-sm"
                  disabled={isSubmitting || isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-[270px] h-10 rounded-[0.3125rem] bg-[#1e4477] text-white font-medium text-sm"
                  disabled={isSubmitting || isLoading || !isValid}
                >
                  {isSubmitting ? "Assigning..." : isLoading ? "Loading..." : "Assign"}
                </button>
              </div>
            </div>
            {/* <pre style={{ overflowX: "scroll" }}>{JSON?.stringify(values)}</pre> */}
            <pre style={{ overflowX: "scroll" }}>{JSON?.stringify(errors)}</pre>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default withErrorBoundary(AssignInsuranceForm, {
  fallback: <div>Error Loading </div>
});