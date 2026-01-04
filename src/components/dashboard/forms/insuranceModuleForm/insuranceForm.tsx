import { useEffect, useRef, useState } from "react";
import FormField, { FieldConfig } from "../../../reusables/formComponents/formInputFields";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import OrganizationSelector from "./organizationSelector";
import { useDashboard } from "../../../../context/DashboardContext";
import FileUploader from "./documentUploader";
import { fetchInsuranceById } from "../../../../api/services/insuranceServices/insuranceService";
import { format } from "date-fns";
import { withErrorBoundary } from "react-error-boundary";

interface UserFormProps {
    insuranceId?: string;
    mode?: "create" | "edit" | "view";
    onClose: () => void;
}

const InsuranceForm: React.FC<UserFormProps> = ({ insuranceId, mode = "create", onClose }) => {
    const { createInsurancePlan, updateInsurancePlan } = useDashboard();
    const [formMode, setFormMode] = useState<"create" | "edit" | "view">(mode);
    const [initialValues, setInitialValues] = useState<Record<string, any>>({
        plan_name: '',
        provider_name: '',
        plan_type: '',
        start_date: '',
        notes: '',
        selectedOrganizations: [],
        documents: [],
    });

    useEffect(() => {
        const fetchInsuranceDetails = async () => {
            try {
                if (insuranceId) {
                    const response = await fetchInsuranceById(String(insuranceId));
                    const organisations = response?.organizations.map((org) => {
                        return {
                            id: org?.id,
                            text: org?.org_name,
                            effectiveStartDate: org?.benefit_effective_start_dt || "",
                            effectiveEndDate: org?.benefit_effective_end_dt || "",
                        }
                    })
                    const documents = [];
                    if (response.file_url) {
                        documents.push({
                            id: "existing-doc",
                            fileName: response.file_name || "Document.pdf",
                            fileUrl: response.file_url,
                            updatedDate: response.benefit_effective_start_dt ? format(new Date(response.benefit_effective_start_dt), 'yyyy-MM-dd') : '',
                        });
                    }
                    setInitialValues({
                        plan_name: response?.plan_name || '',
                        provider_name: response?.provider || '',
                        plan_type: response?.coverage_type || '',
                        start_date: response?.start_date || '',
                        notes: response?.notes || '',
                        selectedOrganizations: organisations || [],
                        documents: documents || [],
                    })
                } else {
                    setInitialValues({
                        plan_name: '',
                        provider_name: '',
                        plan_type: '',
                        start_date: '',
                        notes: '',
                        selectedOrganizations: [],
                        documents: [],
                    })
                }
            } catch (error) {
                console.error("Error fetching insurance details:", error);
                alert("Failed to load insurance details. Please try again.");
            } finally {
                // setIsLoading(false);
            }
        };
        fetchInsuranceDetails();
    }, [insuranceId, formMode]);

    const validationSchema = Yup.object({
        plan_name: Yup.string().required("Required"),
        provider_name: Yup.string().required("Required"),
        plan_type: Yup.string().required("Required"),
        start_date: Yup.date().typeError("Enter a valid date").required("Required"),
        selectedOrganizations: Yup.array().of(
            Yup.object().shape({
                id: Yup.string().required(),
                text: Yup.string().required(),
                effectiveStartDate: Yup.mixed().nullable().typeError("Enter a valid Date").required('Required'),
                effectiveEndDate: Yup.date().nullable().typeError("Enter a valid Date"),
            })
        ),
        documents: Yup.array()
            .min(1, "Atleast one document is required")
            .required("Documents are required"),
    });

    const planTypes = [
        { value: "HEALTH", label: "HEALTH" },
        { value: "DENTAL", label: "DENTAL" },
        { value: "VISION", label: "VISION" },
        { value: "OTHER", label: "OTHER" },
    ];

    const formFields: FieldConfig[] = [
        {
            name: "plan_name",
            label: "Plan Name*",
            placeholder: "Heritage",
            type: "text",
            validation: Yup.string().required("Required"),
        },
        {
            name: "provider_name",
            label: "Provider*",
            placeholder: "Primera Blue Cross",
            type: "text",
            validation: Yup.string().required("Required"),
        },
        {
            name: "plan_type",
            label: "Plan Type*",
            type: "select",
            placeholder: "Select a plan type",
            validation: Yup.string().required("Required"),
            options: planTypes,
        },
        {
            name: "start_date",
            label: "Start Date*",
            placeholder: "MM/DD/YY",
            type: "date",
        },
        {
            name: "notes",
            label: "Notes",
            placeholder: "Enter additional details about this plan",
            type: "text",
        },
    ];

    const handleSubmit = async (values: any) => {
        try {
            const payload = {
                planName: values?.plan_name || '',
                planType: values?.plan_type || '',
                provider: values?.provider_name || '',
                startDate: values?.start_date || '',
                notes: values?.notes || '',
                selectedOrganizations: values?.selectedOrganizations || [],
                documents: values?.documents.map((file: any, index: number) => {
                    const docs: any = {
                        id: `temp-${index}`,
                        name: file.fileName,
                        uploadedDate: file?.updatedDate,
                    };
                    if (file?.file) {
                        docs.file = file.file
                    }
                    return docs;
                }) || [],
            };
            console.log("Submitting user data:", payload);
            if (formMode === "edit" && insuranceId) {
                await updateInsurancePlan(insuranceId, payload);
                onClose();
                // toast.success("Insurance details updated!");
            } else if (formMode === "create") {
                await createInsurancePlan(payload);
                // toast.success("Insurance created successfully!");
                onClose();
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to create insurance";
            console.error("API Error:", error);
            toast.error(errorMessage);
        } finally {

        }
    };

    return (
        <div className="fixed top-0 right-0 flex h-screen w-[35%] flex-col bg-white shadow-lg">
            {/* Header - Always fixed at top */}
            <div className={`p-4 ${formMode === "create"
                ? "bg-[#2B4C7E] text-white"
                : "bg-[#E3E3E4] text-[#334155]"
                }`}>
                <h1 className="text-xl font-normal">
                    {formMode === "create" ? "Add Insurance Plan" : "Edit Insurance Plan"}
                </h1>
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {(formikProps) => (
                    <>
                        <Form id="insurance-form" className="flex flex-col h-[calc(100%-116px)]">
                            {/* Scrollable area for form fields */}
                            <div className="flex-1 overflow-y-auto pt-6 pb-6 pr-5 pl-5">
                                <div className="flex flex-col space-y-3">
                                    {formFields.map((field) => (
                                        <div key={field.name}>
                                            <Field
                                                name={field.name}
                                                component={FormField}
                                                fieldConfig={{
                                                    ...field,
                                                    disabled: formMode === "view" || field.disabled,
                                                }}
                                            />
                                        </div>
                                    ))}

                                    <div>
                                        <OrganizationSelector />
                                    </div>
                                    <div>
                                        <FileUploader name="documents"
                                            allowDuplicates={true}
                                        />
                                    </div>
                                </div>
                                {/* {JSON.stringify(formikProps.values)} */}
                            </div>

                        </Form>

                        {/* Action buttons - Fixed at bottom outside of scrollable area */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        formikProps.resetForm();
                                        onClose();
                                    }}
                                    className="flex-1 h-10 px-6 py-2 text-[14px] font-medium text-[#1e4477] border border-[#d8dadc] rounded-[0.3125rem] hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                
                                    type="submit"
                                    form="insurance-form"
                                    className="flex-1 h-10 px-6 py-2 text-[14px] font-medium text-white bg-[#1E4477] rounded-[0.3125rem] hover:bg-[#234066]"
                                >
                                    {formMode === "create" ? "Add" : "Save"}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </Formik>
        </div>
    );
};

export default withErrorBoundary(InsuranceForm, {
    fallback: <div>Error Loading</div>,
    onError(error, info) {
        console.log(error)
    },
});