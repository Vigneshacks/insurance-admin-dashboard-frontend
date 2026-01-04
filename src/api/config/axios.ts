import axios, { AxiosInstance } from "axios";
import { setupInterceptors } from "./interceptors";

// Environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "30000");


/**
 * Validates essential environment variables
 * @throws Error if required environment variables are missing
 */
const validateEnvVars = (): void => {
  if (!API_BASE_URL) {
    throw new Error(
      "VITE_API_BASE_URL is not defined in environment variables"
    );
  }
};

/**
 * Below code creates and configures an Axios instance
 * @returns Configured Axios instance
 */
export const createApiClient = (): AxiosInstance => {
  validateEnvVars();

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Made for setting up request and response interceptors
  setupInterceptors(apiClient);

  return apiClient;
};

const apiClient = createApiClient();
export default apiClient;
