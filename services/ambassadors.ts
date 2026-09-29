import { apiClient, ApiResponse, PaginatedResponse } from "./api-client";

export interface Ambassador {
    id: string;
    name: string;
    slug: string;
    title: string;
    biography: string;
    photo: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface AmbassadorPayload {
    name: string;
    title: string;
    biography: string;
    photo?: File;
    sort_order?: number;
}

function toFormData(payload: AmbassadorPayload, method?: "PUT") {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("title", payload.title);
    formData.append("biography", payload.biography);
    formData.append("sort_order", String(payload.sort_order ?? 0));
    if (payload.photo) {
        formData.append("photo", payload.photo);
    }
    if (method) {
        formData.append("_method", method);
    }

    return formData;
}

export const ambassadorService = {
    getAmbassadors(params?: Record<string, string>) {
        return apiClient.get<PaginatedResponse<Ambassador>>("/ambassadors", params);
    },

    getAmbassador(slug: string) {
        return apiClient.get<ApiResponse<Ambassador>>(`/ambassadors/${slug}`);
    },

    createAmbassador(payload: AmbassadorPayload) {
        return apiClient.postFormData<ApiResponse<Ambassador>>(
            "/ambassadors",
            toFormData(payload),
        );
    },

    updateAmbassador(id: string, payload: AmbassadorPayload) {
        return apiClient.postFormData<ApiResponse<Ambassador>>(
            `/ambassadors/${id}`,
            toFormData(payload, "PUT"),
        );
    },

    deleteAmbassador(id: string) {
        return apiClient.delete<ApiResponse<null>>(`/ambassadors/${id}`);
    },
};
