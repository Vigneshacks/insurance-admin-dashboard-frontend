import type React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
// Import the search icon
import Tables from "../../tables/Tables";
import {
  fetchCompanyDetails,
  fetchEmployees,
  deleteUser,
  updateEmployeeDetails,
} from "../../../services/axios";
import DashboardSubHeader from "../../layouts/DashboardSubHeader";
import { toast } from "react-toastify";
import UserEditForm from "../forms/components/UserEdit/UserEditForm";
import UserDetailsView from "../forms/UserDetailsView";
import CompanyEditForm from "../forms/CompanyEditForm";
import InsuranceForm from "../insurancePlans/InsuranceForms";
import TopSectionWithCards from "./organizationDetail/TopSectionWithCards";
import DashboardSearch from "../../layouts/DashboardSearch";
import UserCard from "../../../assets/DashboardcardIcons/UserCard";
import AddUserForm from "../forms/adduserform/AddUserForm";
import RemoveButton from "./organizationDetail/RemoveButton";
import AssignInsuranceButton from "./organizationDetail/AssignInsuranceButton";
import AssignInsuranceForm from "./organizationDetail/AssignUserInsuranceForm";
import CustomUserEditForm from "./organizationDetail/EmployeeEditForm";
import { removeUser } from "../../../commonComponents/DeletePopUp";
import CompanyForm from "../forms/organizationModuleForm/organizationForm";
import { fetchUserDetails } from "../../../services/axios";

interface CompanyDetails {
  org_name: string;
  org_address: string;
  billing_contact_name: string;
  billing_contact_email: string;
  start_date: string;
  id: string;
  employee_count: number;
  admins: Array<{
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    role: string;
    id: string;
  }>;
  benefit_plans: Array<{
    id: string;
    plan_name: string;
    provider: string;
    coverage_type: string;
    start_date: string;
    renewal_date: string | null;
  }>;
  renewal_date: string | null;
}
interface Employee {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  role: string;
  start_date: string | null;
  benefit_plan: any | null;
  assigned_insurance: string | null;
}
interface FormattedEmployee {
  id: string;
  originalId: string;
  name: string;
  email: string;
  phonenumber: string;
  role: string;
  startdate: string;
  assignedinsuranceplans: string;
}

const CompanyDetailsPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(
    null
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedUserForView, setSelectedUserForView] = useState<string | null>(
    null
  );
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<string | null>(
    null
  );
  const [isInsuranceFormVisible, setIsInsuranceFormVisible] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showRemoveUserDialog, setShowRemoveUserDialog] = useState(false);
  const [showAssignInsuranceForm, setShowAssignInsuranceForm] = useState(false);
  const [customEditUserId, setCustomEditUserId] = useState<string | null>(null);

  // Headers for the users table
  const userHeaders = [
    "Name",
    "Email",
    "Phone Number",
    "Role",
    "Start Date",
    "Assigned Insurance Plans",
  ];

  // Fetch organization details when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) return;

      try {
        setLoading(true);
        const [companyData, employeesData] = await Promise.all([
          fetchCompanyDetails(companyId),
          fetchEmployees(companyId),
        ]);

        setCompanyDetails(companyData);
        setEmployees(employeesData.result || []);
        setError(null);
      } catch (error) {
        setError("Failed to fetch organization details");
        toast.error("Failed to fetch organization details");
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  // Format employee data for the table
  const formatEmployeeData = (): FormattedEmployee[] => {
    if (!Array.isArray(employees)) {
      console.error("Employees is not an array:", employees);
      return [];
    }

    const filteredEmployees = employees.filter(
      (employee) =>
        employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone?.includes(searchTerm)
    );

    return filteredEmployees.map((employee) => {
      // Log the benefit_plan for debugging (optional, can remove later)
      console.log(
        `Employee ${employee.id} benefit_plan:`,
        employee.benefit_plan
      );

      // Handle insurance plans: return null if no plans, otherwise just plan_name
      const insurancePlans =
        Array.isArray(employee.benefit_plan) && employee.benefit_plan.length > 0
          ? employee.benefit_plan.map((plan) => {
              if (!plan.plan_name) {
                console.warn(
                  `Missing plan_name for employee ${employee.id}:`,
                  plan
                );
                return "Unknown Plan"; // Fallback if plan_name is missing
              }
              return plan.plan_name; // Only return plan_name, no provider
            })
          : // Join multiple plans with a comma if applicable
            []; // Return null if no plans

      return {
        id: `user_${employee.id}`,
        originalId: employee.id,
        name:
          employee.first_name && employee.last_name
            ? `${employee.first_name} ${employee.last_name}`
            : employee.first_name || employee.last_name || "Unknown Name",
        email: employee.email,
        phonenumber: employee.phone,
        role:
          employee.role === "subscriber"
            ? "User"
            : employee.role.charAt(0).toUpperCase() + employee.role.slice(1),
        startdate: employee.start_date
          ? new Date(employee.start_date).toLocaleDateString()
          : [],
        assignedinsuranceplans: insurancePlans, // Use null if no plans
      };
    });
  };
  // Add this function to your CompanyDetailsPage component

  // Handle checkbox selection
  const handleEmployeeSelection = (id: string) => {
    const originalId = id.startsWith("user_") ? id.substring(5) : id;
    setSelectedEmployees((prev) =>
      prev.includes(originalId)
        ? prev.filter((prevId) => prevId !== originalId)
        : [...prev, originalId]
    );
  };
  const handleAssignInsurancePlan = async (selectedPlanIds: string[]) => {
    if (selectedEmployees.length === 0) {
      toast.error("No users selected for insurance assignment");
      return;
    }

    if (!companyId) {
      toast.error("Company ID is missing");
      return;
    }

    const loadingToast = toast.loading(
      `Assigning insurance plans to ${selectedEmployees.length} user(s)...`
    );

    try {
      // Process each selected user
      const updatePromises = selectedEmployees.map(async (userId) => {
        try {
          // First fetch current user details
          const userDetails = await fetchUserDetails(userId);

          if (!userDetails) {
            console.error(`No user details found for user ${userId}`);
            return false;
          }

          // Important change: Use the array of plan IDs directly
          const benefitPlanIds = selectedPlanIds;

          // Prepare update data, maintaining existing user data
          const updateData = {
            first_name: userDetails.first_name || "",
            last_name: userDetails.last_name || "",
            work_email: userDetails.work_email || userDetails.email || "",
            phone: userDetails.phone || "",
            date_of_birth: userDetails.date_of_birth || null,
            ssn_last4: userDetails.ssn_last4 || "",
            gender_assigned: userDetails.gender_assigned || "",
            role: userDetails.role || "employee",
            benefit_plan_ids: benefitPlanIds, // Pass the array directly
            start_date: userDetails.start_date || null,
          };

          console.log(
            `Updating user ${userId} in organization ${companyId}`,
            updateData
          );

          await updateEmployeeDetails(companyId, userId, updateData);
          return true;
        } catch (error) {
          console.error(`Failed to update user ${userId}:`, error);
          if (error.response) {
            console.error(
              `Status: ${error.response.status}`,
              error.response.data
            );
          }
          return false;
        }
      });

      // Wait for all updates to complete
      const results = await Promise.all(updatePromises);
      const successCount = results.filter((result) => result === true).length;

      // Show success or partial success message
      if (successCount === selectedEmployees.length) {
        toast.update(loadingToast, {
          render: `Successfully assigned insurance plan to ${successCount} user(s)`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(loadingToast, {
          render: `Assigned insurance plan to ${successCount} of ${selectedEmployees.length} user(s)`,
          type: "warning",
          isLoading: false,
          autoClose: 3000,
        });
      }

      // Refresh employee data
      if (companyId) {
        const employeesData = await fetchEmployees(companyId);
        setEmployees(employeesData.result || []);
      }

      // Clear selections and close form
      setSelectedEmployees([]);
      setShowAssignInsuranceForm(false);
    } catch (error) {
      console.error("Error assigning insurance plans:", error);
      toast.update(loadingToast, {
        render: "Failed to assign insurance plans. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const cleanUserId = userId.startsWith("user_")
      ? userId.substring(5)
      : userId;

    try {
      // First fetch current user details
      const userDetails = await fetchUserDetails(cleanUserId);

      if (!userDetails) {
        toast.error("Could not retrieve user details");
        return;
      }

      // Determine the new role
      const newRole =
        currentRole.toLowerCase() === "admin" ? "subscriber" : "admin";

      // Extract benefit plan IDs from the user details
      let benefitPlanIds = [];

      // Check if benefit_plan exists and has the expected structure
      if (userDetails.benefit_plan && Array.isArray(userDetails.benefit_plan)) {
        benefitPlanIds = userDetails.benefit_plan.map((plan) => plan.id);
      } else if (
        userDetails.benefit_plan_ids &&
        Array.isArray(userDetails.benefit_plan_ids)
      ) {
        benefitPlanIds = userDetails.benefit_plan_ids;
      }

      // Prepare update data, maintaining existing user data
      const updateData = {
        first_name: userDetails.first_name || "",
        last_name: userDetails.last_name || "",
        work_email: userDetails.work_email || userDetails.email || "",
        phone: userDetails.phone || "",
        date_of_birth: userDetails.date_of_birth || null,
        ssn_last4: userDetails.ssn_last4 || "",
        gender_assigned: userDetails.gender_assigned || "",
        role: newRole, // Change the role
        benefit_plan_ids: benefitPlanIds, // Use the extracted benefit plan IDs
        start_date: userDetails.start_date || null,
      };

      // Log what we're sending for debugging
      console.log("User details before update:", userDetails);
      console.log("Sending update with benefit_plan_ids:", benefitPlanIds);

      // Show loading toast
      const loadingToast = toast.loading(
        `${currentRole.toLowerCase() === "admin" ? "Demoting" : "Promoting"} user...`
      );

      // Update user details
      await updateEmployeeDetails(companyId, cleanUserId, updateData);

      // Update success toast
      toast.update(loadingToast, {
        render: `User ${currentRole.toLowerCase() === "admin" ? "demoted from" : "promoted to"} admin successfully`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Refresh employee data
      if (companyId) {
        const employeesData = await fetchEmployees(companyId);
        setEmployees(employeesData.result || []);
      }
    } catch (error) {
      toast.error(
        `Failed to ${currentRole.toLowerCase() === "admin" ? "demote" : "promote"} user`
      );
      console.error("Error toggling role:", error);
    }
  };

  const handleCustomEdit = (userId: string) => {
    const cleanUserId = userId.startsWith("user_")
      ? userId.substring(5)
      : userId;
    setCustomEditUserId(cleanUserId);
  };
  const handleCloseCustomEdit = () => {
    setCustomEditUserId(null);
    // Refresh employee data if needed
    if (companyId) {
      fetchEmployees(companyId)
        .then((data) => setEmployees(data.result || []))
        .catch((_) => toast.error("Failed to refresh employee data"));
    }
  };

  // Handle "Select All" functionality
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredEmployees = formatEmployeeData();
      setSelectedEmployees(filteredEmployees.map((emp) => emp.originalId));
    } else {
      setSelectedEmployees([]);
    }
  };

  // Handle "Edit" button click
  const handleEditClick = () => {
    setIsEditFormOpen(true);
  };
  const handleEditFormClose = () => {
    setIsEditFormOpen(false);
    if (companyId) {
      fetchCompanyDetails(companyId)
        .then((data) => setCompanyDetails(data))
        .catch((_) => toast.error("Failed to refresh organization details"));
    }
  };

  // Handle user view and edit
  const handleUserView = (userId: string) => {
    const cleanUserId = userId.startsWith("user_")
      ? userId.substring(5)
      : userId;
    setSelectedUserForView(cleanUserId);
  };
  const handleUserEdit = (userId: string) => {
    // Do nothing here, or remove this function if not used elsewhere
    console.log("Standard edit not used from menu");
  };
  const handleAddUser = () => {
    setShowAddUserForm(true);
  };
  const handleCloseAddUser = async () => {
    setShowAddUserForm(false);
    // Refresh the employee list after adding a new user
    if (companyId) {
      try {
        const employeesData = await fetchEmployees(companyId);
        setEmployees(employeesData.result || []);
      } catch (error) {
        toast.error("Failed to refresh employees list");
      }
    }
  };
  const itemsPerPage = 6;
  const handleDeleteUsers = () => {
    if (selectedEmployees.length === 0) {
      toast.error("No users selected for deletion.");
      return;
    }
    setShowRemoveUserDialog(true); // Open the dialog
  };
  const handleConfirmDelete = async () => {
    try {
      const loadingToast = toast.loading("Deleting users...");
      await Promise.all(selectedEmployees.map((userId) => deleteUser(userId)));

      toast.update(loadingToast, {
        render: `Successfully deleted ${selectedEmployees.length} user${
          selectedEmployees.length > 1 ? "s" : ""
        }`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      setSelectedEmployees([]); // Clear selected users
      setShowRemoveUserDialog(false); // Close the dialog

      // Refresh the user list
      if (companyId) {
        const employeesData = await fetchEmployees(companyId);
        setEmployees(employeesData.result || []);
      }
    } catch (error) {
      toast.error("Failed to delete one or more users. Please try again.");
      console.error("Error deleting users:", error);
    }
  };

  // Handle assign insurance button click
  const handleAssignInsurance = () => {
    if (selectedEmployees.length === 0) {
      toast.error("No users selected for insurance assignment.");
      return;
    }
    setShowAssignInsuranceForm(true);
  };

  // Handle close assign insurance form
  const handleCloseAssignInsurance = () => {
    setShowAssignInsuranceForm(false);
  };

  const handleCloseInsuranceForm = () => {
    setIsInsuranceFormVisible(false);
  };

  if (loading) {
    return (
      <DashboardLayout
        heading="Loading..."
        tag="SUPER ADMIN"
        className="font-roboto text-[28px] leading-[36px] text-[#1E4477]"
      >
        <div className="flex items-center justify-center p-8">
          Loading organization details...
        </div>
        {showAddUserForm && <AddUserForm onClose={handleCloseAddUser} />}
      </DashboardLayout>
    );
  }

  if (error || !companyDetails) {
    return (
      <DashboardLayout
        heading="Error"
        tag="SUPER ADMIN"
        className="font-roboto text-[28px] leading-[36px] text-[#1E4477]"
      >
        <div className="flex items-center justify-center p-8 text-red-500">
          {error || "Company details not found"}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      heading={`Organizations / ${companyDetails.org_name}`}
      tag="SUPER ADMIN"
      className="font-roboto text-[28px] leading-[36px] font-normal tracking-[0px] text-[#1E4477]"
    >
      <div className="scrollbar-none relative flex h-[calc(100vh-100px)] flex-col overflow-auto pr-1">
        {/* Top section with cards */}
        <TopSectionWithCards
          companyDetails={companyDetails}
          onEditClick={handleEditClick}
        />

        {/* Users Section with scroll */}
        <div className="flex flex-1 flex-col rounded-lg bg-white p-4">
          <div className="flex flex-col space-y-4">
            <DashboardSubHeader
              Icon={UserCard}
              label={`${employees.length} Users`}
              callBackOnAdd={handleAddUser}
            />

            <div className="flex items-center space-x-4">
              <DashboardSearch
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
              />

              {selectedEmployees.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleAssignInsurance}
                    className="cursor-pointer"
                  >
                    <AssignInsuranceButton />
                  </button>
                  <button
                    onClick={handleDeleteUsers}
                    className="cursor-pointer"
                  >
                    <RemoveButton />
                  </button>
                </div>
              )}
            </div>
          </div>

          {isEditFormOpen && companyId && (
            <>
              <div className="absolute top-0 right-0 h-full">
                <CompanyEditForm
                  companyId={companyId}
                  onClose={handleEditFormClose}
                  showAdminEmails={false}
                />
              </div>
            </>
          )}

          <div className="flex-1">
            <Tables
              nodes={formatEmployeeData()}
              headers={userHeaders}
              type="user"
              itemsPerPage={8}
              className="text-xs"
              paginationClassName={`fixed rounded-lg bottom-1 left-170 right-130 py-4  flex justify-center z-100 ${
                employees.length > itemsPerPage ? "block" : "hidden"
              }`}
              onRowSelect={handleEmployeeSelection}
              selectedRows={selectedEmployees.map((id) => `user_${id}`)}
              onViewClick={handleUserView}
              onCustomEdit={handleCustomEdit}
              showRoleToggle={true} // Add this line
              onToggleRole={handleToggleRole}
            />
          </div>
          {selectedUserForView && (
            <UserDetailsView
              userId={selectedUserForView}
              onClose={() => setSelectedUserForView(null)}
            />
          )}

          {selectedUserForEdit && (
            <UserEditForm
              userId={selectedUserForEdit}
              onClose={() => setSelectedUserForEdit(null)}
            />
          )}
        </div>
      </div>

      {/* Insurance Form */}
      {isInsuranceFormVisible && (
        <div className="justify-right">
          <div className="rounded-lg bg-white p-4">
            <InsuranceForm onClose={handleCloseInsuranceForm} />
          </div>
        </div>
      )}

      {/* Add User Form */}
      {showAddUserForm && <AddUserForm onClose={handleCloseAddUser} />}

      {/* Remove User Dialog */}
      {showRemoveUserDialog &&
        removeUser({
          isOpen: showRemoveUserDialog,
          onClose: () => setShowRemoveUserDialog(false),
          onConfirm: handleConfirmDelete,
        })}

      {/* Assign Insurance Form */}
      {showAssignInsuranceForm && companyDetails && (
        <AssignInsuranceForm
          selectedUserCount={selectedEmployees.length}
          selectedUsers={selectedEmployees} // Pass the selected employee IDs
          insurancePlans={companyDetails.benefit_plans}
          onAssign={handleAssignInsurancePlan}
          onClose={handleCloseAssignInsurance}
        />
      )}
      {/* Add your custom edit form component */}
      {customEditUserId && (
        <CustomUserEditForm
          userId={customEditUserId}
          memberGroupMasterId={companyId} // Pass companyId as memberGroupMasterId
          onClose={handleCloseCustomEdit}
        />
      )}
    </DashboardLayout>
  );
};

export default CompanyDetailsPage;
