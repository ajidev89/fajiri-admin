import { apiClient, ApiResponse, PaginatedResponse } from "./api-client";
import { Category } from "./categories";

export interface BlogPost {
    id: string;
    user_id: string;
    category_id: string;
    title: string;
    slug: string;
    content: string;
    image: string | null;
    status: "draft" | "published" | "archived" | "scheduled";
    is_featured: boolean;
    published_at: string | null;
    created_at: string;
    category?: Category;
    author?: {
        id: string;
        username: string;
        profile?: {
            first_name: string;
            last_name: string;
            avatar: string | null;
        };
    };
}

export interface CreatePostPayload {
    category_id: string;
    title: string;
    content: string;
    image?: File;
    status?: string;
    is_featured?: boolean;
    country_id?: string;
}

export const blogService = {
    getPosts(params?: Record<string, string>) {
        return apiClient.get<PaginatedResponse<BlogPost>>("/posts", params);
    },

    getPost(slug: string) {
        return apiClient.get<ApiResponse<BlogPost>>(`/posts/${slug}`);
    },

    createPost(payload: CreatePostPayload) {
        const formData = new FormData();
        formData.append("category_id", payload.category_id);
        formData.append("title", payload.title);
        formData.append("content", payload.content);
        if (payload.image) formData.append("image", payload.image);
        if (payload.status) formData.append("status", payload.status);
        if (payload.country_id) formData.append("country_id", payload.country_id);
        if (payload.is_featured !== undefined) {
            formData.append("is_featured", payload.is_featured ? "1" : "0");
        }
        
        return apiClient.postFormData<ApiResponse<BlogPost>>("/posts", formData);
    },

    updatePost(id: string, payload: Partial<CreatePostPayload>) {
        const formData = new FormData();
        if (payload.category_id) formData.append("category_id", payload.category_id);
        if (payload.title) formData.append("title", payload.title);
        if (payload.content) formData.append("content", payload.content);
        if (payload.image) formData.append("image", payload.image);
        if (payload.status) formData.append("status", payload.status);
        if (payload.is_featured !== undefined) {
            formData.append("is_featured", payload.is_featured ? "1" : "0");
        }
        formData.append("_method", "PUT");

        return apiClient.postFormData<ApiResponse<BlogPost>>(`/posts/${id}`, formData);
    },

    deletePost(id: string) {
        return apiClient.delete<ApiResponse<null>>(`/posts/${id}`);
    }
};
