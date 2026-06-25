import { apiClient, ApiResponse, PaginatedResponse } from "./api-client";

export interface LeaderboardProfile {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    dob: string | null;
    gender: string | null;
    address: string | null;
    occupation: string | null;
    avatar: string | null;
    created_at: string;
    updated_at: string;
}

export interface LeaderboardMember {
    id: string;
    member_id: string;
    email: string;
    username: string;
    email_verified_at: string | null;
    phone: string | null;
    role_id: number;
    country_id: number;
    google_id: string | null;
    phone_verified_at: string | null;
    account_type: string;
    sub_account_type: string | null;
    notification_token: string | null;
    status: string;
    referral_code: string;
    referred_by: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    last_login_at: string | null;
    referrals_count: number;
    campaign_donations_count: number;
    need_donations_count: number;
    event_attendance_count: number;
    name: string;
    country_iso2: string;
    total_engagement: number;
    profile: LeaderboardProfile;
}

export const leaderboardService = {
    getLeaderboard(params?: Record<string, any>) {
        return apiClient.get<PaginatedResponse<LeaderboardMember>>(
            "/analytics/leaderboard",
            params,
        );
    },
};
