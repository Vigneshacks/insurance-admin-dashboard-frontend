import { AxiosError } from "axios";
import apiClient from "../../config/axios";

interface ApiErrorResponse {
  detail?: string;
  message: string;
}

// Define a type for admin objects
export interface CompanyAdmin {
  email: string;
  role?: string;
  status?: string;
}

export type CompanyApiType = {
  org_name: string;
  org_address: string;
  billing_contact_name: string;
  billing_contact_email: string;
  id: string;
  employee_count: number;
  admins: CompanyAdmin[] | string[];  // Supports both formats
  benefit_plans: any[];  // Using any[] for benefit plans as the structure varies
  start_date: string;
  renewal_date: string;
};

export type CompanyAddProps = {
  org_name: string;
  org_address: string;
  billing_contact_name: string;
  billing_contact_email: string;
  start_date: string;
  admin_emails: string[];
  benefit_plan_ids: string[];
};

export interface CompanyUpdateData {
  org_name?: string;
  org_address?: string;
  billing_contact_name?: string;
  billing_contact_email?: string;
  benefit_plan_ids?: string[];
  start_date?: string; 
  admin_emails?: string[];
}

// Base API endpoint of organizationService
const BASE_URL = "/api/admin/organization";

// Fetch Companies with pagination
export const fetchCompanies = async (
  skipCount: number,
  orderBy?: string,
  direction?: string
) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/`, {
      params: {
        skip: skipCount,
        limit: 10,
        ...(orderBy && { order_by: orderBy }),
        ...(direction && { direction }),
      },
    });
    return response.data.result as CompanyApiType[];
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch organizations"
    );
  }
};

export const fetchCompanyDetails = async (id: string) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error){
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch organization details"
    );
  }
};

export const createCompany = async (
  companyData: CompanyAddProps
): Promise<CompanyAddProps> => {
  try {
    const response = await apiClient.post(
      `${BASE_URL}/`,
      companyData
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to create organization"
    );
  }
};

export const updateCompanyDetails = async (id: string, data: CompanyUpdateData) => {
  try {
    // If the data contains admin objects, extract only the emails
    if (data.admin_emails && Array.isArray(data.admin_emails)) {
      const processedAdmins = data.admin_emails.map(admin => {
        if (typeof admin === 'string') {
          return admin;
        } else if (typeof admin === 'object' && admin !== null && 'email' in admin) {
          return admin.email;
        }
        return null;
      }).filter(Boolean) as string[];
      
      data.admin_emails = processedAdmins;
    }
    
    const response = await apiClient.patch(`${BASE_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
        "Failed to update organization details"
    );
  }
};

export const deleteOrganization = async (
  id: number | string
): Promise<void> => {
  try {
    await apiClient.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to delete organization"
    );
  }
};