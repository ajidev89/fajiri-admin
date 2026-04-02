import { apiClient, ApiResponse } from "./api-client";

export interface DonateViaWalletPayload {
  amount: number;
}

export interface InitializePaystackDonationPayload {
  amount: number;
  email: string;
}

export interface PaystackInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export const donationService = {
  donateViaWallet(campaignId: string, payload: DonateViaWalletPayload) {
    return apiClient.post<ApiResponse<unknown>>(`/donations/${campaignId}/wallet`, payload);
  },

  initializePaystackDonation(campaignId: string, payload: InitializePaystackDonationPayload) {
    return apiClient.post<ApiResponse<PaystackInitResponse>>(`/donations/${campaignId}/paystack/initialize`, payload);
  },

  verifyPaystackDonation(reference: string) {
    return apiClient.get<ApiResponse<unknown>>("/donations/verify", { reference });
  },
};
