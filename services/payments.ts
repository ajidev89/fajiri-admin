import { apiClient, ApiResponse } from "./api-client";

export interface InitializeWalletFundingPayload {
  amount: number;
  email: string;
}

export interface WalletFundingInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export const paymentService = {
  initializeWalletFunding(payload: InitializeWalletFundingPayload) {
    return apiClient.post<ApiResponse<WalletFundingInitResponse>>("/payments/initialize", payload);
  },

  verifyWalletFunding(reference: string) {
    return apiClient.get<ApiResponse<unknown>>("/payments/verify", { reference });
  },
};
