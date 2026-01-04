import { useState, useEffect } from "react";
import SidebarNavLink from "./SidebarNavLink";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import { ActivePageType } from "../../../types/ActivePageType";
import { LuLayoutDashboard } from "react-icons/lu";
import { useLocation } from "react-router-dom";
import { useUserRole } from "../../../context/UserRoleContext";
import BuildingsIcon from "../../../assets/Buildings";
import InsuranceIcon from "../../../assets/Insurance";
import UserIcon from "../../../assets/Users";
import RequestIcon from "../../../assets/requests";
import SubscriptionIcon from "../../../assets/subscription";
import { useDashboard } from "../../../context/DashboardContext";

type Props = {
  isDashboardOpen: boolean;
  toggleDashboard: () => void;
  isCollapsed: boolean;
  setActivePage: (page: ActivePageType) => void;
};

const SidebarTopButtons = ({
  isDashboardOpen,
  toggleDashboard,
  isCollapsed,
  setActivePage,
}: Props) => {
  const location = useLocation();
  const { role } = useUserRole();
  const isSuperAdmin = role === "super_admin";
  const [pendingCount, setPendingCount] = useState(0);
  const { loadPendingRequests } = useDashboard();
  // Check if current path starts with /dashboard to handle all dashboard routes
  const isDashboardActive = location.pathname.startsWith("/dashboard");

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await loadPendingRequests();
        setPendingCount(response.total);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };
    fetchPendingCount();

    // Then set up the interval
    // const intervalId = setInterval(fetchPendingCount, 10000); // Check every 10 seconds

    // // Cleanup function
    // return () => clearInterval(intervalId);
  }, []);

  return (
    <ul className="space-y-2">
      {/* Dashboard */}
      <li>
        <div
          onClick={toggleDashboard}
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "px-2"
          } cursor-pointer gap-2 rounded-lg py-2 ${
            isDashboardActive ? "bg-[#E8F3FF]" : "hover:bg-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <LuLayoutDashboard
              className={
                isDashboardActive ? "text-[#1E4477]" : "text-[#919191]"
              }
            />
            {!isCollapsed && (
              <span
                className="text-[14px]"
                style={{
                  color: isDashboardActive ? "#1E4477" : "#919191",
                  lineHeight: "20px",
                }}
              >
                Dashboard
              </span>
            )}
          </div>
          {!isCollapsed && (
            <div className="ml-auto">
              {isDashboardOpen ? (
                <RiArrowUpSLine
                  className={`h-4 w-4 ${isDashboardActive ? "text-[#1E4477]" : "text-[#919191]"}`}
                />
              ) : (
                <RiArrowDownSLine
                  className={`h-4 w-4 ${isDashboardActive ? "text-[#1E4477]" : "text-[#919191]"}`}
                />
              )}
            </div>
          )}
        </div>
      </li>
      <li>
        {isDashboardOpen && (
          <ul
            className={`flex w-full flex-col space-y-2 ${isCollapsed ? "justify-start pl-0" : "justify-center pl-4"}`}
          >
            {isSuperAdmin && (
              <li>
                <SidebarNavLink
                  id="companies"
                  isCollapsed={isCollapsed}
                  to="/companies"
                  icon={() => (
                    <BuildingsIcon
                      className={`h-4 w-4 ${isCollapsed ? "mx-auto" : ""}`}
                      isActive={
                        location.pathname.startsWith("/companies")
                      }
                    />
                  )}
                  label="Organizations"
                  setActivePage={setActivePage}
                />
              </li>
            )}
            <li>
              <SidebarNavLink
                id="users"
                isCollapsed={isCollapsed}
                to="/users"
                icon={() => (
                  <UserIcon
                    className={`h-4 w-4 ${isCollapsed ? "mx-auto" : ""}`}
                    isActive={location.pathname === "/dashboard/users"}
                  />
                )}
                label="Users"
                setActivePage={setActivePage}
              />
            </li>
            <li>
              <SidebarNavLink
                id="requests"
                isCollapsed={isCollapsed}
                to="/requests"
                icon={() => (
                  <RequestIcon
                    className={`h-4 w-4 ${isCollapsed ? "mx-auto" : ""}`}
                    isActive={location.pathname === "/dashboard/requests"}
                  />
                )}
                label="Requests"
                setActivePage={setActivePage}
                badgeCount={pendingCount}
              />
            </li>
          </ul>
        )}
      </li>

      {/* Insurance Plans */}
      <li>
        <SidebarNavLink
          id="insurance-plans"
          isCollapsed={isCollapsed}
          to="/insurance-plans"
          icon={() => (
            <InsuranceIcon
              className={`h-4 w-4 ${isCollapsed ? "mx-auto" : ""}`}
              isActive={location.pathname.startsWith("/insurance-plans")}
            />
          )}
          label="Insurance Plans"
          setActivePage={setActivePage}
        />
      </li>
      <li>
        <SidebarNavLink
          id="manage-subscription"
          isCollapsed={isCollapsed}
          to="/manage-subscription"
          icon={() => (
            <SubscriptionIcon
              className={`h-4 w-4 ${isCollapsed ? "mx-auto" : ""}`}
              isActive={location.pathname.startsWith("/manage-subscription")}
            />
          )}
          label="Manage subscription"
          setActivePage={setActivePage}
        />
      </li>
    </ul>
  );
};

export default SidebarTopButtons;
