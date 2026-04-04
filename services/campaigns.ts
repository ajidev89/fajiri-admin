import { apiClient, ApiResponse, PaginatedResponse } from "./api-client";

export interface Campaign {
    id: string;
    title: string;
    body: string;
    type: string;
    campaign_type: string;
    images: string[] | null;
    status: string;
    end_date: string | null;
    goal_amount: number;
    goal_amount_converted: number;
    collected_amount: number;
    collected_amount_converted: number;
    currency: string;
    target_currency: string;
    donors_count: number;
    created_at: string;
    updated_at: string;
}

export interface CreateCampaignPayload {
    title: string;
    body: string;
    currency: string;
    goal_amount: string;
    images?: File[];
    days: string;
    type: string;
}

export interface UpdateCampaignPayload {
    title?: string;
    body?: string;
    currency?: string;
    goal_amount?: string;
    status?: string;
    campaign_type?: string;
    type?: string;
    images?: File[];
}

export interface Analytics {
    total_campaigns: number;
    total_percentage_change: number;
    active_campaigns: number;
    active_percentage_change: number;
    completed_campaigns: number;
    completed_percentage_change: number;
    rejected_campaigns: number;
    rejected_percentage_change: number;
}

export const campaignService = {
    listCampaigns(params?: Record<string, string>) {
        return apiClient.get<PaginatedResponse<Campaign>>("/campaigns", params);
    },

    urgentCampaigns(params?: Record<string, string>) {
        return apiClient.get<PaginatedResponse<Campaign>>(
            "/campaigns/urgent",
            params,
        );
    },

    getTypes() {
        return apiClient.get<ApiResponse<Record<string, string>>>(
            `/campaigns/types`,
        );
    },

    getAnalytics() {
        return apiClient.get<ApiResponse<Analytics>>(
            `/campaigns/analytics`,
        );
    },

    getCampaignDetail(campaignId: string) {
        return apiClient.get<ApiResponse<Campaign>>(`/campaigns/${campaignId}`);
    },

    createCampaign(payload: CreateCampaignPayload) {
        const formData = new FormData();
        formData.append("title", payload.title);
        formData.append("body", payload.body);
        formData.append("currency", payload.currency);
        formData.append("goal_amount", payload.goal_amount);
        formData.append("days", payload.days);
        formData.append("type", payload.type);
        formData.append("status", "active");
        formData.append("campaign_type", "organization");
        if (payload.images) {
            payload.images.forEach((image, index) => {
                formData.append(`images[${index}]`, image);
            });
        }
        return apiClient.postFormData<ApiResponse<Campaign>>(
            "/campaigns",
            formData,
        );
    },

    updateCampaign(campaignId: string, payload: UpdateCampaignPayload) {
        const formData = new FormData();
        if (payload.title) formData.append("title", payload.title);
        if (payload.body) formData.append("body", payload.body);
        if (payload.currency) formData.append("currency", payload.currency);
        if (payload.goal_amount)
            formData.append("goal_amount", payload.goal_amount);
        if (payload.status) formData.append("status", payload.status);
        if (payload.campaign_type)
            formData.append("campaign_type", payload.campaign_type);
        if (payload.type) formData.append("type", payload.type);
        if (payload.images) {
            payload.images.forEach((image) => {
                formData.append("images[]", image);
            });
        }
        formData.append("campaign_type", "organization");
        formData.append("status", "active");
        formData.append("_method", "put");
        return apiClient.postFormData<ApiResponse<Campaign>>(
            `/campaigns/${campaignId}`,
            formData,
        );
    },
};
