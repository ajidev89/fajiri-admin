import { apiClient, ApiResponse } from "./api-client";
import { User } from "./auth";

export interface Wallet {
  id: string;
  balance: number;
  currency: string;
  status: string;
}

export interface UserWithWallet extends User {
  wallet: Wallet;
}

export interface ChangeUserPasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface CreateUpdatePinPayload {
  pin: string;
  current_pin?: string;
}

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  dob?: string | null;
  gender?: string | null;
  address?: string | null;
  occupation?: string | null;
  phone?: string | null;
}

export const userService = {
  getUser() {
    return apiClient.get<ApiResponse<UserWithWallet>>("/user");
  },

  updateAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.postFormData<ApiResponse<{ avatar_url: string }>>("/user/avatar", formData);
  },

  updateProfile(payload: UpdateProfilePayload) {
    return apiClient.put<ApiResponse<User>>("/user/profile", payload);
  },

  changePassword(payload: ChangeUserPasswordPayload) {
    const formData = new FormData();
    formData.append("current_password", payload.current_password);
    formData.append("password", payload.password);
    formData.append("password_confirmation", payload.password_confirmation);
    return apiClient.postFormData<ApiResponse<{ avatar_url: string }>>("/user/change-password", formData);
  },

  createOrUpdatePin(payload: CreateUpdatePinPayload) {
    const formData = new FormData();
    formData.append("pin", payload.pin);
    if (payload.current_pin) {
      formData.append("current_pin", payload.current_pin);
    }
    return apiClient.postFormData<ApiResponse<unknown>>("/user/pin", formData);
  },
};
