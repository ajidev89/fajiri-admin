import { apiClient, ApiResponse } from "./api-client";

export interface FamilyTreeNode {
    id: string;
    user_id: string;
    added_by?: string;
    parent_id: string | null;
    full_name: string;
    dob: string | null;
    gender: string;
    photo: string | null;
    relationship: string;
    married_date: string | null;
    is_alive: boolean;
    death_date: string | null;
    note: string | null;
    children?: FamilyTreeNode[];
    parent?: FamilyTreeNode;
    created_at: string;
    updated_at: string;
}

export const familyTreeService = {
    getFamilyTree() {
        return apiClient.get<ApiResponse<FamilyTreeNode[]>>("/family-tree/admin");
    },
    getFamilyTreeByMemberId(id: string) {
        return apiClient.get<ApiResponse<FamilyTreeNode>>(`/family-tree/admin/${id}`);
    },
};
