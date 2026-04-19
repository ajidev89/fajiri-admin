import { apiClient, ApiResponse, PaginatedResponse } from "./api-client";
import { Category } from "./categories";

export interface Event {
    id: string;
    added_by: string;
    category_id: string;
    title: string;
    slug: string;
    description: string;
    location: string | null;
    start_date: string;
    end_date: string | null;
    image: string | null;
    status: "upcoming" | "ongoing" | "completed" | "cancelled";
    is_featured: boolean;
    slots: number;
    amount: string | number;
    attendees_count: number;
    slots_available: number;
    category?: Category;
    created_at: string;
    updated_at: string;
}

export interface CreateEventPayload {
    category_id?: string;
    title: string;
    description: string;
    location?: string;
    start_date: string;
    end_date?: string;
    image?: File;
    status?: string;
    is_featured?: boolean;
    slots?: number;
    amount?: number | string;
}

export const eventService = {
    getEvents(params?: Record<string, string>) {
        return apiClient.get<PaginatedResponse<Event>>("/events", params);
    },

    getEvent(slug: string) {
        return apiClient.get<ApiResponse<Event>>(`/events/${slug}`);
    },

    createEvent(payload: CreateEventPayload) {
        const formData = new FormData();
        if (payload.category_id) formData.append("category_id", payload.category_id);
        formData.append("title", payload.title);
        formData.append("description", payload.description);
        if (payload.location) formData.append("location", payload.location);
        formData.append("start_date", payload.start_date);
        if (payload.end_date) formData.append("end_date", payload.end_date);
        if (payload.image) formData.append("image", payload.image);
        if (payload.status) formData.append("status", payload.status);
        if (payload.is_featured !== undefined) {
            formData.append("is_featured", payload.is_featured ? "1" : "0");
        }
        if (payload.slots) formData.append("slots", payload.slots.toString());
        if (payload.amount) formData.append("amount", payload.amount.toString());

        return apiClient.postFormData<ApiResponse<Event>>("/events", formData);
    },

    updateEvent(id: string, payload: Partial<CreateEventPayload>) {
        const formData = new FormData();
        if (payload.category_id) formData.append("category_id", payload.category_id);
        if (payload.title) formData.append("title", payload.title);
        if (payload.description) formData.append("description", payload.description);
        if (payload.location) formData.append("location", payload.location);
        if (payload.start_date) formData.append("start_date", payload.start_date);
        if (payload.end_date) formData.append("end_date", payload.end_date);
        if (payload.image) formData.append("image", payload.image);
        if (payload.status) formData.append("status", payload.status);
        if (payload.is_featured !== undefined) {
            formData.append("is_featured", payload.is_featured ? "1" : "0");
        }
        if (payload.slots) formData.append("slots", payload.slots.toString());
        if (payload.amount) formData.append("amount", payload.amount.toString());
        
        formData.append("_method", "PUT");

        return apiClient.postFormData<ApiResponse<Event>>(`/events/${id}`, formData);
    },

    deleteEvent(id: string) {
        return apiClient.delete<ApiResponse<null>>(`/events/${id}`);
    }
};
