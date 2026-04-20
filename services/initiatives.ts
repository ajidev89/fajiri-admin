import { apiClient } from "./api-client";
import { ApiResponse, PaginatedResponse } from "./api-client";
import { User } from "./auth";

export interface Initiative {
    id: string;
    title: string;
    description: string;
    image: string;
    status: string;
    added_by: string;
    added_by_user?: User;
    created_at: string;
    updated_at: string;
}

export const initiativeService = {
    getInitiatives(params?: Record<string, any>) {
        return apiClient.get<PaginatedResponse<Initiative>>("/initiatives", params);
    },

    getInitiative(id: string) {
        return apiClient.get<ApiResponse<Initiative>>(`/initiatives/${id}`);
    },

    createInitiative(data: FormData) {
        return apiClient.post<ApiResponse<Initiative>>("/initiatives", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    updateInitiative(id: string, data: FormData) {
        // Laravel PUT with files requires _method: PUT and POST request
        data.append("_method", "PUT");
        return apiClient.post<ApiResponse<Initiative>>(`/initiatives/${id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    deleteInitiative(id: string) {
        return apiClient.delete<ApiResponse<any>>(`/initiatives/${id}`);
    },
};
