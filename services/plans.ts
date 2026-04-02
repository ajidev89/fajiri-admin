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

  updatePlan(planId: string, payload: UpdatePlanPayload) {
    return apiClient.put<ApiResponse<Plan>>(`/plans/${planId}`, payload);
  },

  subscribeToPlan(payload: SubscribeToPlanPayload) {
    return apiClient.post<ApiResponse<unknown>>("/plans/subscribe", payload);
  },
};
