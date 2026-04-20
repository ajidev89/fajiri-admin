import { apiClient, ApiResponse } from "./api-client";

export interface Media {
    id: string;
    user_id: string;
    title: string;
    url: string;
    type: "image" | "video";
    created_at: string;
    updated_at: string;
}

export const mediaService = {
    getMedia() {
        return apiClient.get<ApiResponse<Media[]>>("/media");
    },

    uploadMedia(title: string, file: File) {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("file", file);

        return apiClient.post<ApiResponse<Media>>("/media", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    deleteMedia(id: string) {
        return apiClient.delete<ApiResponse<unknown>>(`/media/${id}`);
    },
};
