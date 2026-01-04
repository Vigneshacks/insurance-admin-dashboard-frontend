import { AxiosError } from "axios";
import apiClient from "../../config/axios";


export interface RequestData {
  id: string;
  status: string;
  request_type: string;
  created_at: string;
  updated_at: string;
  employee_name: string;
  employee_email: string;
  organization_name: string;
}

export interface RequestDetailData extends RequestData {
  details?: string; 
}

interface ApiErrorResponse {
  detail?: string;
  message: string;
}

const REQUEST_BASE_URL = "/api/admin/employee-request";


export const fetchEmployeeRequests = async (
  skipCount: number = 0,
  searchTerm?: string,
  orderBy?: string,
  direction: string = "asc"
) => {
  try {
    const response = await apiClient.get(REQUEST_BASE_URL, {
      params: {
        skip: skipCount,
        limit: 10,
        direction,
        ...(searchTerm && { search_term: searchTerm }),
        ...(orderBy && { order_by: orderBy })
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch Employee Requests"
    );
  }
};

export const fetchPendingRequests = async (
  skipCount: number = 0,
  searchTerm?: string,
  orderBy?: string,
  direction: string = "asc"
) => {
  try {
    const response = await apiClient.get(REQUEST_BASE_URL, {
      params: {
        skip: skipCount,
        limit: 10,
        request_status: "PENDING",
        direction,
        ...(searchTerm && { search_term: searchTerm }),
        ...(orderBy && { order_by: orderBy })
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch Pending Requests"
    );
  }
};

export const fetchEmployeeRequestDetails = async (id: string) => {
  try {
    const response = await apiClient.get(`${REQUEST_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch employee request details"
    );
  }
};

export const updateRequestStatus = async (id: string, status: string) => {
  try {
    const response = await apiClient.patch(
      `${REQUEST_BASE_URL}/${id}`,
      { status }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message || `Failed to update request status to ${status}`
    );
  }
};

export default {
  fetchEmployeeRequests,
  fetchPendingRequests,
  fetchEmployeeRequestDetails,
  updateRequestStatus
};