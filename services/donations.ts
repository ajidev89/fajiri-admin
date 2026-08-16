import { apiClient, ApiResponse } from "./api-client";
import { Campaign } from "./campaigns";
import { Need } from "./needs";

export interface Donation {
    id: string;
    name: string;
    email: string;
    user_id: string;
    medium?: string;
    donatable_type: string;
    donatable?: any;
    amount: number;
    currency: string;
    base_amount?: number;
    base_currency?: string;
    base_amount_usd?: number;
    converted_amount?: string;
    status: string;
    reference: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface DonationWithCampaign extends Donation {
    donatable_type: "App\\Models\\Campaign";
    donatable: Campaign;
}
export interface DonationWithNeed extends Donation {
    donatable_type: "App\\Models\\Need";
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
