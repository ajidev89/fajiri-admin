import { apiClient, ApiResponse } from "./api-client";
import { Campaign } from "./campaigns";
import { Need } from "./needs";

export interface Donation {
    id: string;
    name: string;
    email: string;
    user_id: string;
    donatable_type: string;
    amount: number;
    converted_amount: string;
    currency: string;
    status: string;
    reference: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export interface DonationWithCampaign extends Donation {
    donatable: Campaign;
}
export interface DonationWithNeed extends Donation {
    donatable: Need;
}

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
        return apiClient.post<ApiResponse<unknown>>(
            `/donations/${campaignId}/wallet`,
            payload,
        );
    },

    getDonations() {
        return apiClient.get<
            ApiResponse<DonationWithCampaign[] | DonationWithNeed[]>
        >("/donations");
    },

    initializePaystackDonation(
        campaignId: string,
        payload: InitializePaystackDonationPayload,
    ) {
        return apiClient.post<ApiResponse<PaystackInitResponse>>(
            `/donations/${campaignId}/paystack/initialize`,
            payload,
        );
    },

    verifyPaystackDonation(reference: string) {
        return apiClient.get<ApiResponse<unknown>>("/donations/verify", {
            reference,
        });
    },
};
