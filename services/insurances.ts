import { apiClient, ApiResponse, PaginatedResponse } from "./api-client";

export interface Country {
  id: number;
  name: string;
  iso3: string;
  iso2: string;
  phone_code: string;
  currency: string;
  flag: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface Insurance {
  id: string;
  name: string;
  slug: string;
  website: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  type: string;
  city: string;
  state: string;
  country: Country;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInsurancePayload {
  name: string;
  slug: string;
  website: string;
  logo?: File;
  phone: string;
  email: string;
  address: string;
  state: string;
  city: string;
  country_id: string;
  type: string;
  description: string;
}

export interface UpdateInsurancePayload {
  name?: string;
  slug?: string;
  website?: string;
  logo?: File;
  phone?: string;
  email?: string;
  address?: string;
  state?: string;
  city?: string;
  country_id?: string;
  type?: string;
  description?: string;
}

export const insuranceService = {
  getInsurances(params?: Record<string, string>) {
    return apiClient.get<PaginatedResponse<Insurance>>("/insurances", params);
  },

  createInsurance(payload: CreateInsurancePayload) {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("slug", payload.slug);
    formData.append("website", payload.website);
    formData.append("phone", payload.phone);
    formData.append("email", payload.email);
    formData.append("address", payload.address);
    formData.append("state", payload.state);
    formData.append("city", payload.city);
    formData.append("country_id", payload.country_id);
    formData.append("type", payload.type);
    formData.append("description", payload.description);
    if (payload.logo) {
      formData.append("logo", payload.logo);
    }
    return apiClient.postFormData<ApiResponse<Insurance>>("/insurances", formData);
  },

  updateInsurance(id: string, payload: UpdateInsurancePayload) {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.slug) formData.append("slug", payload.slug);
    if (payload.website) formData.append("website", payload.website);
    if (payload.phone) formData.append("phone", payload.phone);
    if (payload.email) formData.append("email", payload.email);
    if (payload.address) formData.append("address", payload.address);
    if (payload.state) formData.append("state", payload.state);
    if (payload.city) formData.append("city", payload.city);
    if (payload.country_id) formData.append("country_id", payload.country_id);
    if (payload.type) formData.append("type", payload.type);
    if (payload.description) formData.append("description", payload.description);
    if (payload.logo) formData.append("logo", payload.logo);
    formData.append("_method", "PUT");
    return apiClient.postFormData<ApiResponse<Insurance>>(`/insurances/${id}`, formData);
  },

  deleteInsurance(id: string) {
    return apiClient.delete<ApiResponse<unknown>>(`/insurances/${id}`);
  },
};
