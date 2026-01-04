import {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  AxiosHeaders,
} from "axios";
import { toast } from "react-toastify";
import { getToken } from "../../services/tokenProvider";
// import { getToken, removeToken } from "../../utils/tokenUtils";


interface ApiErrorResponse {
  detail?: string;
  message: string;
}
/**
 * Sets up request and response interceptors for the API client
 * @param apiClient - The Axios instance to configure
 */
export const setupInterceptors = (apiClient: AxiosInstance): void => {
  // Request interceptor
  apiClient.interceptors.request.use(
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
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ApiErrorResponse>) => {
      handleApiError(error);
      return Promise.reject(error);
    }
  );
};

/**
 * Handles API errors based on status codes and other factors
 * @param error - The Axios error object
 */
const handleApiError = (error: AxiosError<ApiErrorResponse>): void => {
  const { response } = error;

  if (response) {
    switch (response.status) {
      case 400:
        console.error("Bad Request:", response.data);
        break;
      case 401:
        console.error("Unauthorized:", response.data);
        toast.info("Session expired, please login again");
        //removeToken();
        window.location.href = "/login";
        break;
      case 403:
        console.error("Forbidden:", response.data);
        toast.warn("You do not have permission to perform this action");
        break;
      case 404:
        console.error("Not Found:", response.data);
        break;
      case 409:
      case 422:
        toast.warn(response.data?.detail || "Validation error occurred");
        break;
      case 500:
        console.error("Internal Server Error:", response.data);
        toast.error("An unexpected server error occurred");
        break;
      case 502:
        console.error("Bad Gateway:", response.data);
        toast.error("Server is currently unavailable");
        break;
      default:
        console.error(`Error: ${response.status}`, response.data);
        toast.error("An unexpected error occurred");
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error("Network Error - No Response:", error.request);
    toast.error("Unable to connect to the server");
  } else {
    // Something happened in setting up the request
    console.error("Request Configuration Error:", error.message);
    toast.error("An error occurred while sending the request");
  }
};
