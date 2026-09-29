import { apiClient, ApiResponse, PaginatedResponse } from "./api-client";

export interface Testimony {
    id: string;
    name: string;
    slug: string;
    age: number;
    age_label: string;
    story: string;
    photo: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface TestimonyPayload {
    name: string;
    age: number;
    story: string;
    photo?: File;
    sort_order?: number;
}

function toFormData(payload: TestimonyPayload, method?: "PUT") {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("age", String(payload.age));
    formData.append("story", payload.story);
    formData.append("sort_order", String(payload.sort_order ?? 0));
    if (payload.photo) {
        formData.append("photo", payload.photo);
    }
    if (method) {
        formData.append("_method", method);
    }

    return formData;
}

export const testimonyService = {
    getTestimonies(params?: Record<string, string>) {
        return apiClient.get<PaginatedResponse<Testimony>>("/testimonies", params);
    },

    getTestimony(slug: string) {
        return apiClient.get<ApiResponse<Testimony>>(`/testimonies/${slug}`);
    },

    createTestimony(payload: TestimonyPayload) {
        return apiClient.postFormData<ApiResponse<Testimony>>(
            "/testimonies",
            toFormData(payload),
        );
    },

    updateTestimony(id: string, payload: TestimonyPayload) {
        return apiClient.postFormData<ApiResponse<Testimony>>(
            `/testimonies/${id}`,
            toFormData(payload, "PUT"),
        );
    },

    deleteTestimony(id: string) {
        return apiClient.delete<ApiResponse<null>>(`/testimonies/${id}`);
    },
};
