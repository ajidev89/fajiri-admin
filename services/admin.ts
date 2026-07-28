import { apiClient, ApiResponse, PaginatedResponse } from "./api-client";
import { User } from "./auth";

// ─── Permission ───────────────────────────────────────────────────────────────

export interface Permission {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

// ─── Role ─────────────────────────────────────────────────────────────────────

export interface Role {
    id: number;
    name: string;
    slug: string;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

// ─── Team Member ──────────────────────────────────────────────────────────────

export type TeamMember = User;

export interface CreateTeamMemberPayload {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    role_id: number;
    country_id: number;
    gender?: "male" | "female" | "other";
    dob?: string;
}

export interface UpdateTeamMemberPayload {
    role_id: number;
    status?: "active" | "suspended" | "deactivated";
}

// ─── Role Payloads ────────────────────────────────────────────────────────────

export interface CreateRolePayload {
    name: string;
    permissions?: string[]; // permission names e.g. ["user_management", "reports_analytics"]
}

export interface UpdateRolePayload {
    name?: string;
    permissions?: string[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const adminService = {
    // ── Team Members ──────────────────────────────────────────────────────────

    getTeamMembers() {
        return apiClient.get<PaginatedResponse<TeamMember>>("/admin/users");
    },

    createTeamMember(payload: CreateTeamMemberPayload) {
        return apiClient.post<ApiResponse<TeamMember>>("/admin/users", payload);
    },

    updateTeamMember(userId: string, payload: UpdateTeamMemberPayload) {
        return apiClient.put<ApiResponse<TeamMember>>(
            `/admin/users/${userId}`,
            payload,
        );
    },

    deleteTeamMember(userId: string) {
        return apiClient.delete<ApiResponse<unknown>>(`/admin/users/${userId}`);
    },

    // ── Roles ─────────────────────────────────────────────────────────────────

    getRoles() {
        return apiClient.get<ApiResponse<Role[]>>("/admin/roles");
    },

    createRole(payload: CreateRolePayload) {
        return apiClient.post<ApiResponse<Role>>("/admin/roles", payload);
    },

    updateRole(roleId: number, payload: UpdateRolePayload) {
        return apiClient.put<ApiResponse<Role>>(
            `/admin/roles/${roleId}`,
            payload,
        );
    },

    deleteRole(roleId: number) {
        return apiClient.delete<ApiResponse<unknown>>(
            `/admin/roles/${roleId}`,
        );
    },

    // ── Permissions ───────────────────────────────────────────────────────────

    getPermissions() {
        return apiClient.get<ApiResponse<Permission[]>>("/admin/permissions");
    },
};
