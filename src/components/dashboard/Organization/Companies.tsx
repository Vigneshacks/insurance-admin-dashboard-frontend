import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardSubHeader from "../../layouts/DashboardSubHeader";
import DashboardSearch from "../../layouts/DashboardSearch";
import Tables from "../../tables/Tables";
import DashboardTable from "../../layouts/DashboardTable";
import { toast } from "react-toastify";
import { Company } from "../../../types/dashboard.types";
import BuildingCard from "../../../assets/DashboardcardIcons/BuildingCards";
import { useDashboard } from "../../../context/DashboardContext";
import CompanyForm from "../forms/organizationModuleForm/organizationForm";


const Companies = () => {
  const navigate = useNavigate();
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddCompanyFormVisible, setIsAddCompanyFormVisible] = useState(false);
  // Flag to prevent infinite loop
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Use the dashboard context for companies data and loading state
  const {
    companies,
    loading,
    loadCompanies,
    refreshCompanies
  } = useDashboard();

  // Format date to MM/DD/YY
  const formatDateToMMDDYY = (dateString: string): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const year = date.getFullYear().toString().slice(-2);

      return `${month}/${day}/${year}`;
    } catch (error) {
      return "";
    }
  };

  // Updated headers
  const headers = [
    "Organization",
    "Users",
    "Address",
    "Billing Contact",
    "Billing Email",
    "Start Date",
    "Renewal Date",
    "Tier",
  ];


  useEffect(() => {
    // Only load companies once when the component mounts
    if (!initialLoadDone && !loading) {
      loadCompanies();
      setInitialLoadDone(true);
    }
  }, [loading, loadCompanies, initialLoadDone]);


  useEffect(() => {
    const formatCompanyDates = companies.map(company => ({
      ...company,
      startdate: formatDateToMMDDYY(company.startdate),
      renewaldate: formatDateToMMDDYY(company.renewaldate || ""),
    }));

    if (searchTerm) {
      const termLower = searchTerm.toLowerCase();
      const filtered = formatCompanyDates.filter(
        (organization) =>
          organization.organization.toLowerCase().includes(termLower) ||
          organization.billingcontact.toLowerCase().includes(termLower) ||
          organization.billingemail.toLowerCase().includes(termLower)
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(formatCompanyDates);
    }
  }, [companies, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleAddNew = () => {
    setIsAddCompanyFormVisible(true);
  };

  const handleCloseAddCompanyForm = () => {
    setIsAddCompanyFormVisible(false);
  };

  const handleSubmitAddCompanyForm = async (formData: any) => {
    console.log(formData);
    setIsAddCompanyFormVisible(false);

    try {

      const newCompany = {
        ...formData,
        id: Date.now().toString(),
        startdate: formData.start_date || "",
        renewaldate: formData.renewal_date || "",

      };

      setFilteredCompanies(prev => [...prev, newCompany]);

      toast.success("Company added successfully");
    } catch (error) {
      console.error("Error adding company:", error);
      toast.error("Failed to add company");


      await refreshCompanies();
    }
  };

  const handleViewCompany = (companyId: string) => {
    navigate(`/companies/${companyId}`);
  };

  const itemsPerPage = 10;

  return (
    <DashboardLayout
      heading="Admin Dashboard / Organizations"
      tag="SUPER ADMIN"
      className="font-roboto text-[28px] leading-[36px] text-[#1E4477]"
    >
      <div className="mt-5 h-full overflow-hidden rounded-xl bg-white">
        <div className="flex h-full flex-col pt-[10px] pr-[30px] pb-[50px] pl-[25px]">
          <DashboardSubHeader
            Icon={BuildingCard}
            label={`${filteredCompanies.length} Organizations`}
            callBackOnAdd={handleAddNew}
          />
          <DashboardSearch
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <DashboardTable>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                Loading organizations...
              </div>
            ) : filteredCompanies.length === 0 && !searchTerm ? (
              <div className="flex items-center justify-center p-8 text-center">
                <p className="text-lg text-gray-600">
                  You don't have any organizations yet. Click the{" "}
                  <span
                    className="cursor-pointer font-medium text-blue-950"
                    onClick={handleAddNew}
                  >
                    Add New
                  </span>{" "}
                  button to add a new Organization to manage!
                </p>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-gray-500">
                No Organizations found for "{searchTerm}"
              </div>
            ) : (
              <Tables
                nodes={filteredCompanies}
                headers={headers}
                type="organization"
                itemsPerPage={itemsPerPage}
                className="text-xs"
                onViewClick={handleViewCompany}
                paginationClassName={`fixed rounded-lg bottom-1 left-170 right-130 py-4 flex justify-center z-100 ${filteredCompanies.length > itemsPerPage ? "block" : "hidden"
                  }`}
              />
            )}
          </DashboardTable>
        </div>
      </div>
      {isAddCompanyFormVisible && (
        <CompanyForm
          mode={"create"}
          onClose={handleCloseAddCompanyForm}
        />
      )}
    </DashboardLayout>
  );
};

export default Companies;