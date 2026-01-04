import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import DashboardSubHeader from "../../layouts/DashboardSubHeader";
import DashboardSearch from "../../layouts/DashboardSearch";
import Tables from "../../tables/Tables";
import DashboardTable from "../../layouts/DashboardTable";
import { PiBuildingsLight } from "react-icons/pi";
import { fetchCompanies } from "../../../services/axios";
import { toast } from "react-toastify";
import AddCompanyForm from "../forms/AddCompanyForm";
import { Company } from "../../../types/dashboard.types";
import BuildingCard from "../../../assets/cards/BuildingCards";

const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddCompanyFormVisible, setIsAddCompanyFormVisible] = useState(false);

  // Updated headers to include all columns
  const headers = [
    "Organization",
    "Users",
    "Address",
    "Billing Contact",
    "Billing Email",
    "Start Date",
    "Renewal Date",
    "Tier"
  ];

  // Function to generate random date within a range
  const getRandomDate = (start: Date, end: Date) => {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  };

  // Fetch companies data
  useEffect(() => {
    const getCompanies = async () => {
      try {
        const data = await fetchCompanies();
        const formattedCompanies = data.map((organization) => {
          // Generate random dates for demonstration
          const startDate = getRandomDate(
            new Date(2023, 0, 1),
            new Date(2023, 11, 31)
          );
          const endDate = getRandomDate(startDate, new Date(2024, 11, 31));

          return {
            id: organization.id,
            organization: organization.org_name,
            users: organization.employee_count,
            address: organization.org_address,
            billingcontact: organization.billing_contact_name,
            billingemail: organization.billing_contact_email,
            startdate: new Date(organization.start_date),
            enddate: endDate,
            tier: 'Professional'
          };
        });
        setCompanies(formattedCompanies);
        setFilteredCompanies(formattedCompanies);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast.error("Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    };

    getCompanies();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = companies.filter(
      (organization) =>
        organization.organization.toLowerCase().includes(term.toLowerCase()) ||
        organization.billingcontact
          .toLowerCase()
          .includes(term.toLowerCase()) ||
        organization.billingemail.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCompanies(filtered);
  };
  const handleAddNew = () => {
    setIsAddCompanyFormVisible(true); // Show the AddCompanyForm when the button is clicked
  };

  const handleCloseAddCompanyForm = () => {
    setIsAddCompanyFormVisible(false); // Hide the AddCompanyForm when the form is closed
  };

  const handleSubmitAddCompanyForm = (formData: any) => {
    // Handle form submission logic
    console.log(formData);
    setIsAddCompanyFormVisible(false); // Hide the AddCompanyForm after submission
    // Optionally, refresh the companies data
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
      {/* Add a wrapper div with relative positioning */}
      <div className="bg-white rounded-xl mt-5 h-full overflow-hidden">
        <div className="pt-[10px] pr-[30px] pb-[50px] pl-[25px] h-full flex flex-col"> {/* Add padding bottom to account for fixed pagination */}
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
              Loading organization...
            </div>
          ) : filteredCompanies.length > 0 ? (
            <Tables
              nodes={filteredCompanies}
              headers={headers}
              type="organization"
              itemsPerPage={itemsPerPage}
              className="text-xs"
              onViewClick={handleViewCompany}
              paginationClassName={`fixed rounded-lg bottom-1 left-170 right-130 py-4  flex justify-center z-100 ${
                filteredCompanies.length > itemsPerPage ? 'block' : 'hidden'
              }`} // Add this new prop
            />
          ) : (
            <div className="flex items-center justify-center p-8 text-gray-500">
              No Organizations found for "{searchTerm}"
            </div>
          )}
        </DashboardTable>
      </div>
      </div>
      {isAddCompanyFormVisible && (
        <AddCompanyForm
          onClose={handleCloseAddCompanyForm}
          onSubmit={handleSubmitAddCompanyForm}
        />
      )}
    </DashboardLayout>
  );
};

export default Companies;
