import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardSearch from "../../layouts/DashboardSearch";
import DashboardCards from "./components/DashboardCards";
import ModuleHeader from "./components/module/ModuleHeader";
import { toast } from "react-toastify";
import {
  useDashboard,
  formatRoleForDisplay,
} from "../../../context/DashboardContext";
import { useUserRole } from "../../../context/UserRoleContext";
import { Company, User } from "../../../types/dashboard.types";
import CustomColumnVisibilityPopup from "../../popups/EditViewCompany";
import { TableWithColumnVisibility } from "../../DashboardView/OrganizationEditView";
import UserColumnVisibilityPopup from "../../popups/UserEditView";
import { useNavigate } from "react-router-dom";
import UserForm from "../forms/userModuleForm/userForm";
import CompanyForm from "../forms/organizationModuleForm/organizationForm";

const Dashboard = () => {
  const { role } = useUserRole();
  const navigate = useNavigate();
  const isSuperAdmin = role === "super_admin";
  const {
    companies,
    users,
    initializeData,
    addCompany,
    updateCompany,
    addUser,
    updateUser,
  } = useDashboard();

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (isSuperAdmin) {
      setFilteredCompanies(companies);
    }
  }, [companies, isSuperAdmin]);

  useEffect(() => {
    // Transform any SUBSCRIBER roles to USER for display
    const transformedUsers = users.map((user) => ({
      ...user,
      role: user.role === "SUBSCRIBER" ? "USER" : user.role,
    }));
    setFilteredUsers(transformedUsers);
  }, [users]);

  const handleCompanySearch = (term: string) => {
    setCompanySearchTerm(term);
    const filtered = companies.filter((organization) =>
      organization.organization.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCompanies(filtered);
  };

  const handleUserSearch = (term: string) => {
    setUserSearchTerm(term);
    const filtered = users
      .map((user) => ({
        ...user,
        role: user.role === "SUBSCRIBER" ? "USER" : user.role,
      }))
      .filter((user) => user.name.toLowerCase().includes(term.toLowerCase()));
    setFilteredUsers(filtered);
  };

  const handleAddCompany = async (newCompany: Company) => {
    try {
      addCompany({
        ...newCompany,
        id: Date.now(),
      });

      const response = await fetch("/api/companies", {
        method: "POST",
        body: JSON.stringify(newCompany),
      });

      if (!response.ok) throw new Error("Failed to add organization");
      toast.success("Organization added successfully");
      setIsCompanyFormOpen(false);
    } catch {
      toast.error("Failed to add organization");
      initializeData();
    }
  };
  const handleViewCompany = (companyId: string) => {
    navigate(`/companies/${companyId}`);
  };

  const handleEditCompany = async (updatedCompany: any) => {
    try {
      updateCompany(updatedCompany);

      const response = await fetch(`/api/companies/${updatedCompany.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedCompany),
      });

      if (!response.ok) throw new Error("Failed to update organization");
      toast.success("Company updated successfully");
    } catch {
      toast.error("Failed to update organization");
      initializeData();
    }
  };

  const handleAddUser = async (newUser: any) => {
    try {
      // Ensure role is properly formatted for display (though this should already be handled in form)
      const formattedUser = {
        ...newUser,
        id: Date.now(),
        role: formatRoleForDisplay(newUser.role),
      };

      addUser(formattedUser);

      // Prepare user data for API
      const apiUser = {
        ...newUser,
        // Keep original role format for API if needed
      };

      const response = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(apiUser),
      });

      if (!response.ok) throw new Error("Failed to add user");
      toast.success("User added successfully");
      setIsUserFormOpen(false);
    } catch {
      toast.error("Failed to add user");
      initializeData();
    }
  };

  const handleEditUser = async (updatedUser: any) => {
    try {
      // Update UI with display-formatted role
      updateUser(updatedUser, updatedUser.id);

      // Prepare user data for API
      const apiUser = {
        ...updatedUser,
        // Original role format preserved for API if needed
      };

      const response = await fetch(`/api/users/${updatedUser.id}`, {
        method: "PUT",
        body: JSON.stringify(apiUser),
      });

      if (!response.ok) throw new Error("Failed to update user");
      toast.success("User updated successfully");
    } catch {
      toast.error("Failed to update user");
      initializeData();
    }
  };

  const companyHeaders = [
    "Organization",
    "Users",
    "Address",
    "Billing Contact",
    "Billing Email",
    "Start Date",
    "Renewal Date",
    "Tier",
  ];

  const userHeaders = [
    "Name",
    "Organization",
    "Email",
    "Phone Number",
    "Role",
    "Start Date",
    "Assigned Insurance Plans",
  ];

  const [isCompanyEditing] = useState(false);
  const [isUserEditing] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [companyColumnsPopupOpen, setCompanyColumnsPopupOpen] = useState(false);
  const [visibleCompanyColumns, setVisibleCompanyColumns] =
    useState(companyHeaders);
  const [userColumnsPopupOpen, setUserColumnsPopupOpen] = useState(false);
  const [visibleUserColumns, setVisibleUserColumns] = useState(userHeaders);

  interface ColumnChangeHandler {
    (newVisibleColumns: string[]): void;
  }

  const handleCompanyColumnChange: ColumnChangeHandler = (
    newVisibleColumns
  ) => {
    setVisibleCompanyColumns(newVisibleColumns);
    setCompanyColumnsPopupOpen(false);
  };

  interface ColumnChangeHandler {
    (newVisibleColumns: string[]): void;
  }

  const handleUserColumnChange: ColumnChangeHandler = (newVisibleColumns) => {
    setVisibleUserColumns(newVisibleColumns);
    setUserColumnsPopupOpen(false);
  };

  // Custom empty state message with styled "Add" text
  const EmptyStateMessage = ({ type }) => (
    <div className="flex items-center justify-center p-8 text-gray-500">
      Click the <span className="px-1 font-medium text-[#1E4477]">Add New</span>{" "}
      button to add a new {type} to manage!
    </div>
  );

  return (
    <div className="scrollbar-none h-screen overflow-y-auto">
      <DashboardLayout
        heading="Admin Console"
        tag={role ? role.toUpperCase().replace("_", " ") : null}
        className="font-roboto text-[28px] leading-[36px] text-[#1E4477]"
      >
        <div className="scrollbar-none mt-3 flex flex-col gap-3 overflow-auto pr-2 pb-6">
          <DashboardCards />

          {isSuperAdmin && (
            <div className="rounded-xl border border-[#D8DADC] bg-white p-2 sm:p-3">
              <div>
                <ModuleHeader
                  label={
                    <span style={{ fontSize: "22px", color: "#1E4477" }}>
                      {`Organization ${isCompanyEditing ? "(Editing)" : ""}`}
                    </span>
                  }
                  callbackOnAdd={() => setIsCompanyFormOpen(true)}
                  callbackOnEdit={() => setCompanyColumnsPopupOpen(true)}
                  className="text-xs"
                />
                <div className="pt-2 sm:pt-3">
                  <DashboardSearch
                    value={companySearchTerm}
                    onChange={(e) => handleCompanySearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                {filteredCompanies.length > 0 ? (
                  <TableWithColumnVisibility
                    nodes={filteredCompanies}
                    allHeaders={companyHeaders}
                    visibleColumns={visibleCompanyColumns}
                    type="organization"
                    itemsPerPage={3}
                    className="gap-1 text-xs"
                    onViewClick={handleViewCompany}
                    isEditing={isCompanyEditing}
                    onEdit={handleEditCompany}
                  />
                ) : (
                  <EmptyStateMessage type="Organization" />
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-[#D8DADC] bg-white p-2 shadow-md sm:p-3">
            <div>
              <ModuleHeader
                label={
                  <span style={{ fontSize: "22px", color: "#1E4477" }}>
                    {`Users ${isUserEditing ? "(Editing)" : ""}`}
                  </span>
                }
                callbackOnEdit={() => setUserColumnsPopupOpen(true)}
                callbackOnAddUser={() => setIsUserFormOpen(true)}
                className="text-xs"
              />
              <div className="pt-2 sm:pt-3">
                <DashboardSearch
                  value={userSearchTerm}
                  onChange={(e) => handleUserSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              {filteredUsers.length > 0 ? (
                <TableWithColumnVisibility
                  nodes={filteredUsers}
                  allHeaders={userHeaders}
                  visibleColumns={visibleUserColumns}
                  type="user"
                  itemsPerPage={3}
                  className="gap-1 text-xs"
                  isEditing={isUserEditing}
                  onEdit={handleEditUser}
                />
              ) : (
                <EmptyStateMessage type="User" />
              )}
            </div>
          </div>
        </div>

        {isCompanyFormOpen && isSuperAdmin && (
          <CompanyForm 
           mode={"create"}
            onClose={() => setIsCompanyFormOpen(false)}
            />

          // <AddCompanyForm
          //   onClose={() => setIsCompanyFormOpen(false)}
          //   onSubmit={handleAddCompany}
          // />
        )}

        {isUserFormOpen && (
          <UserForm
            mode="create"
            onClose={() => setIsUserFormOpen(false)} />
          // <AddUserForm
          //   onClose={() => setIsUserFormOpen(false)}
          //   onSubmit={handleAddUser}
          // />
        )}
        <CustomColumnVisibilityPopup
          isOpen={companyColumnsPopupOpen}
          onClose={() => setCompanyColumnsPopupOpen(false)}
          columns={companyHeaders}
          visibleColumns={visibleCompanyColumns}
          onVisibilityChange={handleCompanyColumnChange}
          title="Edit Company Columns"
        />
        <UserColumnVisibilityPopup
          isOpen={userColumnsPopupOpen}
          onClose={() => setUserColumnsPopupOpen(false)}
          columns={userHeaders}
          visibleColumns={visibleUserColumns}
          onVisibilityChange={handleUserColumnChange}
          title="Edit User Columns"
        />
      </DashboardLayout>
    </div>
  );
};

export default Dashboard;
