import { apiClient, ApiResponse, PaginatedResponse } from "./api-client";

export type FaqType = "general" | "donations" | "members";

export interface FaqTypeOption {
    value: FaqType;
    label: string;
}

export interface Faq {
    id: string;
    type: FaqType;
    type_label: string;
    question: string;
    answer: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface FaqPayload {
    type: FaqType;
    question: string;
    answer: string;
    sort_order?: number;
}

export const FAQ_TYPES: FaqTypeOption[] = [
    { value: "general", label: "General" },
    { value: "donations", label: "Donations" },
    { value: "members", label: "Members" },
];

export const faqService = {
    getTypes() {
        return apiClient.get<ApiResponse<FaqTypeOption[]>>("/faqs/types");
    },

    getFaqs(params?: Record<string, string>) {
        return apiClient.get<PaginatedResponse<Faq>>("/admin/faqs", params);
    },

    createFaq(data: FaqPayload) {
        return apiClient.post<ApiResponse<Faq>>("/admin/faqs", data);
    },

    updateFaq(id: string, data: FaqPayload) {
        return apiClient.put<ApiResponse<Faq>>(`/admin/faqs/${id}`, data);
    },

    deleteFaq(id: string) {
        return apiClient.delete<ApiResponse<null>>(`/admin/faqs/${id}`);
    },
};
