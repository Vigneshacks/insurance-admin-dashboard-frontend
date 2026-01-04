import { useState, useEffect } from "react";
import DashboardCard from "./DashboardCard";
import {
  fetchCompanies,
  fetchUsers,
  fetchPendingRequests,
} from "../../../../services/axios";
import { toast } from "react-toastify";
import BuildingCard from "../../../../assets/DashboardcardIcons/BuildingCards";
import UserCard from "../../../../assets/DashboardcardIcons/UserCard";
import RequestCard from "../../../../assets/DashboardcardIcons/RequestCard";
import { useUserRole } from "../../../../context/UserRoleContext";

const DashboardCards = () => {
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const { role } = useUserRole();

  const isSuperAdmin = role?.toLowerCase() === "super_admin";

  useEffect(() => {
    const getCounts = async () => {
      try {
        // First two API calls remain the same
        const companiesPromise = isSuperAdmin
          ? fetchCompanies()
          : Promise.resolve([]);
        const usersPromise = fetchUsers();

        // For requests, we need to handle the specific response format
        const requestsPromise = fetchPendingRequests().then((response) => {
          // Check if response has the expected structure
          if (response && typeof response.total === "number") {
            return response.total;
          } else {
            // Fallback if the structure is different
            return response?.result?.length || 0;
          }
        });

        const [companiesData, usersData, requestsTotal] = await Promise.all([
          companiesPromise,
          usersPromise,
          requestsPromise,
        ]);

        setTotalCompanies(companiesData.length);
        setTotalUsers(usersData.length);
        setTotalRequests(requestsTotal);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to fetch data");
        setLoading(false);
      }
    };

    getCounts();
  }, [isSuperAdmin]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {isSuperAdmin && (
        <DashboardCard
          Icon={BuildingCard}
          label="Total Organizations"
          value={totalCompanies.toString()}
          link="/companies"
        />
      )}
      <DashboardCard
        Icon={UserCard}
        label="Total Users"
        value={totalUsers.toString()}
        link="/users"
      />

      <DashboardCard
        Icon={RequestCard}
        label="Pending Requests"
        value={totalRequests.toString()}
        link="/requests"
      />
    </div>
  );
};

export default DashboardCards;
