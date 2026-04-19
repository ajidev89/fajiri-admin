import { apiClient, ApiResponse } from "./api-client";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  duration: number;
  features: string[];
  status: boolean;
}

export interface UpdatePlanPayload {
  duration?: number;
  name?: string;
  description?: string;
  price?: string;
  currency?: string;
  features?: string[];
  status?: boolean;
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
    return apiClient.post<ApiResponse<unknown>>("/plans/subscribe", payload);
  },
};
