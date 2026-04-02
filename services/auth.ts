import { apiClient, ApiResponse } from "./api-client";

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  account_type: string;
  sub_account_type?: string | null;
  email: { token: string; value: string };
  country_id: string;
  dob: string;
  address: string;
  occupation: string;
  avatar?: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface GenerateTokenPayload {
  channel: "email" | "phone";
  identifier: string;
  code: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  dob: string;
  gender: string | null;
  address: string;
  occupation: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  email_verified_at: string;
  phone: string | null;
  role: Role;
  profile: Profile;
  phone_verified_at: string | null;
  account_type: string;
  notification_token?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AuthToken {
  token: string;
  type: string;
}

export const authService = {
  register(payload: RegisterPayload) {
    return apiClient.post<ApiResponse<{ user: User }>>("/auth/register", payload);
  },

  login(payload: LoginPayload) {
    return apiClient.post<ApiResponse<User>>("/auth/login", payload);
  },

  changePassword(payload: ChangePasswordPayload) {
    return apiClient.post<ApiResponse<[]>>("/auth/change-password", payload);
  },

  logout() {
    return apiClient.post<ApiResponse<[]>>("/auth/logout");
  },

  generateToken(payload: GenerateTokenPayload) {
    return apiClient.post<ApiResponse<AuthToken>>("/auth/generate-token", payload);
  },
};
