import { useState, useEffect } from "react";
import DashboardSearch from "../../../layouts/DashboardSearch";
import Tables from "../../../tables/Tables";
import DashboardTable from "../../../layouts/DashboardTable";
import { updateRequestStatus } from "../../../../services/axios";
import UserProfile from "../../forms/ViewRequestedUser";
import { useDashboard } from "../../../../context/DashboardContext";
import { toast } from "react-toastify";

interface RequestedUser {
  first_name?: string;
  last_name?: string;
  email?: string;
  work_email?: string;
  phone?: string;
  id?: string;
}

interface MemberGroupMaster {
  org_name?: string;
  org_address?: string;
  billing_contact_name?: string;
  billing_contact_email?: string;
  id?: string;
}

interface Request {
  id: string;
  status: string;
  created_at: string;
  requested_user?: RequestedUser;
  member_group_master?: MemberGroupMaster;
  note?: string | null;
  updated_at?: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const PendingRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { loadPendingRequests, updateEmployeeRequestStatus } = useDashboard();

  const headers = [
    "Requested Users",
    "Requests",
    "Organization",
    "Request Date",
    "Actions"
  ];

  const loadRequests = async (term?: string) => {
    try {
      setIsLoading(true);
      const data = await loadPendingRequests(term);
      if (data && data.result) {
        setRequests(data.result);
      } else {
        console.error("Invalid data structure returned:", data);
        setRequests([]);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // Uncomment this to enable auto-refresh
    // const intervalId = setInterval(() => loadRequests(searchTerm), 30000);
    // return () => clearInterval(intervalId);
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    loadRequests(term);
  };

  const handleViewUser = (id: string) => {
    setSelectedRequestId(id);
  };

  const handleCloseUserProfile = () => {
    setSelectedRequestId(null);
  };

  const handleUpdateRequest = async (id: string, status: "ACCEPTED" | "DENIED") => {
    try {
      setIsUpdating(true);

      // Optimistically update the UI by removing the request from the list
      setRequests(prevRequests => prevRequests.filter(request => request.id !== id));

      // Close the profile if it's the currently viewed request
      if (selectedRequestId === id) {
        setSelectedRequestId(null);
      }

      // Now make the actual API call
      await updateEmployeeRequestStatus(id, status);
      toast.success(`Request ${status.toLowerCase()} successfully`);

      // No need to reload the full list since we've already updated the UI
      // Just ensure the background state is updated by reloading in the background
      loadPendingRequests(searchTerm, true); // Force refresh the context data

    } catch (error) {
      console.error(`Error ${status.toLowerCase()} request:`, error);
      toast.error(`Failed to ${status.toLowerCase()} request`);

      // If there was an error, reload the requests to restore the correct state
      loadRequests(searchTerm);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApprove = async (id: string) => {
    await handleUpdateRequest(id, "ACCEPTED");
  };

  const handleDeny = async (id: string) => {
    await handleUpdateRequest(id, "DENIED");
  };

  // In PendingRequests.tsx 
  const transformedNodes = requests.map((request: Request) => {
    return {
      id: request.id,
      originalId: request.id,
      requestedusers: request.requested_user ?
        `${request.requested_user.first_name || ''} ${request.requested_user.last_name || ''}`.trim() :
        'N/A',
      requests: "Access Request",
      organization: request.member_group_master?.org_name || 'N/A',
      requestdate: request.created_at ? formatDate(request.created_at) : 'N/A',
      actions: (
        <div className="flex items-center gap-1 mr-6">
          <button
            onClick={() => handleApprove(request.id)}
            disabled={isUpdating}
            className={`button flex flex-shrink-0 items-center py-0.5 px-1.5 h-6 rounded-[0.3125rem] bg-[#1e4477] text-white font-medium text-xs ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Approve
          </button>
          <button
            onClick={() => handleDeny(request.id)}
            disabled={isUpdating}
            className={`button-1 flex flex-shrink-0 items-center py-0.5 px-1.5 h-6 rounded-[0.3125rem] border border-[#1e4477] bg-white text-[#1e4477] font-medium text-xs ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Deny
          </button>
        </div>
      )
    };
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  const itemsPerPage = 9;

  return (
    <div className="space-y-0">
      <DashboardSearch
        callBackOnSearch={handleSearch}
        placeholder="Search users"
      />

      {transformedNodes.length > 0 ? (
        <DashboardTable>
          <Tables
            nodes={transformedNodes}
            headers={headers}
            itemsPerPage={itemsPerPage}
            type="pending"
            onViewClick={handleViewUser}
            onApprove={handleApprove}
            onDeny={handleDeny}
            selectedRows={[]}
            paginationClassName={`fixed rounded-lg bottom-1 left-170 right-130 py-4 flex justify-center z-100 ${transformedNodes.length > itemsPerPage ? 'block' : 'hidden'
              }`}
          />
        </DashboardTable>
      ) : (
        <div className="flex items-center justify-center p-8 text-gray-500">
          You don't have any requests to review.
        </div>
      )}

      {selectedRequestId && (
        <UserProfile
          requestId={selectedRequestId}
          onClose={handleCloseUserProfile}
          onApprove={() => handleApprove(selectedRequestId)}
        />
      )}
    </div>
  );
};

export default PendingRequests;