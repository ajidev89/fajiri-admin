import Cookies from "js-cookie";
import { decryptData } from "@/lib/crypto";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://api.fajiri.org/v1";

export interface ApiResponse<T> {
    message?: string;
    data: T;
    status?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            page: number | null;
            active: boolean;
        }[];
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

function getToken(): string | null {
    const encryptedToken = Cookies.get("fajiri_token");
    if (!encryptedToken) return null;
    return decryptData(encryptedToken);
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        if (response.status === 401) {
            Cookies.remove("fajiri_user");
            Cookies.remove("fajiri_token");
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
        const error = await response.json().catch(() => ({}));
        throw new Error(
            error.message || `Request failed with status ${response.status}`,
        );
    }
    return response.json();
}

function authHeaders(): HeadersInit {
    const token = getToken();
    const headers: HeadersInit = {
        Accept: "application/json",
        "X-App": "admin",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

export const apiClient = {
    async get<T>(
        endpoint: string,
        params?: Record<string, string>,
    ): Promise<T> {
        const url = new URL(`${API_BASE_URL}${endpoint}`);
        if (params) {
            Object.entries(params).forEach(([key, value]) =>
                url.searchParams.set(key, value),
            );
        }
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: authHeaders(),
        });
        return handleResponse<T>(response);
    },

    async post<T>(endpoint: string, body?: object): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers: {
                ...authHeaders(),
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        return handleResponse<T>(response);
    },

    async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers: authHeaders(),
            body: formData,
        });
        return handleResponse<T>(response);
    },

    async put<T>(endpoint: string, body?: object): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "PUT",
            headers: {
                ...authHeaders(),
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });
        return handleResponse<T>(response);
    },

    async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "DELETE",
            headers: authHeaders(),
        });
        return handleResponse<T>(response);
    },
};
