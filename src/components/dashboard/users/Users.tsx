import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardSubHeader from "../../layouts/DashboardSubHeader";
import DashboardSearch from "../../layouts/DashboardSearch";
import DashboardTable from "../../layouts/DashboardTable";
import Tables from "../../tables/Tables";
import { fetchUsers, updateUserDetails } from "../../../services/axios";
import { toast } from "react-toastify";
import AddUserForm from "../forms/adduserform/AddUserForm";
import { useUserRole } from "../../../context/UserRoleContext";
import UserCard from "../../../assets/DashboardcardIcons/UserCard";

import { formatRoleForDisplay } from "../../../context/DashboardContext";

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const { role } = useUserRole();

  const headers = [
    "Name",
    "Organization",
    "Email",
    "Phone Number",
    "Role",
    "Start Date",
    "Assigned Insurance Plans",
  ];

  const truncatePlanName = (planName: string) => {
    if (!planName) return "No plans";
    const words = planName.split(" ");
    return words.slice(0, 2).join(" ");
  };

  // Function to format date to MM/DD/YY
  const formatDateToMMDDYY = (dateString: string): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) return "";

      // Format as MM/DD/YY
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const year = date.getFullYear().toString().slice(-2);

      return `${month}/${day}/${year}`;
    } catch (error) {
      // Return empty string if any error occurs
      return "";
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();

      // Add extensive logging for debugging
      console.log("Raw user data:", data);

      const formattedUsers = data.map((user: any) => {
        const insurancePlans = user.benefit_plan
          ? user.benefit_plan.map((plan: any) =>
              truncatePlanName(plan.plan_name)
            )
          : [];

        console.log("Formatted insurance plans:", insurancePlans);

        return {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          organization: user.member_group?.org_name || "N/A",
          email: user.email,
          phonenumber: user.phone || "--",
          role: formatRoleForDisplay(
            user.role === "subscriber" ? "user" : user.role
          ),
          startdate: formatDateToMMDDYY(user.start_date), // Format start date as MM/DD/YY
          assignedinsuranceplans: insurancePlans, // Note the change to match table header
          originalRole: user.role,
          member_group_id: user.member_group?.id || "",
          first_name: user.first_name,
          last_name: user.last_name,
          work_email: user.email,
          benefit_plan: user.benefit_plan, // Keep original benefit plan data
          // Store original date for API calls
          original_start_date: user.start_date,
        };
      });

      console.log("Formatted users:", formattedUsers);

      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = users.filter((user) =>
      Object.values(user).some((value) =>
        value?.toString().toLowerCase().includes(term.toLowerCase())
      )
    );
    setFilteredUsers(filtered);
  };

  const handleAddUser = () => {
    setShowAddUserForm(true);
  };

  const handleCloseAddUser = () => {
    setShowAddUserForm(false);
    fetchUserData(); // Refresh after adding a user
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) {
        toast.error("User not found");
        return;
      }

      const isCurrentlyAdmin = currentRole.toLowerCase() === "admin";
      const newRole = isCurrentlyAdmin ? "user" : "admin";
      const apiRole = newRole === "user" ? "subscriber" : "admin"; // Convert to API-expected format

      const updateData = {
        role: apiRole,
        first_name: user.first_name,
        last_name: user.last_name,
        work_email: user.email,
        phone: user.phonenumber || "", // Ensure phone is included if required
        member_group_id: user.member_group_id || "",
        start_date: user.original_start_date, // Use original date format for API
        benefit_plan_ids: user.benefit_plan
          ? user.benefit_plan.map((plan: any) => plan.id)
          : [],
      };

      await updateUserDetails(userId, updateData);
      toast.success(
        isCurrentlyAdmin
          ? "User has been demoted from admin"
          : "User has been promoted to admin"
      );
      fetchUserData(); // Refresh table data
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const itemsPerPage = 10;

  return (
    <DashboardLayout
      heading="Admin Dashboard / Users"
      tag={role ? role.toUpperCase().replace("_", " ") : "LOADING"}
      className="font-roboto text-[28px] leading-[36px] text-[#1E4477]"
    >
      <div className="h-full overflow-hidden rounded-xl bg-white">
        <div className="flex h-full flex-col pt-[20px] pr-[30px] pb-[50px] pl-[25px]">
          <DashboardSubHeader
            Icon={UserCard}
            label={`${filteredUsers.length} Users`}
            callBackOnAdd={handleAddUser}
          />
          <DashboardSearch
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <DashboardTable>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 && !searchTerm ? (
              <div className="flex items-center justify-center p-8 text-center">
                <p className="text-lg text-gray-600">
                  You don't have any users yet. Click the{" "}
                  <span
                    className="cursor-pointer font-medium text-blue-950"
                    onClick={handleAddUser}
                  >
                    Add New
                  </span>{" "}
                  button to add a new User to manage!
                </p>
              </div>
            ) : (
              <Tables
                nodes={filteredUsers}
                headers={headers}
                type="user"
                itemsPerPage={itemsPerPage}
                className="text-xs"
                paginationClassName={`fixed rounded-lg bottom-1 left-170 right-130 py-4  flex justify-center z-100 ${
                  filteredUsers.length > itemsPerPage ? "block" : "hidden"
                }`}
                showRoleToggle={true}
                onToggleRole={handleToggleRole}
                onDataUpdate={fetchUserData}
              />
            )}
          </DashboardTable>
        </div>
      </div>
      {showAddUserForm && <AddUserForm onClose={handleCloseAddUser} />}
    </DashboardLayout>
  );
};

export default Users;
