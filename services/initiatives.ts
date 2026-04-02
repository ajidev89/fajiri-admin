import { apiClient, ApiResponse } from "./api-client";

export interface Initiative {
  id: string;
  title: string;
  description: string;
  image: string;
  status: string;
  added_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInitiativePayload {
  title: string;
  description: string;
  image?: File;
}

export interface UpdateInitiativePayload {
  title?: string;
  description?: string;
  image?: File;
}

export const initiativeService = {
  getInitiatives() {
    return apiClient.get<ApiResponse<Initiative[]>>("/initiatives");
  },

  createInitiative(payload: CreateInitiativePayload) {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    if (payload.image) {
      formData.append("image", payload.image);
    }
    return apiClient.postFormData<ApiResponse<Initiative>>("/initiatives", formData);
  },

  updateInitiative(id: string, payload: UpdateInitiativePayload) {
    const formData = new FormData();
    if (payload.title) formData.append("title", payload.title);
    if (payload.description) formData.append("description", payload.description);
    if (payload.image) formData.append("image", payload.image);
    formData.append("_method", "PUT");
    return apiClient.postFormData<ApiResponse<Initiative>>(`/initiatives/${id}`, formData);
  },

  deleteInitiative(id: string) {
    return apiClient.delete<ApiResponse<unknown>>(`/initiatives/${id}`);
  },
};
