import { apiClient, ApiResponse } from "./api-client";
import { User } from "./auth";

export interface Wallet {
    id: string;
    balance: number;
    currency: string;
    status: string;
}

export interface UserWithWallet extends User {
    wallet: Wallet | null;
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

export const usersService = {
    getUsers() {
        return apiClient.get<{
            data: UserWithWallet[];
            links: any;
            meta: any;
            message?: string;
            status?: boolean;
        }>("/users");
    },

    getUserById(userId: string) {
        return apiClient.get<ApiResponse<UserWithWallet>>(`/users/${userId}`);
    },

    deleteUser(userId: string) {
        return apiClient.delete<ApiResponse<unknown>>(`/users/${userId}`);
    },

    blockUser(userId: string) {
        return apiClient.put<ApiResponse<unknown>>(`/users/${userId}/suspend`);
    },

    unblockUser(userId: string) {
        return apiClient.put<ApiResponse<unknown>>(
            `/users/${userId}/unsuspend`,
        );
    },
};
