import { AxiosError } from "axios";
import apiClient from "../../config/axios";

export interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  member_group_id?: string;
  organization_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: string;
  benefit_plan_ids: string[];
  start_date: string; 
  date_of_birth: string; 
  ssn_last4: string;  
  member_group_id: string;
}

export interface UserUpdateData {
  first_name?: string;
  last_name?: string;
  work_email?: string;
  phone?: string;
  date_of_birth?: string; 
  ssn_last4?: string;
  role?: string; 
  benefit_plan_ids?: string[];
  start_date?: string;
  member_group_id?: string;
}

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

interface ApiErrorResponse {
  detail?: string;
  message: string;
}

// API endpoint of user/employee services

const BASE_URL = "/api/admin/organization";
const EMPLOYEE_BASE_URL = "/api/admin/employee";

export const fetchEmployees = async (
  orgId: string,
  skipCount: number,
  orderBy?: string,
  direction?: string
) => {
  try {
    const response = await apiClient.get(`${BASE_URL}/${orgId}/employee`, {
      params: {
        skip: skipCount,
        limit: 10,
        ...(orderBy && { order_by: orderBy }),
        ...(direction && { direction }),
      },
    });
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch Employees"
    );
  }
};

export const fetchEmployeeDetails = async (
  memberGroupMasterId: string,
  userId: string
) => {
  try {
    const response = await apiClient.get(
      `${BASE_URL}/${memberGroupMasterId}/employee/${userId}`
    );
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch Employee details"
    );
  }
};

export const updateEmployeeDetails = async (
  memberGroupMasterId: string,
  userId: string,
  updateData: UpdateEmployeeData
) => {
  try {
    const response = await apiClient.patch(
      `${BASE_URL}/${memberGroupMasterId}/employee/${userId}`,
      updateData
    );
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to update Employee details"
    );
  }
};

export const fetchUsers = async (
  skipCount: number,
  orderBy?: string,
  direction?: string
) => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_BASE_URL}`, {
      params: {
        skip: skipCount,
        limit: 10,
        ...(orderBy && { order_by: orderBy }),
        ...(direction && { direction }),
      },
    });
    return response?.data?.result;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch Users"
    );
  }
};

export const fetchUserDetails = async (id: string) => {
  try {
    const response = await apiClient.get(`${EMPLOYEE_BASE_URL}/${id}`);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch User details"
    );
  }
};

export const createUser = async (
  userData: CreateUserData 
) => {
  try {
    const response = await apiClient.post(`${EMPLOYEE_BASE_URL}`, userData);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to Create User"
    );
  }
};

export const updateUserDetails = async (
  id: string,
  data: UserUpdateData 
) => {
  try {
    const response = await apiClient.patch(`${EMPLOYEE_BASE_URL}/${id}`, data);
    return response?.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to update User details"
    );
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`${EMPLOYEE_BASE_URL}/${id}`);
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to delete User"
    );
  }
};
