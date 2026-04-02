import { apiClient, ApiResponse } from "./api-client";

export interface Notification {
  id: string;
  [key: string]: unknown;
}

export const notificationService = {
  listNotifications() {
    return apiClient.get<ApiResponse<Notification[]>>("/notifications");
  },

  deleteNotification(notificationId: string) {
    return apiClient.delete<ApiResponse<unknown>>(`/notifications/${notificationId}`);
  },
};
