import { apiClient, ApiResponse, PaginatedResponse } from "./api-client";

export interface Announcement {
    id: string;
    title: string;
    content: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateAnnouncementPayload {
    title: string;
    content: string;
    image_url?: string;
    target_audience?: string[];
}

export const announcementService = {
    getAnnouncements(params?: Record<string, string>) {
        return apiClient.get<ApiResponse<PaginatedResponse<Announcement>>>("/admin/announcements", params);
    },

    createAnnouncement(data: CreateAnnouncementPayload) {
        return apiClient.post<ApiResponse<Announcement>>("/admin/announcements", data);
    },
};
