import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  fetchUserDetails,
  fetchInsurance,
  fetchCompanies,
} from "../../../../../services/axios";
import Header from "./FormComponents/Header";
import {
  StyledInput,
  StyledSelect,
  RoleSelect,
  MultiSelectInsurance,
} from "./FormComponents";
import { CustomCalendarIcon } from "./FormComponents/Icon";
import RemoveThisUser from "./DeleteUSerEdit";
import { useDashboard } from "../../../../../context/DashboardContext";
import UserForm from "../../userModuleForm/userForm";

// Role conversion helper functions
const displayToApiRole = (displayRole) =>
  displayRole === "user" ? "subscriber" : displayRole;
const apiToDisplayRole = (apiRole) =>
  apiRole === "subscriber" ? "user" : apiRole;

const UserEditForm = ({ userId, onClose }) => {
  const { updateUser } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [memberGroups, setMemberGroups] = useState([]);
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    ssn_last4: "",
    role: "",
    start_date: "",
    member_group_id: "",
    assigned_insurance_ids: [],
  });

  // References for date inputs
  const dateOfBirthRef = useRef(null);
  const startDateRef = useRef(null);

  // Fetch companies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companiesData = await fetchCompanies();
        setCompanies(companiesData);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Failed to fetch organizations");
      }
    };

    loadCompanies();
  }, []);

  // Fetch insurance plans filtered by organization_id and search term
  useEffect(() => {
    const loadInsurancePlans = async () => {
      try {
        // Only fetch insurance plans if an organization is selected
        if (formData.member_group_id) {
          const plans = await fetchInsurance(
            searchTerm,
            undefined,
            formData.member_group_id
          );
          setInsurancePlans(
            plans.map((plan) => ({
              id: plan.id,
              name: plan.plan_name,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching insurance plans:", error);
        toast.error("Failed to fetch insurance plans");
      }
    };

    loadInsurancePlans();
  }, [searchTerm, formData.member_group_id]);

  // Load user details
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchUserDetails(userId);
        console.log("User details response:", response);

        // Convert API role to display role
        const displayRole = apiToDisplayRole(response.role);

        // Process benefit plans for the multi-select
        let benefitPlans = [];
        let selectedPlans = [];

        if (
          response.benefit_plan &&
          Array.isArray(response.benefit_plan) &&
          response.benefit_plan.length > 0
        ) {
          // Use actual benefit plans
          benefitPlans = response.benefit_plan.map((plan) => ({
            id: plan.id,
            name: plan.plan_name,
          }));

          // Set selected plans
          selectedPlans = response.benefit_plan.map((plan) => plan.id);
        } else if (
          response.assigned_insurance &&
          typeof response.assigned_insurance === "string"
        ) {
          // Handle legacy data format
          benefitPlans = [
            {
              id: "legacy",
              name: response.assigned_insurance,
            },
          ];
          selectedPlans = ["legacy"];
        }

        // Set form data from user details
        setFormData({
          name: `${response.first_name || ""} ${response.last_name || ""}`.trim(),
          email: response.email || "",
          phone: response.phone || "",
          date_of_birth: response.date_of_birth || "",
          ssn_last4: response.ssn_last4 || "",
          role: displayRole,
          start_date: response.start_date,
          member_group_id: response.member_group?.id || "",
          assigned_insurance_ids: selectedPlans,
        });

        // Set member groups from user's member_group data
        if (response.member_group) {
          setMemberGroups([response.member_group]);
        }

        // Immediately fetch insurance plans based on the loaded organization
        if (response.member_group?.id) {
          try {
            const plans = await fetchInsurance(
              "",
              undefined,
              response.member_group.id
            );
            setInsurancePlans(
              plans.map((plan) => ({
                id: plan.id,
                name: plan.plan_name,
              }))
            );
          } catch (error) {
            console.error("Error fetching initial insurance plans:", error);
          }
        }
      } catch (error) {
        console.error("Error loading user details:", error);
        toast.error("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If organization changed, reset insurance selections
    if (name === "member_group_id" && value !== formData.member_group_id) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        assigned_insurance_ids: [], // Reset selected insurance plans
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleInsuranceChange = (selectedIds) => {
    setFormData((prev) => ({
      ...prev,
      assigned_insurance_ids: selectedIds,
    }));
  };

  const handleInsuranceSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  // Function to format date for display and editing
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";

    try {
      // Handle YYYY-MM-DD format
      if (dateStr.includes("-")) {
        return dateStr; // Already in correct format for date input
      }

      // Format MM/DD/YYYY to YYYY-MM-DD
      const [month, day, year] = dateStr.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateStr;
    }
  };

  // Function to open date pickers when calendar icon is clicked
  const openDatePicker = (ref) => {
    if (ref.current) {
      ref.current.type = "date";
      ref.current.focus();
      ref.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create a copy of the form data for submission
      const submissionData = { ...formData };

      // Convert display role back to API role before submission
      submissionData.role = displayToApiRole(formData.role);

      // Split name into first and last name
      const nameParts = formData.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const dataToSubmit = {
        first_name: firstName,
        last_name: lastName,
        work_email: submissionData.email,
        phone: submissionData.phone,
        date_of_birth: submissionData.date_of_birth,
        ssn_last4: submissionData.ssn_last4,
        role: submissionData.role,
        start_date: submissionData.start_date,
        member_group_id: submissionData.member_group_id,
        benefit_plan_ids: submissionData.assigned_insurance_ids || [],
      };

      console.log("Submitting data:", dataToSubmit);

      // Use the updateUser method from dashboard context
      await updateUser(userId, dataToSubmit);

      // Close the form
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update user details");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed top-0 right-0 h-screen w-[35%] bg-white shadow-lg">
        <Header />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    // <div className="fixed top-0 right-0 z-40 h-screen w-[35%] bg-white">
    //   <Header />

    //   <form
    //     onSubmit={handleSubmit}
    //     className="flex h-[calc(100vh-64px)] flex-col justify-between overflow-hidden pt-5"
    //   >
    //     <div className="flex-1 overflow-y-auto">
    //       <div className="space-y-3 pt-2">
    //         {/* Full Name */}
    //         <StyledInput
    //           label="Name"
    //           name="name"
    //           value={formData.name}
    //           onChange={handleInputChange}
    //           required
    //           placeholder="Full Name"
    //         />

    //         {/* Date of Birth */}
    //         <StyledInput
    //           label="Date of Birth"
    //           name="date_of_birth"
    //           value={formatDateForInput(formData.date_of_birth)}
    //           onChange={handleInputChange}
    //           type="text"
    //           placeholder="MM/DD/YY"
    //           required
    //           inputRef={dateOfBirthRef}
    //           onFocus={(e) => {
    //             e.target.type = "date";
    //           }}
    //           onBlur={(e) => {
    //             if (!e.target.value) {
    //               e.target.type = "text";
    //             }
    //           }}
    //         >
    //           <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
    //             <CustomCalendarIcon
    //               onClick={() => openDatePicker(dateOfBirthRef)}
    //             />
    //           </div>
    //         </StyledInput>

    //         {/* SSN Last 4 */}
    //         <StyledInput
    //           label="Last 4 digits of SSN"
    //           name="ssn_last4"
    //           value={formData.ssn_last4}
    //           onChange={handleInputChange}
    //           maxLength={4}
    //           pattern="[0-9]{4}"
    //           required
    //           placeholder="0000"
    //         />

    //         {/* Email */}
    //         <StyledInput
    //           label="Email"
    //           name="email"
    //           value={formData.email}
    //           onChange={handleInputChange}
    //           type="email"
    //           required
    //           placeholder="email@example.com"
    //         />

    //         {/* Phone */}
    //         <StyledInput
    //           label="Phone Number"
    //           name="phone"
    //           value={formData.phone}
    //           onChange={handleInputChange}
    //           type="tel"
    //           placeholder="(000) 000-0000"
    //         />

    //         {/* Organization - Dropdown of all companies */}
    //         <StyledSelect
    //           label="Organization"
    //           name="member_group_id"
    //           value={formData.member_group_id}
    //           onChange={handleInputChange}
    //           required
    //           options={companies.map((company) => ({
    //             id: company.id,
    //             name: company.org_name,
    //           }))}
    //         />

    //         {/* Start Date */}
    //         <StyledInput
    //           label="Start Date"
    //           name="start_date"
    //           value={formatDateForInput(formData.start_date)}
    //           onChange={handleInputChange}
    //           type="text"
    //           placeholder="MM/DD/YY"
    //           inputRef={startDateRef}
    //           onFocus={(e) => {
    //             e.target.type = "date";
    //           }}
    //           onBlur={(e) => {
    //             if (!e.target.value) {
    //               e.target.type = "text";
    //             }
    //           }}
    //         >
    //           <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
    //             <CustomCalendarIcon
    //               onClick={() => openDatePicker(startDateRef)}
    //             />
    //           </div>
    //         </StyledInput>

    //         {/* Role */}
    //         <RoleSelect
    //           value={formData.role}
    //           onChange={handleInputChange}
    //           required={true}
    //         />

    //         {/* Assigned Insurance (Multi-select) - Conditional based on organization selection */}
    //         {formData.member_group_id ? (
    //           <MultiSelectInsurance
    //             label="Assigned Insurance"
    //             selectedIds={formData.assigned_insurance_ids}
    //             onChange={handleInsuranceChange}
    //             onSearch={handleInsuranceSearch}
    //             options={insurancePlans}
    //           />
    //         ) : (
    //           <div className="px-6 py-2">
    //             <label className="mb-1 block text-sm font-medium text-gray-700">
    //               Assigned Insurance
    //             </label>
    //             <div className="mt-1 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500">
    //               Please select an organization first
    //             </div>
    //           </div>
    //         )}

    //         <RemoveThisUser userId={userId} onSuccess={onClose} />

    //         {/* Added extra space here for better gap before buttons */}
    //         <div className="h-8"></div>
    //       </div>
    //     </div>

    //     {/* Action Buttons */}
    //     <div className="mt-auto mb-6 p-2">
    //       <div className="flex gap-6">
    //         <button
    //           type="button"
    //           onClick={onClose}
    //           className="ml-6 flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-[#d8dadc] bg-white px-6 py-2.5 text-sm leading-5 font-medium text-[#1e4477] transition-colors hover:bg-gray-50"
    //         >
    //           Cancel
    //         </button>
    //         <button
    //           type="submit"
    //           disabled={submitting}
    //           className={`mr-6 flex h-10 flex-1 items-center justify-center gap-2 rounded-md px-6 py-2.5 text-sm leading-5 font-medium transition-colors ${submitting
    //             ? "bg-[#e3e3e4] text-[#919191]"
    //             : "bg-[#1e4477] text-white hover:bg-[#163660]"
    //             }`}
    //         >
    //           {submitting ? "Saving..." : "Save"}
    //         </button>
    //       </div>
    //     </div>
    //   </form>
    // </div>
    <UserForm mode="edit" onClose={onClose} userId={userId} />
  );
};

export default UserEditForm;
