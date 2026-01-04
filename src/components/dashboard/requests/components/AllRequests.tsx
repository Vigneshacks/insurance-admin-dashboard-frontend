import { useState, useEffect } from "react";
import DashboardSearch from "../../../layouts/DashboardSearch";
import Tables from "../../../tables/Tables";
import DashboardTable from "../../../layouts/DashboardTable";
import { useDashboard } from "../../../../context/DashboardContext";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  
  // Format as MM/DD/YY
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(2);
  
  return `${month}/${day}/${year}`;
};

const AllRequests = () => {
  interface Request {
    id: string;
    requested_user?: {
      first_name?: string;
      last_name?: string;
    };
    approved_user?: {
      first_name?: string;
      last_name?: string;
    };
    member_group_master?: {
      org_name?: string;
    };
    created_at?: string;
    approved_date?: string;
    status?: string;
  }
  
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { loadEmployeeRequests } = useDashboard();

  const headers = [
    "Requested Users",
    "Requests",
    "Organization",
    "Request Date",
    "Approved By",
    "Approved Date"
  ];

  const loadRequests = async (term?: string) => {
    try {
      setIsLoading(true);
      const data = await loadEmployeeRequests(term);
      setRequests(data.result);
    } catch (error) {
      console.error("Error loading requests:", error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSearch = (term: string) => {
    setSearchQuery(term);
    loadRequests(term);
  };

  const transformedNodes = requests.map((request) => ({
    id: request.id,
    requestedusers: request.requested_user ? 
      `${request.requested_user.first_name || ''} ${request.requested_user.last_name || ''}`.trim() : 
      'N/A',
    requests: "Access Request",
    organization: request.member_group_master?.org_name || 'N/A',
    requestdate: request.created_at ? formatDate(request.created_at) : 'N/A',
    approvedby: request.approved_user ? 
      `${request.approved_user.first_name || ''} ${request.approved_user.last_name || ''}`.trim() : 
      'N/A',
    approveddate: request.approved_date ? formatDate(request.approved_date) : 'N/A'
  }));

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const itemsPerPage = 9;

  return (
    <div className="space-y-0">
      {requests.length > 0 && (
        <DashboardSearch 
          callBackOnSearch={handleSearch} 
          placeholder="Search "
        />
      )}
      
      {requests.length > 0 ? (
        <DashboardTable>
          <Tables
            nodes={transformedNodes}
            headers={headers}
            itemsPerPage={itemsPerPage}
            type="view-only"
            className="w-full"
            paginationClassName={`fixed rounded-lg bottom-1 left-170 right-130 py-4 flex justify-center z-100p ${
              transformedNodes.length > itemsPerPage ? 'block' : 'hidden'
            }`}
          />
        </DashboardTable>
      ) : (
        <div className="flex items-center justify-center p-8 text-gray-500">
          No requests found.
        </div>
      )}
    </div>
  );
};

export default AllRequests;