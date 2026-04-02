import { apiClient, ApiResponse } from "./api-client";

export interface SendOtpPayload {
  channel: "email" | "phone";
  identifier: string;
}

export interface VerifyOtpPayload {
  channel: "email" | "phone";
  identifier: string;
  code: string;
}

export interface OtpToken {
  token: string;
}

export const otpService = {
  sendOtp(payload: SendOtpPayload) {
    return apiClient.post<ApiResponse<[]>>("/otp/send", payload);
  },

  verifyOtp(payload: VerifyOtpPayload) {
    return apiClient.post<ApiResponse<OtpToken>>("/otp/verify", payload);
  },
};
