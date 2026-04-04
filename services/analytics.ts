import { apiClient, ApiResponse } from "./api-client";

export interface AnalyticsResponse {
    total_donations: number;
    total_donations_amount: {
        currency: string;
        total_amount: string;
    }[];
    active_campaigns: number;
    active_campaigns_percentage_change: number;
    active_needs: number;
    active_needs_percentage_change: number;
    total_users: number;
    total_users_percentage_change: number;
}

export interface DonationChartlyAnnualyResponse {
    month: string;
    no_of_donations: number;
    amounts: Record<string, number>;
}

export interface TopPerformingCampaignsResponse {
    id: string;
    title: string;
    total_raised: number;
}

export const analyticsService = {
    getAnalytics() {
        return apiClient.get<ApiResponse<AnalyticsResponse>>(`/analytics`);
    },

    getDonationChartlyAnnualy() {
        return apiClient.get<ApiResponse<DonationChartlyAnnualyResponse[]>>(
            "/analytics/donation-chartly-annualy",
        );
    },

    getTopPerformingCampaigns() {
        return apiClient.get<ApiResponse<TopPerformingCampaignsResponse[]>>(
            `/analytics/top-performing-campaigns`,
        );
    },
};
