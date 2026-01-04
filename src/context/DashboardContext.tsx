import React, { createContext, useContext, useState, useCallback } from "react";
import {
  CompanyApiType
} from "../services/axios";
import { createInsurance, fetchInsurance, updateInsurance, deleteInsurance } from "../api/services/insuranceServices/insuranceService";
import { fetchCompanies, updateCompanyDetails, deleteOrganization } from "../api/services/dashboardServices/organizationService";
import { fetchUsers, updateUserDetails, deleteUser } from "../api/services/dashboardServices/userService";
import { fetchEmployeeRequests, fetchPendingRequests, updateRequestStatus } from "../api/services/dashboardServices/requestService";
import { toast } from "react-toastify";
import {
  Company,
  DashboardContextType,
  User,
  UserApiResponse,
  InsuranceFormData,
  InsurancePlan,
  EmployeeRequest,
} from "../types/dashboard.types";

const DashboardContext = createContext<DashboardContextType | null>(null);

const formatRoleForDisplay = (apiRole: string): string =>{
  return apiRole === "subscriber" ? "user" : apiRole;
};

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  const [insuranceFetchLoading, setInsuranceFetchLoading] = useState(false);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [userSortState, setUserSortState] = useState<{
    key: string;
    ascending: boolean;
  }>({
    key: "",
    ascending: true,
  });

  const [companySortState, setCompanySortState] = useState<{
    key: string;
    ascending: boolean;
  }>({
    key: "",
    ascending: true,
  });
  const [insuranceSortState, setInsuranceSortState] = useState<{
    key: string;
    ascending: boolean;
  }>({
    key: "",
    ascending: true,
  });

  const [employeeRequests, setEmployeeRequests] = useState<EmployeeRequest[]>(
    []
  );
  const [pendingRequests, setPendingRequests] = useState<EmployeeRequest[]>([]);
  const [employeeRequestsLoading, setEmployeeRequestsLoading] = useState(false);

  const loadCompanies = useCallback(
    async (forceRefresh = false) => {
      if (loading || (companies.length > 0 && !forceRefresh && !companySortState.key)) {
        return;
      }

      setLoading(true);
      console.log("Loading companies...test");
      try {
        // Map UI field name to API field name
        const fieldMapping: Record<string, string> = {
          organization: "org_name",
          users: "employee_count",
          address: "org_address",
          billingcontact: "billing_contact_name",
          billingemail: "billing_contact_email",
          startdate: "start_date",
          // Add other mappings as needed
        };

        const orderBy = companySortState.key
          ? fieldMapping[companySortState.key] || companySortState.key
          : undefined;
        const direction = companySortState.key
          ? companySortState.ascending
            ? "asc"
            : "desc"
          : undefined;

        const data = (await fetchCompanies(
          orderBy,
          direction
        )) as CompanyApiType[];
        const formattedCompanies: Company[] = data.map((organization) => ({
          id: organization.id,
          organization: organization.org_name,
          users: organization.employee_count,
          address: organization.org_address,
          billingcontact: organization.billing_contact_name,
          billingemail: organization.billing_contact_email,
          startdate: organization.start_date || "",
          renewaldate: organization.renewal_date || "",
          tier: "Professional",
        }));
        setCompanies(formattedCompanies);
      } catch {
        toast.error("Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    },
    [loading, companies.length, companySortState]
  );

  const loadUsers = useCallback(
    async (forceRefresh = false) => {
      if (users.length > 0 && !forceRefresh && !userSortState.key) return;

      setUsersLoading(true);
      try {
        // Map UI field name to API field name
        const fieldMapping: Record<string, string> = {
          name: "first_name",
          organization: "org_name",
          email: "work_email",
          phonenumber: "phone",
          role: "role",
          startdate: "start_date",
          assignedInsurancePlans: "benefit_plan",
        };

        const orderBy = userSortState.key
          ? fieldMapping[userSortState.key] || userSortState.key
          : undefined;
        const direction = userSortState.key
          ? userSortState.ascending
            ? "asc"
            : "desc"
          : undefined;

        const data = (await fetchUsers(
          orderBy,
          direction
        )) as UserApiResponse[];
        const formattedUsers: User[] = data.map((user) => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name || ""}`.trim(),
          organization: user.member_group.org_name,
          email: user.work_email || user.email,
          phonenumber: user.phone,
          role: formatRoleForDisplay(user.role),
          startdate: user.start_date,
          assignedInsurancePlans:
            user.benefit_plan && user.benefit_plan.length > 0
              ? user.benefit_plan.map((plan) => {
                // Split the plan name and take first two words
                const words = plan.plan_name.split(" ");
                return words.slice(0, 2).join(" ");
              })
              : [],
        }));
        setUsers(formattedUsers);
      } catch {
        toast.error("Failed to fetch users");
      } finally {
        setUsersLoading(false);
      }
    },
    [users.length, userSortState]
  );
  const loadInsurancePlans = useCallback(
    async (
      searchTerm?: string,
      direction?: string,
      organizationId?: string,
      forceRefresh = false
    ) => {
      // Added debug logs
      console.log("loadInsurancePlans called with forceRefresh:", forceRefresh);
      console.log("Current insurancePlans:", insurancePlans);

      if (
        insurancePlans.length > 0 &&
        !forceRefresh &&
        !insuranceSortState.key &&
        !searchTerm &&
        !organizationId
      ) {
        console.log("Using cached insurance plans data");
        return insurancePlans; // Return the existing plans
      }

      console.log("Fetching new insurance plans data");
      setInsuranceFetchLoading(true);
      try {
        const data = await fetchInsurance(
          searchTerm,
          direction ||
          (insuranceSortState.key
            ? insuranceSortState.ascending
              ? "asc"
              : "desc"
            : undefined),
          organizationId
        );
        console.log("Fetched insurance data:", data);
        setInsurancePlans(data);
        return data;
      } catch (error) {
        console.error("Failed to fetch insurance plans:", error);
        toast.error("Failed to fetch insurance plans");
        return [];
      } finally {
        setInsuranceFetchLoading(false);
      }
    },
    [insurancePlans.length, insuranceSortState]
  );

  const updateCompanySort = useCallback((key: string, ascending: boolean) => {
    setCompanySortState({ key, ascending });
  }, []);

  const updateUserSort = useCallback((key: string, ascending: boolean) => {
    setUserSortState({ key, ascending });
  }, []);

  const updateInsuranceSort = useCallback((key: string, ascending: boolean) => {
    setInsuranceSortState({ key, ascending });
  }, []);


  const refreshCompanies = useCallback(async () => {
    console.log("Starting refreshCompanies");
    setLoading(true);
    try {
      console.log("Fetching companies data...");
      const data = await fetchCompanies();
      console.log("Received companies data:", data);

      const formattedCompanies: Company[] = data.map((organization) => ({
        id: organization.id,
        organization: organization.org_name,
        users: organization.employee_count,
        address: organization.org_address,
        billingcontact: organization.billing_contact_name,
        billingemail: organization.billing_contact_email,
        startdate: organization.start_date || "",
        renewaldate: organization.renewal_date || "",
        tier: "Professional",
      }));

      console.log("Setting companies state with formatted data");
      setCompanies([...formattedCompanies]);
      return formattedCompanies;
    } catch (error) {
      console.error("Error in refreshCompanies:", error);
      toast.error("Failed to fetch companies");
      throw error;
    } finally {
      setLoading(false);
      console.log("Completed refreshCompanies");
    }
  }, []);


  const updateCompany = useCallback(
    async (companyId: string | number, formData: any) => {
      setLoading(true);
      try {
        const updateData = {
          org_name: formData.org_name,
          org_address: formData.org_address,
          billing_contact_name: formData.billing_contact_name,
          billing_contact_email: formData.billing_contact_email,
          start_date: formData.start_date,
          admin_emails: Array.isArray(formData.admin_emails) ? formData.admin_emails : [],
          benefit_plan_ids:
            formData.benefit_plan_ids ||
            (formData.benefit_plans
              ? formData.benefit_plans.map((plan: any) => plan.id)
              : []),
        };

        const updatedCompanyData = await updateCompanyDetails(
          companyId.toString(),
          updateData
        );

        setCompanies((prevCompanies) => {
          return prevCompanies.map((company) => {
            if (company.id === companyId) {
              // Create updated company with new values
              return {
                ...company,
                organization: formData.org_name,
                address: formData.org_address,
                billingcontact: formData.billing_contact_name,
                billingemail: formData.billing_contact_email,
                startdate: formData.start_date || "",
              };
            }
            return company;
          });
        });

        // Refresh companies data from the server


        toast.success("Organization details updated successfully");
        return updatedCompanyData;
      } catch (error) {
        console.error("Error updating company:", error);
        toast.error("Failed to update organization details");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadCompanies]
  );

  const addCompany = useCallback((newCompany: Company) => {
    setCompanies((prevCompanies) => [...prevCompanies, newCompany]);
  }, []);

  //update user part
  const updateUser = useCallback(
    async (userId: string, userData: any) => {
      try {
        // Call the API to update user details
        const updatedUserData = await updateUserDetails(userId, userData);

        // Reload users to ensure we have the most up-to-date data
        await loadUsers(true);

        toast.success("User updated successfully");

        // Optionally return the updated user data if needed
        return updatedUserData;
      } catch (error) {
        console.error("Error updating user:", error);
        toast.error("Failed to update user");
        throw error;
      }
    },
    [loadUsers]
  );

  const addUser = useCallback((newUser: User) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  }, []);

  const deleteCompany = useCallback(async (companyId: string | number) => {
    try {
      // Call API to delete company
      await deleteOrganization(companyId);

      // Update local state
      setCompanies((prevCompanies) =>
        prevCompanies.filter((organization) => organization.id !== companyId)
      );

      toast.success("Organization deleted successfully");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete organization");
      throw error;
    }
  }, []);

  const deleteUserFromContext = useCallback(async (userId: string | number) => {
    try {
      // Call API to delete user
      await deleteUser(userId.toString());

      // Update local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  }, []);

  const refreshInsurancePlans = useCallback(async () => {
    setInsuranceFetchLoading(true);
    try {
      const data = await fetchInsurance();
      setInsurancePlans([...data]); // Force a new array reference to ensure React detects the change
      return data;
    } catch (error) {
      toast.error("Failed to fetch insurance plans");
      throw error;
    } finally {
      setInsuranceFetchLoading(false);
    }
  }, []);

  // Create insurance plan
  const createInsurancePlan = useCallback(
    async (formData: InsuranceFormData) => {
      setInsuranceLoading(true);
      try {
        const response = await createInsurance(formData);
        // Immediately refresh plans and await the result
        const updatedPlans = await refreshInsurancePlans();
        toast.success("Insurance plan created successfully");
        return { response, updatedPlans };
      } catch (error: any) {
        toast.error(error.message || "Failed to create insurance plan");
        throw error;
      } finally {
        setInsuranceLoading(false);
      }
    },
    [refreshInsurancePlans]
  );

  const updateInsurancePlan = useCallback(
    async (insuranceId: string, formData: InsuranceFormData) => {
      setInsuranceLoading(true);
      try {
        const response = await updateInsurance(insuranceId, formData);
        // Refresh insurance plans to get updated data
        await refreshInsurancePlans();
        toast.success("Insurance plan updated successfully");
        return response;
      } catch (error: any) {
        toast.error(error.message || "Failed to update insurance plan");
        throw error;
      } finally {
        setInsuranceLoading(false);
      }
    },
    [refreshInsurancePlans]
  );

  const deleteInsurancePlan = useCallback(async (insuranceId: string) => {
    setInsuranceLoading(true);
    try {
      await deleteInsurance(insuranceId);
      // Update local state
      setInsurancePlans((prevPlans) =>
        prevPlans.filter((plan) => plan.id !== insuranceId)
      );
      toast.success("Insurance plan deleted successfully");
    } catch (error: any) {
      console.error("Error deleting insurance plan:", error);
      toast.error(error.message || "Failed to delete insurance plan");
      throw error;
    } finally {
      setInsuranceLoading(false);
    }
  }, []);

  //Request
  const loadEmployeeRequests = useCallback(
    async (searchTerm?: string, forceRefresh = false) => {
      if (employeeRequests.length > 0 && !forceRefresh && !searchTerm)
        return employeeRequests;

      setEmployeeRequestsLoading(true);
      try {
        const data = await fetchEmployeeRequests(searchTerm);
        setEmployeeRequests(data);
        return data;
      } catch (error) {
        toast.error("Failed to fetch employee requests");
        return [];
      } finally {
        setEmployeeRequestsLoading(false);
      }
    },
    [employeeRequests.length]
  );

  const loadPendingRequests = useCallback(
    async (searchTerm?: string, forceRefresh = false) => {
      if (pendingRequests.length > 0 && !forceRefresh && !searchTerm) {
        return { total: pendingRequests.length, result: pendingRequests };
      }

      setEmployeeRequestsLoading(true);
      try {
        const data = await fetchPendingRequests(searchTerm);
        setPendingRequests(data.result || []);
        return data; // Return the full data object with { total, result }
      } catch (error) {
        toast.error("Failed to fetch pending requests");
        return { total: 0, result: [] };
      } finally {
        setEmployeeRequestsLoading(false);
      }
    },
    [pendingRequests.length]
  );

  const updateEmployeeRequestStatus = useCallback(
    async (requestId: string, status: string) => {
      try {
        const response = await updateRequestStatus(requestId, status);

        // Fix: Check if prev is an array before calling map
        setEmployeeRequests((prev) => {
          if (!Array.isArray(prev)) {
            console.error("employeeRequests is not an array:", prev);
            return []; // Return empty array as fallback
          }
          return prev.map((request) =>
            request.id === requestId ? { ...request, status } : request
          );
        });

        // Also add safety check for pendingRequests
        setPendingRequests((prev) => {
          if (!Array.isArray(prev)) {
            console.error("pendingRequests is not an array:", prev);
            return []; // Return empty array as fallback
          }
          return prev.filter((request) => request.id !== requestId);
        });

        toast.success(`Request ${status.toLowerCase()} successfully`);
        return response;
      } catch (error) {
        toast.error(`Failed to update request status to ${status}`);
        throw error;
      }
    },
    []
  );

  const initializeData = useCallback(async () => {
    if (!dataInitialized && !loading) {
      setLoading(true);
      try {
        await Promise.all([
          loadCompanies(true),
          loadUsers(),
          loadInsurancePlans(),
          loadEmployeeRequests(),
          loadPendingRequests(),
        ]);
      } finally {
        setLoading(false);
        setDataInitialized(true);
      }
    }
  }, [
    dataInitialized,
    loading,
    loadCompanies,
    loadUsers,
    loadInsurancePlans,
    loadEmployeeRequests,
    loadPendingRequests,
  ]);

  // Update refresh data to include insurance plans
  const refreshData = async () => {
    await Promise.all([
      loadCompanies(true),
      loadUsers(true),
      loadInsurancePlans(undefined, undefined, undefined, true),
      loadEmployeeRequests(undefined, true),
      loadPendingRequests(undefined, true),
    ]);
  };

  const contextValue: DashboardContextType = {
    companies,
    users,
    loading,
    usersLoading,
    loadCompanies,
    loadUsers,
    initializeData,
    refreshData,
    updateCompany,
    addCompany,
    updateUser,
    addUser,
    deleteCompany,
    deleteUserFromContext,
    updateCompanySort,
    updateUserSort,
    companySortState,
    userSortState,
    refreshCompanies,
    insurancePlans,
    insuranceFetchLoading,
    insuranceLoading,
    loadInsurancePlans,
    refreshInsurancePlans,
    createInsurancePlan,
    updateInsurancePlan, // New function
    deleteInsurancePlan,
    updateInsuranceSort,
    insuranceSortState,
    employeeRequests,
    pendingRequests,
    employeeRequestsLoading,
    loadEmployeeRequests,
    loadPendingRequests,
    updateEmployeeRequestStatus,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

export { formatRoleForDisplay };
