import { apiClient, ApiResponse } from "./api-client";

export interface GoogleUrlResponse {
  url: string;
}

export const googleService = {
  generateUrl() {
    return apiClient.post<ApiResponse<GoogleUrlResponse>>("/google/generate-url");
  },
};
