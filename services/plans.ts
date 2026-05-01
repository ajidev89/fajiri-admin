import { apiClient, ApiResponse } from "./api-client";

export interface Plan {
    id: string;
    name: string;
    level: string;
    account_type: string;
    slug: string;
    description: string;
    price: string;
    currency: string;
    duration: number;
    features: string[];
    status: boolean;
    rc_entitlement_id?: string;
    rc_offering_id?: string;
    rc_package_id?: string;
    rc_product_id_ios?: string;
    rc_product_id_android?: string;
}

export interface UpdatePlanPayload {
    duration?: number;
    name?: string;
    level?: string;
    account_type?: string;
    description?: string;
    price?: string;
    currency?: string;
    features?: string[];
    status?: boolean;
    rc_product_id_ios?: string | null;
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

    updatePlan(planId: string, payload: UpdatePlanPayload) {
        return apiClient.put<ApiResponse<Plan>>(`/plans/${planId}`, payload);
    },

    deletePlan(planId: string) {
        return apiClient.delete<ApiResponse<null>>(`/plans/${planId}`);
    },

    subscribeToPlan(payload: SubscribeToPlanPayload) {
        return apiClient.post<ApiResponse<unknown>>(
            "/plans/subscribe",
            payload,
        );
    },
};
