import { AxiosError } from "axios";
import apiClient from "../../config/axios";

interface ApiErrorResponse {
  detail?: string;
  message: string;
}

export interface InsuranceResponse {
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
    benefit_effective_start_dt?: string;
    benefit_effective_end_dt?: string;
  }[];
  organizationNames?: string[];
  displayFileName?: string;
  start_date: string;
}

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

export interface MemberGroupData {
  member_group_id: string;
  effective_start_date: string;
  effective_end_date?: string;
}

const BASE_URL = "/api/admin/insurance";

const convertDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    let year = parts[2];
    if (year.length === 2) {
      year = parseInt(year) < 50 ? `20${year}` : `19${year}`;
    }
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

export const fetchInsurance = async (
  searchTerm?: string, 
  direction?: string,
  organization_id?: string
) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/`, {
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
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch insurance details"
    );
  }
};

export const createInsurance = async (formData: InsuranceFormData) => {
  try {
    const requestData = new FormData();
    requestData.append("plan_name", formData.planName);
    requestData.append("plan_type", formData.planType);
    requestData.append("provider", formData.provider);
    
    if (formData.startDate) {
      requestData.append("start_date", convertDate(formData.startDate));
    }
    
    if (formData.notes) {
      requestData.append("notes", formData.notes);
    }
    
    // if (formData.documents && formData.documents.length > 0) {
    //   requestData.append("file", formData.documents[0].file);
    // }

    if (formData.documents?.length > 0) {
      const document = formData.documents[0];

      if (document.name) {
        requestData.append("filename", document.name);
      }

      if (document.file) {
        requestData.append("file", document.file);
      }
    }
    
    if (formData.selectedOrganizations && formData.selectedOrganizations.length > 0) {
      const memberGroupMaster = formData.selectedOrganizations.map(org => {
        const groupData: MemberGroupData = {
          member_group_id: org.id.toString(),
          effective_start_date: org.effectiveStartDate ? 
            convertDate(org.effectiveStartDate) : 
            convertDate(formData.startDate)
        };
        if (org.effectiveEndDate) {
          groupData.effective_end_date = convertDate(org.effectiveEndDate);
        }
        return groupData;
      });
      requestData.append("member_group_master", JSON.stringify(memberGroupMaster));
    }
    
    const response = await apiClient.post(BASE_URL, requestData, {
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
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    const data = response.data;
    const organizations = data.organizations?.map((org: {
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
    
    return {
      ...data,
      coverage_type: data.coverage_type || "",
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

export const updateInsurance = async (insurance_id: string, formData: InsuranceFormData) => {
  try {
    const requestData = new FormData();

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

    if (formData.documents?.length > 0) {
      const document = formData.documents[0];
      
      if (document.name) {
        requestData.append("filename", document.name);
      }
      
      if (document.file) {
        requestData.append("file", document.file);
      }
    }
    
    if (formData.selectedOrganizations?.length > 0) {
      const memberGroupArray = formData.selectedOrganizations.map((org) => {
        const memberGroupData: { 
          member_group_id: string; 
          effective_start_date: string; 
          effective_end_date?: string 
        } = {
          member_group_id: typeof org.id === "string" ? org.id : String(org.id),
          effective_start_date: org.effectiveStartDate || new Date().toISOString().split("T")[0]
        };
        
        if (org.effectiveEndDate && org.effectiveEndDate.trim() !== "") {
          memberGroupData.effective_end_date = org.effectiveEndDate;
        }
        
        return memberGroupData;
      });
      
      requestData.append("member_group_master", JSON.stringify(memberGroupArray));
    }

    const response = await apiClient.patch(`${BASE_URL}/${insurance_id}`, requestData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to update insurance plan"
    );
  }
};

export const deleteInsurance = async (id: string) => {
  try {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to delete insurance plan"
    );
  }
};

export const fetchInsuranceSystems = async (
  orderBy?: string, 
  direction: string = "asc", 
  searchTerm?: string
) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/system`, {
      params: { 
        skip: 0, 
        limit: 100,
        ...(orderBy && { order_by: orderBy }),
        direction,
        ...(searchTerm && { search_term: searchTerm })
      }
    });
    
    if (response && response.data) {
      return response.data;
    } else {
      return {
        total: 0,
        result: []
      };
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch insurance systems"
    );
  }
};

export const importInsuranceSystem = async (planIds: string[]) => {
  try {
    const response = await apiClient.post(`${BASE_URL}/system/import`, {
      plan_id: planIds,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to import insurance system"
    );
  }
};