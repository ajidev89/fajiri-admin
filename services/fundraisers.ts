import { apiClient, ApiResponse } from "./api-client";
import { UserWithWallet } from "./users";

export interface CreateFundraiserPayload {
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    country_id?: string;
    currency?: string;
}

export const fundraiserService = {
    listFundraisers(params?: Record<string, string>) {
        return apiClient.get<ApiResponse<UserWithWallet[]>>("/fundraisers", params);
    },

    createFundraiser(payload: CreateFundraiserPayload) {
        return apiClient.post<ApiResponse<UserWithWallet>>("/fundraisers", payload);
    },

    resetPassword(userId: string) {
        return apiClient.post<ApiResponse<unknown>>(`/fundraisers/${userId}/reset-password`);
    },
};
