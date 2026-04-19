import { apiClient, ApiResponse } from "./api-client";

export interface Need {
  id: string;
  name: string;
  description: string;
  urgency: string;
  location: string;
  amount: number | null;
  currency: string | null;
  image: string | null;
  age: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNeedPayload {
  name: string;
  description: string;
  urgency: string;
  location: string;
  age: string;
  currency?: string;
  amount?: string | number;
  image?: File;
}

export interface UpdateNeedPayload {
  name?: string;
  description?: string;
  urgency?: string;
  location?: string;
  age?: string;
  currency?: string;
  amount?: string | number;
  image?: File;
}

export const needService = {
  getNeeds() {
    return apiClient.get<ApiResponse<Need[]>>("/needs");
  },

  createNeed(payload: CreateNeedPayload) {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("urgency", payload.urgency);
    formData.append("location", payload.location);
    formData.append("age", payload.age);
    if (payload.currency) formData.append("currency", payload.currency);
    if (payload.amount) formData.append("amount", payload.amount.toString());
    if (payload.image) {
      formData.append("image", payload.image);
    }
    return apiClient.postFormData<ApiResponse<Need>>("/needs", formData);
  },

  updateNeed(needId: string, payload: UpdateNeedPayload) {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.description) formData.append("description", payload.description);
    if (payload.urgency) formData.append("urgency", payload.urgency);
    if (payload.location) formData.append("location", payload.location);
    if (payload.age) formData.append("age", payload.age);
    if (payload.currency) formData.append("currency", payload.currency);
    if (payload.amount) formData.append("amount", payload.amount.toString());
    if (payload.image) formData.append("image", payload.image);
    formData.append("_method", "put");
    return apiClient.postFormData<ApiResponse<Need>>(`/needs/${needId}`, formData);
  },

  deleteNeed(needId: string) {
    return apiClient.delete<ApiResponse<unknown>>(`/needs/${needId}`);
  },
};
