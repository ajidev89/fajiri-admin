import { apiClient, ApiResponse, PaginatedResponse } from "./api-client";

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    posts_count?: number;
    created_at: string;
}

export const categoryService = {
    getCategories(params?: Record<string, string>) {
        return apiClient.get<PaginatedResponse<Category>>("/categories", params);
    },

    getCategory(id: string) {
        return apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    },

    createCategory(data: Partial<Category>) {
        return apiClient.post<ApiResponse<Category>>("/categories", data);
    },

    updateCategory(id: string, data: Partial<Category>) {
        return apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    },

    deleteCategory(id: string) {
        return apiClient.delete<ApiResponse<null>>(`/categories/${id}`);
    }
};
