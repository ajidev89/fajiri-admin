import { apiClient, ApiResponse } from "./api-client";

export interface Plan {
    id: string | number;
    name: string;
    level?: string;
    account_type?: string;
    sub_account_type?: string;
    slug: string;
    description?: string;
    price: string | number;
    currency: string;
    base_price?: string | number;
    base_currency?: string;
    duration: number;
    features: string[];
    status: boolean;
    stripe_price_id?: string | null;
    stripe_product_id?: string | null;
    paystack_plan_code?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface UpdatePlanPayload {
    duration?: number;
    name?: string;
    level?: string;
    account_type?: string;
    sub_account_type?: string;
    description?: string;
    price?: string | number;
    currency?: string;
    features?: string[];
    status?: boolean;
    stripe_price_id?: string | null;
    stripe_product_id?: string | null;
    paystack_plan_code?: string | null;
}

export interface SubscribeToPlanPayload {
    plan_id: string;
    duration: number;
}

export const planService = {
    listPlans() {
        return apiClient.get<ApiResponse<Plan[]>>("/plans");
    },

    createPlan(payload: UpdatePlanPayload) {
        return apiClient.post<ApiResponse<Plan>>("/plans", payload);
    },

    updatePlan(planId: string | number, payload: UpdatePlanPayload) {
        return apiClient.put<ApiResponse<Plan>>(`/plans/${planId}`, payload);
    },

    deletePlan(planId: string | number) {
        return apiClient.delete<ApiResponse<null>>(`/plans/${planId}`);
    },

    subscribeToPlan(payload: SubscribeToPlanPayload) {
        return apiClient.post<ApiResponse<unknown>>(
            "/plans/subscribe",
            payload,
        );
    },
};
