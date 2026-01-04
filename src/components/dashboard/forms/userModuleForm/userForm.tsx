import { useEffect, useState } from "react";
import FormField, { FieldConfig } from "../../../reusables/formComponents/formInputFields";
import { Grid2 } from "@mui/material";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { CompanyApiType, fetchCompanies } from "../../../../api/services/dashboardServices/organizationService";
import { fetchInsurance } from "../../../../api/services/insuranceServices/insuranceService";
import { createUser, fetchUserDetails } from "../../../../api/services/dashboardServices/userService";
import { toast } from "react-toastify";
import { useDashboard } from "../../../../context/DashboardContext";
import { Pencil } from "lucide-react";
import RemoveThisUser from "../components/UserEdit/DeleteUSerEdit";
import { withErrorBoundary } from "react-error-boundary";
import { uservalidationSchema } from "../../../../schemas/UserSchemas";

interface UserFormProps {
    userId?: string | number;
    mode?: "create" | "edit" | "view";
    onClose: any
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

const displayToApiRole = (displayRole: string | null) =>
    displayRole === "user" ? "subscriber" : displayRole === "super_admin" ? "Super Admin" : displayRole === "admin" ? "Admin" : displayRole;

const apiToDisplayRole = (apiRole: string | null) =>
    apiRole === "subscriber" ? "user" : apiRole === "Super Admin" ? "super_admin" : apiRole;


const UserForm: React.FC<UserFormProps> = ({ userId, mode = "create", onClose }) => {
    const [formMode, setFormMode] = useState<"create" | "edit" | "view">(mode);
    const [initialValues, setInitialValues] = useState<Record<string, any>>({
        name: '',
        dob: '',
        phone: '',
        four_digit_ssn: '',
        user_email: '',
        start_date: '',
        organization_name: '',
        user_role: '',
        assigned_insurance: []
    });
    const [organizationOptions, setOrganizationOptions] = useState<CompanyApiType[]>([]);
    const [insuranceOptions, setInsuranceOptions] = useState<InsurancePlan[]>([]);
    const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);
    const { refreshData, updateUser } = useDashboard();

    useEffect(() => {
        const loadOrganizations = async () => {
            try {
                const companiesData = await fetchCompanies(0);
                setOrganizationOptions(companiesData);
            } catch (error) {
                console.error("Failed to fetch organizations:", error);
            } finally {
            }
        };
        loadOrganizations();
    }, []);

    useEffect(() => {
        if (selectedOrganization) {
            const loadInsurancePlans = async () => {
                try {
                    const plans = await fetchInsurance(
                        undefined,
                        undefined,
                        selectedOrganization
                    );
                    setInsuranceOptions(plans);
                } catch (error) {
                    setInsuranceOptions([]);
                } finally {

                }
            };
            loadInsurancePlans();
        } else {
            setInsuranceOptions([]);
            setInitialValues((prev) => ({ ...prev, assigned_insurance: [] }));
        }
    }, [selectedOrganization]);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                if (userId) {
                    const response = await fetchUserDetails(String(userId));
                    const displayRole = apiToDisplayRole(response.role);
                    setSelectedOrganization(response?.member_group?.id)
                    let benefitPlans: [] = [];
                    let selectedPlans: [] = [];

                    if (
                        response?.benefit_plan &&
                        Array.isArray(response?.benefit_plan) &&
                        response.benefit_plan.length > 0
                    ) {
                        benefitPlans = response.benefit_plan.map((plan: any) => ({
                            id: plan.id,
                            name: plan.plan_name,
                        }));

                        selectedPlans = response.benefit_plan.map((plan: any) => plan.id);
                    } else if (response?.benefit_plan == null) {
                        benefitPlans = []
                        selectedPlans = []
                    }
                    setInitialValues({
                        name: `${response?.first_name || ""} ${response?.last_name || ""}`.trim(),
                        dob: response?.date_of_birth || "",
                        phone: response?.phone || '',
                        four_digit_ssn: response?.ssn_last4 || '',
                        user_email: response.email || "",
                        start_date: response?.start_date || "",
                        organization_name: response?.member_group?.id,
                        user_role: displayRole,
                        assigned_insurance: selectedPlans,
                    })
                } else {
                    setInitialValues({
                        name: '',
                        dob: '',
                        phone: '',
                        four_digit_ssn: '',
                        user_email: '',
                        start_date: '',
                        organization_name: '',
                        user_role: '',
                        assigned_insurance: []
                    });
                }
            }
            catch (error) {

            }
        }
        loadUserData();
    }, [userId, mode]);

    

    const handleEditClick = () => {
        setFormMode("edit");
    };

    const organizationSelectOptions = organizationOptions.length > 0
        ? organizationOptions.map((organization) => ({
            value: organization.id,
            label: organization.org_name,
        }))
        : [];

    const roleOptions = [
        { value: "user", label: "User" },
        { value: "admin", label: "Admin" },
    ];

    const insuranceSelectOptions = insuranceOptions.length > 0 ? insuranceOptions.map((plan) => ({
        value: plan.id,
        label: plan.plan_name,
    })) : []

    const formFields: FieldConfig[] = [
        {
            name: "name",
            label: "Name*",
            placeholder: "Name",
            type: "text",
        },
        {
            name: "dob",
            label: "Date of Birth*",
            placeholder: "Select Date",
            type: "date",
        },
        {
            name: "four_digit_ssn",
            label: "Last 4 digits of SSN*",
            placeholder: "0000",
            type: "text",
        },
        {
            name: "user_email",
            label: "Email*",
            placeholder: "sallyjenkins@corp.com",
            type: "email",
        },
        {
            name: "phone",
            label: "Phone Number",
            placeholder: "(000) 000-0000",
            type: "phone"
        },
        {
            name: "organization_name",
            label: "Organization*",
            type: "select",
            placeholder: "Select Organization",
            options: organizationSelectOptions,
            onChange: (selectedValue: string) => setSelectedOrganization(selectedValue),
        },
        {
            name: "start_date",
            label: "Start Date",
            placeholder: "Select Date",
            type: "date",
        },
        {
            name: "user_role",
            label: "Role*",
            placeholder: "Select Role",
            type: "select",
            options: roleOptions,
            rounded: true,
        },
        {
            name: "assigned_insurance",
            label: "Assigned Insurance",
            type: "multi-select",
            placeholder: "Select an organization associated insurance plan",
            options: insuranceSelectOptions,
        },
    ];

    const mapRoleToApiRole = (uiRole: string): string => {
        const roleMap: Record<string, string> = {
            User: "subscriber",
            Admin: "admin",
        };
        return roleMap[uiRole] || "subscriber";
    };

    const handleSubmit = async (values: any) => {
        try {
            const [firstName = "", lastName = ""] = values.name.split(" ", 2);
            const apiRole = mapRoleToApiRole(values.role);
            const payload = {
                first_name: firstName || "string",
                last_name: lastName,
                email: values.user_email,
                work_email: values.user_email,
                phone: values.phone,
                date_of_birth: values?.dob ? values?.dob : '',
                ssn_last4: values.four_digit_ssn || "0000",
                gender_assigned: "not_specified",
                role: apiRole,
                status: "active",
                member_group_id: values.organization_name,
                start_date: values?.start_date ? values?.start_date : '',
                benefit_plan_ids: values?.assigned_insurance,
            };

            console.log("Submitting user data:", payload);
            if (formMode === "edit" && userId) {
                await updateUser(String(userId), payload);
                await refreshData();
                onClose();
            } else if (formMode === "create") {
                await createUser(payload);
                await refreshData();
                onClose();
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to create user";
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
                : formMode === "edit"
                    ? "bg-[#E3E3E4] text-[#334155]"
                    : "bg-[#E3E3E4] text-[#334155]"
                }`}>
                <h1 className="text-xl font-normal">
                    {formMode === "create" ? "Add User" : formMode === "edit" ? "Edit User Information" : "User Information"}
                </h1>
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={uservalidationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {(formikProps) => (
                    <>
                        <Form id="user-form" className="flex flex-col h-[calc(100%-116px)]">
                            {/* Scrollable area for form fields */}
                            <div className="flex-1 overflow-y-auto pt-6 pb-6 pr-5 pl-5">
                                <Grid2 container spacing={2}>
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
                                    {formMode === "edit" && userId && (
                                        <div className="w-full"><RemoveThisUser userId={userId} onSuccess={onClose} /></div>
                                    )}
                                </Grid2>
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
                                        form="user-form"
                                        className="flex-1 h-10 px-6 py-2 text-[14px] font-medium text-white bg-[#1E4477] rounded-[0.3125rem] hover:bg-[#234066]"
                                    >
                                        {formMode === "edit" ? "Save" : "Add"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </Formik>
        </div>
    );
};

export default withErrorBoundary(UserForm, {
    fallback: <div>Error Loading</div>,
    onError(error, info) {
        console.log(error)
    },
});