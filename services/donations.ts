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
    type?: "campaign" | "need";
    title?: string | null;
    rate?: number | null;
    is_flagged?: boolean;
    flagged_at?: string | null;
    flag_reason?: string | null;
    flagged_by?: { id: string; email: string } | null;
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

export type AnyDonation = DonationWithCampaign | DonationWithNeed;

export function getDonationType(donation: Donation): "campaign" | "need" {
    if (donation.type) return donation.type;
    return donation.donatable_type?.endsWith("Campaign") ? "campaign" : "need";
}

export function getDonationTitle(donation: Donation): string {
    if (donation.title) return donation.title;
    return (
        (getDonationType(donation) === "campaign"
            ? donation.donatable?.title
            : donation.donatable?.name) ?? "—"
    );
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

    getDonations(params?: Record<string, string>) {
        return apiClient.get<
            ApiResponse<DonationWithCampaign[] | DonationWithNeed[]>
        >("/donations", params);
    },

    exportDonations(params?: Record<string, string>) {
        return apiClient.download("/donations/export", params, "donations.csv");
    },

    getDonation(id: string) {
        return apiClient.get<ApiResponse<AnyDonation>>(`/donations/${id}`);
    },

    flagDonation(id: string, reason: string) {
        return apiClient.post<ApiResponse<AnyDonation>>(
            `/donations/${id}/flag`,
            { reason },
        );
    },

    unflagDonation(id: string) {
        return apiClient.delete<ApiResponse<AnyDonation>>(
            `/donations/${id}/flag`,
        );
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
