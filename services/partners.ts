import { apiClient, ApiResponse, PaginatedResponse } from "./api-client";

export interface Partner {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    about: string;
    website: string | null;
    focus_areas: string[];
    impact: string[];
    created_at: string;
    updated_at: string;
}

export interface CreatePartnerPayload {
    name: string;
    about: string;
    website?: string;
    logo?: File;
    focus_areas?: string[];
    impact?: string[];
    country_id?: string;
}

export const partnerService = {
    getPartners(params?: Record<string, string>) {
        return apiClient.get<PaginatedResponse<Partner>>("/partners", params);
    },

    getPartner(slug: string) {
        return apiClient.get<ApiResponse<Partner>>(`/partners/${slug}`);
    },

    createPartner(payload: CreatePartnerPayload) {
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("about", payload.about);
        if (payload.website) formData.append("website", payload.website);
        if (payload.logo) formData.append("logo", payload.logo);
        if (payload.country_id) formData.append("country_id", payload.country_id);
        
        if (payload.focus_areas) {
            payload.focus_areas.forEach((area) => formData.append("focus_areas[]", area));
        }
        if (payload.impact) {
            payload.impact.forEach((item) => formData.append("impact[]", item));
        }

        return apiClient.postFormData<ApiResponse<Partner>>("/partners", formData);
    },

    updatePartner(id: string, payload: Partial<CreatePartnerPayload>) {
        const formData = new FormData();
        if (payload.name) formData.append("name", payload.name);
        if (payload.about) formData.append("about", payload.about);
        if (payload.website) formData.append("website", payload.website);
        if (payload.logo) formData.append("logo", payload.logo);
        
        if (payload.focus_areas) {
            payload.focus_areas.forEach((area) => formData.append("focus_areas[]", area));
        }
        if (payload.impact) {
            payload.impact.forEach((item) => formData.append("impact[]", item));
        }
        
        formData.append("_method", "PUT");

        return apiClient.postFormData<ApiResponse<Partner>>(`/partners/${id}`, formData);
    },

    deletePartner(id: string) {
        return apiClient.delete<ApiResponse<null>>(`/partners/${id}`);
    }
};
