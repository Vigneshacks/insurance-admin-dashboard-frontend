import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import RequestPageNavbar from "./components/RequestPageNavbar";
import PendingRequests from "./components/PendingRequests";
import AllRequests from "./components/AllRequests";
import { useUserRole } from "../../../context/UserRoleContext";
import { fetchPendingRequests } from "../../../services/axios";
import { useDashboard } from "../../../context/DashboardContext";


export type SubPagesType = "pending" | "all";

const Requests = () => {
  const [currentlyActive, setCurrentlyActive] = useState<SubPagesType>("pending");
  const { role } = useUserRole();
  const [pendingCount, setPendingCount] = useState(0);
  const { loadPendingRequests } = useDashboard();

  const updatePendingCount = async () => {
    try {
      const response = await loadPendingRequests();
      setPendingCount(response.total);
    } catch (error) {
      console.error("Error fetching pending count:", error);
    }
  };
  useEffect(() => {
    updatePendingCount();
  }, []);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await loadPendingRequests();
        setPendingCount(response.total);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };

    // Execute initial fetch immediately
    fetchPendingCount();
    
    // Then set up the interval
    // const intervalId = setInterval(fetchPendingCount, 3000);
    
    // // Cleanup function
    // return () => clearInterval(intervalId);
  }, []);

  const subPages = [
    {
      id: "pending" as SubPagesType,
      label: `Pending Requests (${pendingCount})`,
    },
    {
      id: "all" as SubPagesType,
      label: "All Requests",
    },
  ];

  return (
    <DashboardLayout
      heading="Admin Dashboard / Requests"
      tag={role ? role.toUpperCase().replace("_", " ") : "LOADING"}
      className="font-roboto text-[28px] leading-[36px] text-[#1E4477]"
    >
      <div className="bg-white rounded-xl h-full overflow-hidden">
      <div className="pt-[20px] pr-[30px] pb-[50px] pl-[25px] h-full flex flex-col">
      <RequestPageNavbar
        subPages={subPages}
        currentlyActive={currentlyActive}
        setCurrentlyActive={setCurrentlyActive}
      />
      <div className="space-y-0">
        {currentlyActive === "pending" && <PendingRequests />}
        {currentlyActive === "all" && <AllRequests />}
      </div>
    </div>
    </div>
    </DashboardLayout>
    
  );
};

export default Requests;