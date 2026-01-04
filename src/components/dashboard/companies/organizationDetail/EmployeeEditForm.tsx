import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { fetchEmployeeDetails, updateEmployeeDetails, fetchInsurance } from "../../../../services/axios";
import Header from "../../forms/components/UserEdit/Header";
import { StyledInput, RoleSelect, MultiSelectInsurance } from "../../forms/components/UserEdit/FormComponents";
import { CustomCalendarIcon } from "../../forms/components/UserEdit/FormComponents/Icon";

interface CustomUserEditFormProps {
  userId: string;
  memberGroupMasterId: string;
  onClose: () => void;
}

// Role conversion helper functions
const displayToApiRole = (displayRole) => (displayRole === "user" ? "subscriber" : displayRole);
const apiToDisplayRole = (apiRole) => (apiRole === "subscriber" ? "user" : apiRole);

const CustomUserEditForm: React.FC<CustomUserEditFormProps> = ({ userId, memberGroupMasterId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date_of_birth: "",
    ssn_last4: "",
    role: "",
    start_date: "",
    work_email: "",
    benefit_plan_ids: [],
  });

  const dateOfBirthRef = useRef<HTMLInputElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);

  // Fetch employee details and insurance plans
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch employee details
        const employeeResponse = await fetchEmployeeDetails(memberGroupMasterId, userId);
        console.log("Employee details response:", employeeResponse);

        const displayRole = apiToDisplayRole(employeeResponse.role);
        const selectedPlans = employeeResponse.benefit_plan?.map((plan) => plan.id) || [];

        setFormData({
          name: `${employeeResponse.first_name || ""} ${employeeResponse.last_name || ""}`.trim(),
          phone: employeeResponse.phone || "",
          date_of_birth: employeeResponse.date_of_birth || "",
          ssn_last4: employeeResponse.ssn_last4 || "",
          role: displayRole,
          start_date: employeeResponse.start_date || "",
          work_email: employeeResponse.work_email || employeeResponse.email || "",
          benefit_plan_ids: selectedPlans,
        });

        // Fetch insurance plans using memberGroupMasterId as organization_id
        const insuranceResponse = await fetchInsurance("", "", memberGroupMasterId);
        console.log("Insurance plans response:", insuranceResponse);
        
        const formattedPlans = insuranceResponse.map((plan) => ({
          id: plan.id,
          name: plan.plan_name || plan.name, // Adjust based on actual API response field
        }));
        
        setInsurancePlans(formattedPlans);

      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to fetch employee or insurance data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, memberGroupMasterId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInsuranceChange = (selectedIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      benefit_plan_ids: selectedIds,
    }));
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      if (dateStr.includes("-")) return dateStr;
      const [month, day, year] = dateStr.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateStr;
    }
  };

  const openDatePicker = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) {
      ref.current.type = "date";
      ref.current.focus();
      ref.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submissionData = { ...formData };
      submissionData.role = displayToApiRole(formData.role);
      const nameParts = formData.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const dataToSubmit = {
        first_name: firstName,
        last_name: lastName,
        work_email: submissionData.work_email,
        phone: submissionData.phone,
        date_of_birth: submissionData.date_of_birth,
        ssn_last4: submissionData.ssn_last4,
        gender_assigned: "not_specified",
        role: submissionData.role,
        benefit_plan_ids: submissionData.benefit_plan_ids || [],
        start_date: submissionData.start_date || null,
      };

      console.log("Submitting data:", dataToSubmit);
      await updateEmployeeDetails(memberGroupMasterId, userId, dataToSubmit);
      toast.success("Employee updated successfully");
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update employee details");
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
    <div className="fixed top-0 right-0 z-40 h-screen w-[35%] bg-white">
      <Header />
      <form
        onSubmit={handleSubmit}
        className="flex h-[calc(100vh-64px)] flex-col justify-between overflow-hidden pt-5"
      >
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3 pt-2">
            <StyledInput
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Full Name"
            />
            <StyledInput
              label="Date of Birth"
              name="date_of_birth"
              value={formatDateForInput(formData.date_of_birth)}
              onChange={handleInputChange}
              type="text"
              placeholder="MM/DD/YY"
              required
              inputRef={dateOfBirthRef}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
            >
              <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                <CustomCalendarIcon onClick={() => openDatePicker(dateOfBirthRef)} />
              </div>
            </StyledInput>
            <StyledInput
              label="Last 4 digits of SSN"
              name="ssn_last4"
              value={formData.ssn_last4}
              onChange={handleInputChange}
              maxLength={4}
              pattern="[0-9]{4}"
              required
              placeholder="0000"
            />
            <StyledInput
              label="Email"
              name="work_email"
              value={formData.work_email}
              onChange={handleInputChange}
              type="email"
              required
              placeholder="email@example.com"
            />
            <StyledInput
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              type="tel"
              placeholder="(000) 000-0000"
            />
            <StyledInput
              label="Start Date"
              name="start_date"
              value={formatDateForInput(formData.start_date)}
              onChange={handleInputChange}
              type="text"
              placeholder="MM/DD/YY"
              inputRef={startDateRef}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
            >
              <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                <CustomCalendarIcon onClick={() => openDatePicker(startDateRef)} />
              </div>
            </StyledInput>
            <RoleSelect
              value={formData.role}
              onChange={handleInputChange}
              required={true}
            />
            <MultiSelectInsurance
              label="Assigned Insurance"
              selectedIds={formData.benefit_plan_ids}
              onChange={handleInsuranceChange}
              options={insurancePlans}
            />
            <div className="h-8"></div>
          </div>
        </div>
        <div className="p-2 mt-auto mb-6">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={onClose}
              className="flex flex-1 items-center justify-center gap-2 rounded-md ml-6 py-2.5 px-6 border border-[#d8dadc] bg-white text-[#1e4477] font-medium text-sm leading-5 h-10 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md mr-6 py-2.5 px-6 h-10 font-medium text-sm leading-5 transition-colors ${
                submitting
                  ? "bg-[#e3e3e4] text-[#919191]"
                  : "bg-[#1e4477] text-white hover:bg-[#163660]"
              }`}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CustomUserEditForm;