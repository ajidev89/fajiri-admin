import { apiClient, ApiResponse } from "./api-client";

export interface Preference {
  id: string;
  user_id: string;
  notification_sound: boolean;
  auto_update_software: boolean;
  community_updates: boolean;
  project_updates: boolean;
  event_updates: boolean;
  receive_payment_confirmation: boolean;
  membership_status_updates: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdatePreferencePayload {
  notification_sound?: boolean;
  auto_update_software?: boolean;
  community_updates?: boolean;
  project_updates?: boolean;
  event_updates?: boolean;
  receive_payment_confirmation?: boolean;
  membership_status_updates?: boolean;
}

export const preferenceService = {
  getPreferences() {
    return apiClient.get<{ status: string; data: Preference }>("/user/preferences");
  },

  updatePreferences(payload: UpdatePreferencePayload) {
    return apiClient.put<{ status: string; message: string; data: Preference }>("/user/preferences", payload);
  },
};
