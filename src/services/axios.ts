import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosHeaders,
  AxiosError,
} from "axios";
import { toast } from "react-toastify";
import { getToken } from "./tokenProvider"; // import the token getter

// Environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "30000");

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined in environment variables");
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

interface ApiErrorResponse {
  detail?: string;
  message: string;
}

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const { response } = error;
    if (response) {
      switch (response.status) {
        case 400:
          console.error("Bad Request:", response.data);
          break;
        case 401:
          console.error("Unauthorized:", response.data);
          toast.info("Session expired, please login again");
          window.location.href = "/";
          break;
        case 403:
          console.error("Forbidden:", response);
          break;
        case 404:
          console.error("Not Found:", response.data);
          break;
        case 409:
        case 422:
          toast.warn(response?.data?.detail || "Oops, something went wrong");
          break;
        case 500:
          console.error("Internal Server Error:", response.data);
          toast.error("Oops, something went wrong");
          break;
        case 502:
          console.error("Bad Gateway:", response.data);
          toast.error("Oops, something went wrong");
          break;
        default:
          console.error(`Error: ${response.status}`, response.data);
          toast.error("Oops, something went wrong");
      }
    } else {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Types
export type CompanyApiType = {
  org_name: string;
  org_address: string;
  billing_contact_name: string;
  billing_contact_email: string;
  id: string;
  employee_count: number;
  admins: string[];
  benefit_plans: string[];
  start_date: string;
  renewal_date: string;
};

export type CompanyAddProps = {
  companyName: string;
  address: string;
  billingContact: string;
  billingEmail: string;
  startDate: string;
  adminEmails: string[];
  benefitPlanIds: string[];
}

interface InsuranceResponse {
  id: string;
  plan_name: string;
  plan_grp: string;
  coverage_type: string;
  provider: string;
  benefit_effective_start_dt: string;
  active_organizations: number;
  notes: string;
  plan_type: string;
  file_url: string;
  file_name: string;
  organizations: {
    org_name: string;
    billing_contact_name: string;
    org_address: string;
    id: string;
  }[];
  // Optional convenience fields
  organizationNames?: string[];
  displayFileName?: string;
}

// Company-related endpoints
export const fetchCompanies = async (orderBy?: string, direction?: string) => {
  try {
    const response = await api.get("/api/admin/organization/", {
      params: { 
        skip: 0, 
        limit: 100,
        ...(orderBy && { order_by: orderBy }),
        ...(direction && { direction })
      }
    });
    return response.data.result as CompanyApiType[];
  } catch {
    throw new Error("Failed to fetch companies");
  }
};

export const fetchCompanyDetails = async (id: string) => {
  try {
    const response = await api.get(`/api/admin/organization/${id}`);
    return response.data;
  } catch {
    throw new Error("Failed to fetch organization details");
  }
};

export const createCompany = async (companyData: CompanyAddProps) => {
  try {
    const formattedData = {
      org_name: companyData.companyName,
      org_address: companyData.address,
      billing_contact_name: companyData.billingContact,
      billing_contact_email: companyData.billingEmail,
      start_date: companyData.startDate,
      admin_emails: companyData.adminEmails,
      benefit_plan_ids: companyData.benefitPlanIds,
    };

    const response = await api.post("/api/admin/organization/", formattedData);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to create organization"
    );
  }
};

export const updateCompanyDetails = async (id: string, data: any) => {
  try {
    const response = await api.patch(`/api/admin/organization/${id}`, data);
    return response.data;
  } catch {
    throw new Error("Failed to update organization details");
  }
};

export const deleteOrganization = async (id: string) => {
  try {
    const response = await api.delete(`/api/admin/organization/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(`Failed to delete organization: ${axiosError.response?.data?.message || axiosError.message}`);
  }
};

// Employee-related endpoints
export const fetchEmployees = async (orgId: string, skip = 0, limit = 100) => {
  try {
    const response = await api.get(
      `/api/admin/organization/${orgId}/employee`,
      {
        params: { skip, limit },
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(`Failed to fetch Employees: ${axiosError.response?.data?.message || axiosError.message}`);
  }
};

export const fetchEmployeeDetails = async (
  memberGroupMasterId: string,
  userId: string
) => {
  try {
    const response = await api.get(
      `/api/admin/organization/${memberGroupMasterId}/employee/${userId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(`Failed to fetch Employee Detilas: ${axiosError.response?.data?.message || axiosError.message}`);
  }
};

interface UpdateEmployeeData {
  first_name?: string;
  last_name?: string;
  work_email?: string;
  phone_number?: string;
  date_of_birth?: string;
  ssn_last4?: string;
  gender_assigned?: string;
  role?: string;
  benefit_plan_ids?: string[];
  start_date?: string;
}

export const updateEmployeeDetails = async (
  memberGroupMasterId: string,
  userId: string,
  updateData: UpdateEmployeeData
) => {
  try {
    const response = await api.patch(
      `/api/admin/organization/${memberGroupMasterId}/employee/${userId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating employee details:", error);
    throw error;
  }
};







export const fetchUsers = async (orderBy?: string, direction?: string) => {
  try {
    const response = await api.get("/api/admin/employee", {
      params: { 
        skip: 0, 
        limit: 100,
        ...(orderBy && { order_by: orderBy }),
        ...(direction && { direction })
      }
    });
    return response.data.result;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(`Failed to fetch users: ${axiosError.response?.data?.message || axiosError.message}`);
  }
};

export const fetchUserDetails = async (id: string) => {
  try {
    const response = await api.get(`/api/admin/employee/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(`Failed to fetch User Details: ${axiosError.response?.data?.message || axiosError.message}`);
  }
};

export const createUser = async (userData: any) => {
  try {
    const response = await api.post("/api/admin/employee", userData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create user");
  }
};

export const updateUserDetails = async (id: string, data: any) => {
  try {
    console.log(`Updating user ${id} with data:`, data);
    const response = await api.patch(`/api/admin/employee/${id}`, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(`Failed to update User Details: ${axiosError.response?.data?.message || axiosError.message}`);
  }
};


export const deleteUser = async (id: string) => {
  try {
    const response = await api.delete(`/api/admin/employee/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(`Failed to delete User: ${axiosError.response?.data?.message || axiosError.message}`);
  }
};

// Employee requests endpoints
export const fetchEmployeeRequests = async (searchTerm?: string) => {
  try {
    const response = await api.get("/api/admin/employee-request", {
      params: { 
        skip: 0, 
        limit: 100, 
        direction: "asc",
        ...(searchTerm && { search_term: searchTerm }) 
      }
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(`Failed to fetch Employee Requests: ${axiosError.response?.data?.message || axiosError.message}`);
  }
};
export const fetchPendingRequests = async (searchTerm?: string) => {
  try {
    const response = await api.get("/api/admin/employee-request", {
      params: { 
        skip: 0, 
        limit: 100, 
        request_status: "PENDING", 
        direction: "asc",
        ...(searchTerm && { search_term: searchTerm }) 
      }
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(`Failed to fetch Pending Requests: ${axiosError.response?.data?.message || axiosError.message}`);
  }
};

export const fetchEmployeeRequestDetails = async (id: string) => {
  try {
    const response = await api.get(`/api/admin/employee-request/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(`Failed to fetch employee request details: ${axiosError.response?.data?.message || axiosError.message}`);
  }
};

export const updateRequestStatus = async (id: string, status: string) => {
  try {
    const response = await api.patch(
      `/api/admin/employee-request/${id}`,
      { status }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating request status to ${status}:`, error);
    throw error;
  }
};

// User role endpoint
export const fetchUserRole = async () => {
  try {
    const response = await api.get("/api/users/me");
    return response.data.role;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(`Failed to fetch user role: ${axiosError.response?.data?.message || axiosError.message}`);
  }
};


export const fetchInsurance = async (
  searchTerm?: string, 
  direction?: string,
  organization_id?: string
) => {
  try {
    const response = await api.get("/api/admin/insurance", {
      params: { 
        skip: 0, 
        limit: 100, 
        ...(searchTerm && { search: searchTerm }),
        ...(direction && { direction }),
        ...(organization_id && { organization_id })
      }
    });
    
    return response.data.result;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(`Failed to insurance detilas: ${axiosError.response?.data?.message || axiosError.message}`);
  }
};

export interface InsuranceFormData {
  planName: string;
  planType: string;
  provider: string;
  startDate: string;
  notes: string;
  selectedOrganizations: Array<{
    id: string | number;
    text: string;
    effectiveStartDate?: string;
    effectiveEndDate?: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    file: File;
    uploadedDate: string;
  }>;
}

export const createInsurance = async (formData: InsuranceFormData) => {
  try {
    const requestData = new FormData();
    
    // Convert DD/MM/YY to YYYY-MM-DD format
    const convertDate = (dateStr: string): string => {
      if (!dateStr) return '';
      
      // Handle DD/MM/YY format
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        // Convert 2-digit year to 4-digit year
        let year = parts[2];
        if (year.length === 2) {
          // Assume 20xx for years less than 50, 19xx for years 50 and greater
          year = parseInt(year) < 50 ? `20${year}` : `19${year}`;
        }
        return `${year}-${month}-${day}`;
      }
      return dateStr; // Return original if not in expected format
    };
    
    // Add required fields
    requestData.append("plan_name", formData.planName);
    requestData.append("plan_type", formData.planType);
    requestData.append("provider", formData.provider);
    
    // Add optional fields if available
    if (formData.startDate) {
      requestData.append("start_date", convertDate(formData.startDate));
    }
    
    if (formData.notes) {
      requestData.append("notes", formData.notes);
    }
    
    
    
      requestData.append("file", formData.documents[0].file);
    
    
    // Only add member_group_master if there are selected organizations
    if (formData.selectedOrganizations && formData.selectedOrganizations.length > 0) {
      // Create member_group_master array
      const memberGroupMaster = formData.selectedOrganizations.map(org => {
        const groupData: any = {
          member_group_id: org.id.toString(),
          effective_start_date: org.effectiveStartDate ? 
            convertDate(org.effectiveStartDate) : 
            convertDate(formData.startDate)
        };
        
        // Only add effective_end_date if it has a value
        if (org.effectiveEndDate) {
          groupData.effective_end_date = convertDate(org.effectiveEndDate);
        }
        
        return groupData;
      });
      
      // Convert member_group_master array to JSON string and append to form data
      requestData.append("member_group_master", JSON.stringify(memberGroupMaster));
    }
    
    // Make the API request
    const response = await api.post("/api/admin/insurance", requestData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to create insurance plan"
    );
  }
};
export const fetchInsuranceById = async (id: string): Promise<InsuranceResponse> => {
  try {
    const response = await api.get(`/api/admin/insurance${id}`);
    const data = response.data;
    
    // Extract organization details with proper date formatting
    const organizations: {
      id: string;
      org_name: string;
      benefit_effective_start_dt: string;
      benefit_effective_end_dt?: string;
    }[] = data.organizations?.map((org: {
      id: string;
      org_name: string;
      benefit_effective_start_dt: string;
      benefit_effective_end_dt?: string;
    }) => ({
      id: org.id,
      org_name: org.org_name,
      benefit_effective_start_dt: org.benefit_effective_start_dt,
      benefit_effective_end_dt: org.benefit_effective_end_dt
    })) || [];
    
    // Return the full data with properly structured fields
    return {
      ...data,
      // Use coverage_type if available, otherwise use empty string
      coverage_type: data.coverage_type || "",
      // Use the direct file_name from the response
      file_name: data.file_name || "",
      organizations
    };
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch insurance details"
    );
  }
};

// Function to update insurance
export const updateInsurance = async (insurance_id: string, formData: InsuranceFormData) => {
  try {
    const requestData = new FormData();

    // Only add fields if they have values (non-empty)
    if (formData.planName) {
      requestData.append("plan_name", formData.planName);
    }
    
    if (formData.planType) {
      requestData.append("coverage_type", formData.planType);
    }
    
    if (formData.provider) {
      requestData.append("provider", formData.provider);
    }
    
    if (formData.startDate) {
      requestData.append("start_date", formData.startDate);
    }
    
    if (formData.notes) {
      requestData.append("notes", formData.notes);
    }

    // Add document file if available
    if (formData.documents?.length > 0) {
      const document = formData.documents[0];
      
      // Always append the filename if we have a document
      if (document.name) {
        requestData.append("filename", document.name);
        console.log("Adding filename to request:", document.name);
      }
      
      // Add the file if it exists
      if (document.file) {
        requestData.append("file", document.file);
        console.log("Adding file to request:", document.file.name);
      }
    }
    

    // Add member_group_master data as a single JSON array
    if (formData.selectedOrganizations?.length > 0) {
      const memberGroupArray = formData.selectedOrganizations.map((org) => {
        const memberGroupData: { member_group_id: string; effective_start_date: string; effective_end_date?: string } = {
          member_group_id: typeof org.id === "string" ? org.id : String(org.id),
          effective_start_date: org.effectiveStartDate || new Date().toISOString().split("T")[0]
        };
        
        // Only add end date if it exists
        if (org.effectiveEndDate && org.effectiveEndDate.trim() !== "") {
          memberGroupData.effective_end_date = org.effectiveEndDate;
        }
        
        return memberGroupData;
      });
      
      // Append the entire array as a single form field
      requestData.append("member_group_master", JSON.stringify(memberGroupArray));
    }

    // Create URL with the insurance_id in the path
    const url = `/api/admin/insurance${insurance_id}`;

    // Send the PATCH request
    const response = await api.patch(url, requestData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  } catch (error) {
    console.error("Error updating insurance:", error);
    throw error;
  }
};


export const deleteInsurance = async (id: string) => {
  try {
    const response = await api.delete(`/api/admin/insurance${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to delete insurance plan"
    );
  }
};


export const fetchCurrentUser = async () => {
  try {
    const response = await api.get(`/api/users/me`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error(
      (axiosError.response?.data as any)?.message || "Failed to fetch user data"
    );
  }
};


export const fetchInsuranceSystems = async (orderBy?: string, direction: string = "asc", searchTerm?: string) => {
  try {
    const response = await api.get("/api/admin/insurance/system", {
      params: { 
        skip: 0, 
        limit: 100,
        ...(orderBy && { order_by: orderBy }),
        direction,
        ...(searchTerm && { search_term: searchTerm })
      }
    });
    
    // Log the response for debugging
    console.log("Raw API response:", response);
    
    // Ensure we return the correct data structure
    if (response && response.data) {
      return response.data;
    } else {
      // If response is malformed, create a valid structure
      return {
        total: 0,
        result: []
      };
    }
  } catch (error) {
    console.error("API request failed:", error);
    throw new Error("Failed to fetch insurance systems");
  }
};
export const importInsuranceSystem = async (planIds: string[]) => {
  try {
    const response = await api.post("/api/admin/insurance/system/import", {
      plan_id: planIds,
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to import insurance system");
  }
};
// interface UpdateEmployeeData {
//   first_name: string;
//   last_name: string;
//   work_email: string;
//   phonnumber: string;
//   date_of_birth: string;
//   ssn_last4: string;
//   gender_assigned: string;
//   role: string;
//   benefit_plan_ids: string[];
//   start_date: string;
// }





export default api;