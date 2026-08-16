import { apiClient, ApiResponse } from "./api-client";
import { User } from "./auth";

export interface Wallet {
    id: string;
    balance: number;
    withdrawal_total?: number;
    currency: string;
    status: string;
}

export interface Transaction {
    id: string;
    amount: number;
    type: "credit" | "debit" | "deposit" | "withdrawal" | "transfer" | string;
    currency: string;
    description: string | null;
    reference: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface UserDonation {
    id: string;
    name: string;
    email: string;
    user_id: string;
    medium?: string;
    donatable_type: string;
    donatable?: {
        id: string;
        title?: string;
        name?: string;
        body?: string;
        [key: string]: any;
    };
    amount: number;
    currency: string;
    base_amount?: number;
    base_currency?: string;
    status: string;
    reference: string;
    created_at: string;
    updated_at: string;
}

export interface UserWithWallet extends User {
    wallet: Wallet | null;
    total_donations?: number;
    donations_count?: number;
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
    getUserAudits(userId: string) {
        return apiClient.get<ApiResponse<any[]>>(`/users/${userId}/audits`);
    },
    getUserTransactions(userId: string) {
        return apiClient.get<ApiResponse<Transaction[]>>(
            `/users/${userId}/transactions`,
        );
    },
    getUserDonations(userId: string) {
        return apiClient.get<ApiResponse<UserDonation[]>>(
            `/users/${userId}/donations`,
        );
    },
    getUserReferrals(userId: string) {
        return apiClient.get<ApiResponse<User[]>>(
            `/users/${userId}/referrals`,
        );
    },

    updateUser(
        userId: string,
        payload: { role_id?: number; status?: string },
    ) {
        return apiClient.put<ApiResponse<UserWithWallet>>(
            `/users/${userId}`,
            payload,
        );
    },
};
