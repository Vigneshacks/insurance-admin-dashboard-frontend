import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardSubHeader from "../../layouts/DashboardSubHeader";
import DashboardSearch from "../../layouts/DashboardSearch";
import Tables from "../../tables/Tables";
import { toast } from "react-toastify";
import { useUserRole } from "../../../context/UserRoleContext";
import InsurancePlanModal from "../../popups/InsuranceAdd";
import { useDashboard } from "../../../context/DashboardContext";
import DocumentIcon from "../../../assets/DashboardcardIcons/document";

type InsurancePlanType = {
  id: string;
  planname: string;
  provider: string;
  preset: string;
  plantype: string;
  startdate: string;
  activeorganizations: number;
  notes: string;
};

const InsurancePlans = () => {
  const [allPlans, setAllPlans] = useState<InsurancePlanType[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<InsurancePlanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { role } = useUserRole();

  // Get data from context
  const {
    insurancePlans: contextPlans,
    insuranceFetchLoading,
    loadInsurancePlans,
  } = useDashboard();

  // Add this for debugging
  console.log("Context plans:", contextPlans);
  console.log("Loading state:", loading);
  console.log("Context loading state:", insuranceFetchLoading);

  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const headers = [
    "Plan Name",
    "Provider",
    "Preset",
    "Plan Type",
    "Start Date",
    "Active Organizations",
    "Notes",
  ];

  // Helper function to format date
  const formatDate = (isoDate: string) => {
    if (!isoDate) return "--";
    const date = new Date(isoDate);
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}/${date.getFullYear().toString().slice(2)}`;
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Explicitly load insurance plans from context
        await loadInsurancePlans();

        // After loading is complete, format the data
        if (contextPlans && contextPlans.length > 0) {
          console.log("Formatting plans:", contextPlans);

          // Map API response to the format expected by your component
          const formattedData = contextPlans.map((item: any) => ({
            id: item.id,
            planname: item.plan_name,
            provider: item.provider || "--",
            preset: item.plan_type
              ? item.plan_type.toLowerCase() === "standard"
                ? "Standard Plan"
                : item.plan_type.toLowerCase() === "custom"
                  ? "Custom Plan"
                  : item.plan_type
              : "--",
            plantype: item.coverage_type || "--",
            startdate: formatDate(item.benefit_effective_start_dt),
            activeorganizations: item.active_organizations || 0,
            notes: item.notes || "--",
          }));

          console.log("Formatted data:", formattedData);
          setAllPlans(formattedData);
          setFilteredPlans(formattedData);
        } else {
          console.log("No plans found in context");
          setFilteredPlans([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to fetch insurance plans");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [contextPlans, loadInsurancePlans]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      // If search term is empty, reset to the full list
      setFilteredPlans(allPlans);
    } else {
      // Filter from the complete list, not the already filtered list
      const filtered = allPlans.filter(
        (plan) =>
          plan.planname.toLowerCase().includes(term.toLowerCase()) ||
          plan.provider.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredPlans(filtered);
    }
  };

  // Make sure this function is defined
  const handleAddNew = () => {
    setIsModalOpen(true);
  };

  // Calculate the number of items that can fit in the visible area
  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (!containerRef.current || !tableRef.current) return;

      // Get the available height for the table
      const containerHeight = containerRef.current.clientHeight;
      const headerHeight = 150; // Approximate height for headers, search, etc.
      const availableHeight = containerHeight - headerHeight;

      // Get the height of a single row (we'll use the table header as a reference)
      const tableHeaderHeight = 40; // Approximate height of a table row

      // Calculate how many rows can fit
      const rowsThatFit = Math.floor(availableHeight / tableHeaderHeight);

      // Set a minimum of 5 items per page
      setItemsPerPage(Math.max(5, rowsThatFit));
    };

    // Calculate initially
    calculateItemsPerPage();

    // Recalculate when window is resized
    const handleResize = () => {
      calculateItemsPerPage();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [loading]);

  return (
    <div
      ref={containerRef}
      className="scrollbar-none relative mb-4 h-screen overflow-y-auto"
    >
      <DashboardLayout
        heading="Insurance Plans"
        tag={role ? role.toUpperCase().replace("_", " ") : "LOADING"}
        className="font-roboto text-[28px] leading-[36px] text-[#1E4477]"
      >
        <div className="mt-5 h-full overflow-hidden rounded-xl bg-white">
          <div
            ref={tableRef}
            className="flex h-full flex-col pt-[10px] pr-[30px] pb-[50px] pl-[25px] text-[#1E4477]"
          >
            <DashboardSubHeader
              Icon={DocumentIcon}
              label={`${filteredPlans.length} Insurance Plans`}
              callBackOnAdd={handleAddNew}
            />
            <div className="pt-2">
              <DashboardSearch
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search plans..."
              />
            </div>
            {loading ? (
              <div className="py-4 text-center">Loading...</div>
            ) : filteredPlans.length === 0 ? (
              <div className="py-4 text-center">No insurance plans found</div>
            ) : (
              <Tables
                nodes={filteredPlans}
                headers={headers}
                itemsPerPage={itemsPerPage}
                className="mt-4"
                type="insurance"
                paginationClassName={`fixed rounded-lg bottom-1 left-170 right-130 py-4  flex justify-center z-100 ${
                  filteredPlans.length > itemsPerPage ? "block" : "hidden"
                }`}
              />
            )}
          </div>
        </div>
      </DashboardLayout>
      <InsurancePlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          // Refresh insurance plans when modal closes
          loadInsurancePlans(undefined, undefined, undefined, true);
        }}
      />
    </div>
  );
};

export default InsurancePlans;
