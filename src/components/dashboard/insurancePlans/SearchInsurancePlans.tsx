import { useState, useEffect } from "react";
import DashboardSearch from "../../layouts/DashboardSearch";
import Tables from "../../tables/Tables";
import { toast } from "react-toastify";
import { fetchInsuranceSystems, importInsuranceSystem } from "../../../api/services/insuranceServices/insuranceService";
// import { fetchInsuranceSystems, importInsuranceSystem } from "../../../services/axios"; 


type InsuranceSystemType = {
  id: string;
  planname: string;
  provider: string | null;
  plantype: string;
  carrierassociation: string;
  metallevel: string;
  network: string | null; 
  category: string | null; 
  codes: string | null; 
};

// Custom Checkbox component using Tailwind
const CustomCheckbox = ({ 
  checked, 
  onChange 
}: { 
  checked: boolean; 
  onChange: () => void 
}) => (
  <div className="relative">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="appearance-none w-4 h-4 border-[1.5px] border-[#D8DADC] rounded cursor-pointer relative bg-white checked:bg-[#18D9B3] checked:border-[#18D9B3] focus:outline-none focus:ring-2 focus:ring-[#18D9B3] focus:ring-opacity-30"
    />
    {checked && (
      <div className="pointer-events-none absolute top-[2px] left-[5px] w-[4px] h-[8px] border-r-2 border-b-2 border-white transform rotate-45" />
    )}
  </div>
);

// Header component
const Header = () => (
  <div className="flex items-center gap-2.5 self-stretch pt-[1.5625rem] pr-[1.5625rem] pb-[1.5625rem] pl-[1.5625rem] bg-[#1e4477] text-white text-center font-['var(--Title-Large-Font, Roboto)'] text-[var(--Title-Large-Size, 22px)] leading-[var(--Title-Large-Line-Height, 28px)]">
    Add Insurance Plan
  </div>
);

// Import Button component
const ImportButton = ({ count, onClick }: { count: number; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex justify-center items-center gap-2 py-2 px-6 bg-[#1e4477] rounded-md text-white text-center font-['var(--Label-Large-Font, Roboto)'] text-[var(--Label-Large-Size, 14px)] font-medium leading-[var(--Label-Large-Line-Height, 20px)]"
  >
    Import {count} plan(s)
  </button>
);

const InsuranceSystems = () => {
  const [insuranceSystems, setInsuranceSystems] = useState<InsuranceSystemType[]>([]);
  const [filteredSystems, setFilteredSystems] = useState<InsuranceSystemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  // Define headers for the Tables component
  const headers = [
    "Plan Name",
    "Provider",
    "Carrier Association",
    "Plan Type",
    "Metal Level",
    "Network",
    "Category",
    "Codes",
  ];

  useEffect(() => {
    const initializeData = async () => {
      try {
        const response = await fetchInsuranceSystems();
        
        // Extract data safely
        const data = response.result || [];
        
        // Map API response to match the format expected by Tables component
        const formattedData = data.map((item: any) => ({
          id: item.id || `temp-${Math.random()}`,
          planname: item.plan_name || "--",
          provider: item.provider || "--",
          plantype: item.plan_type || "--",
          carrierassociation: "Business Health Trust",
          metallevel: "Gold",
          network: "--", 
          category: "--", 
          codes: "--", 
        }));
        
        setInsuranceSystems(formattedData);
        setFilteredSystems(formattedData);
      } catch (error) {
        console.error('Error fetching insurance systems:', error);
        toast.error("Failed to load insurance systems");
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = insuranceSystems.filter(
      (system) =>
        system.planname.toLowerCase().includes(term.toLowerCase()) || 
        (system.provider && system.provider.toLowerCase().includes(term.toLowerCase()))
    );
    setFilteredSystems(filtered);
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleImport = async () => {
    if (selectedRows.length === 0) return;
    
    setImporting(true);
    try {
      await importInsuranceSystem(selectedRows);
      toast.success(`Successfully imported ${selectedRows.length} plan(s)`);
      setSelectedRows([]);
      // Optionally refresh the data after import
    } catch (error) {
      toast.error("Failed to import insurance plans");
      console.error("Import error:", error);
    } finally {
      setImporting(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await fetchInsuranceSystems();
      const data = response.result || [];
      
      const formattedData = data.map((item: any) => ({
        id: item.id || `temp-${Math.random()}`,
        planname: item.plan_name || "--",
        provider: item.provider || "--",
        plantype: item.plan_type || "--",
        carrierassociation: "Business Health Trust",
        metallevel: "Gold",
        network: "--", 
        category: "--", 
        codes: "--", 
      }));
      
      setInsuranceSystems(formattedData);
      setFilteredSystems(formattedData);
    } catch (error) {
      console.error('Error refreshing insurance systems:', error);
    } finally {
      setLoading(false);
    }
  };

  const itemsPerPage = 10;

  // Don't render Tables component if we don't have data
  const hasData = filteredSystems.length > 0;
  
  // Determine if pagination should be shown
  const showPagination = filteredSystems.length > itemsPerPage;

  return (
    <div className="scrollbar-none relative h-screen mb-4 overflow-y-auto">
      {/* Header */}
      <Header />
      
      {/* 20px space after header */}
      <div className="h-5"></div>
      
      {/* Instruction text - outside and above container */}
      <div 
        className="mx-8 mb-2.5 text-[#334155] font-['Roboto'] text-[14px] font-normal leading-[20px] tracking-[0.25px]"
      >
        Search for insurance plans that are already in Decipher and select the one(s) you want to import.
      </div>
      
      {/* Main container with 30px margin left/right */}
      <div 
        className="mx-8 mb-16 flex flex-col p-4 gap-4 items-start self-stretch rounded-lg border border-[#D8DADC] bg-white"
      >
        <div className="w-full flex items-center gap-4">
          <div className={`${selectedRows.length > 0 ? 'flex-1' : 'w-full'}`}>
            <DashboardSearch
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search systems..."
            />
          </div>
          
          {selectedRows.length > 0 && (
            <ImportButton 
              count={selectedRows.length} 
              onClick={handleImport} 
            />
          )}
        </div>
        
        {loading ? (
          <div className="py-4 text-center w-full">Loading...</div>
        ) : !hasData ? (
          <div className="py-4 text-center w-full">No data available</div>
        ) : (
          <Tables
            nodes={filteredSystems}
            headers={headers}
            itemsPerPage={itemsPerPage}
            className="mt-4 w-full"
            type="insurance"
            paginationClassName={showPagination ? 
              "fixed rounded-lg bottom-1 left-74 right-10 py-4 shadow-md flex justify-center z-10" : 
              "hidden"}
            onRowSelect={handleRowSelect}
            selectedRows={selectedRows}
            onDataUpdate={refreshData}
            renderCheckbox={(checked, onChange) => (
              <CustomCheckbox checked={checked} onChange={onChange} />
            )}
          />
        )}
      </div>
    </div>
  );
};

export default InsuranceSystems;