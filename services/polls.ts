import { apiClient, ApiResponse, PaginatedResponse } from "./api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PollType = "radio" | "checkbox" | "short_text" | "long_text";
export type PollStatus = "draft" | "active" | "inactive";

export interface PollOption {
    id: number;
    label: string;
    order: number;
    votes_count: number;
    vote_percentage: number;
}

export interface PollResponse {
    id: number;
    user: {
        id: string;
        name: string;
        member_id: string;
        avatar: string | null;
    } | null;
    option: {
        id: number;
        label: string;
    } | null;
    text_response: string | null;
    answered_at: string;
    created_at: string;
}

export interface Poll {
    id: number;
    title: string;
    type: PollType;
    status: PollStatus;
    start_date: string;
    duration_hours: number;
    ends_at: string;
    time_left: string;
    participants_count: number;
    views: number;
    options: PollOption[];
    added_by: {
        id: string;
        name: string;
    } | null;
    created_at: string;
    updated_at: string;
}

export interface PollSummary {
    poll: Poll;
    options: Array<{
        id: number;
        label: string;
        votes_count: number;
        vote_percentage: number;
    }>;
    stats: {
        total_votes: number;
        total_views: number;
        participants_count: number;
    };
    recent_responses: PollResponse[];
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface PollOptionPayload {
    label: string;
    order?: number;
}

export interface CreatePollPayload {
    title: string;
    type: PollType;
    status?: PollStatus;
    start_date: string; // ISO datetime
    duration_hours: number;
    options?: PollOptionPayload[];
}

export type UpdatePollPayload = Partial<CreatePollPayload>;

export interface VotePollPayload {
    option_ids?: number[];
    text_response?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const pollService = {
    // ── Admin endpoints (require poll_management permission) ──────────────────

    getPolls(params?: Record<string, string>) {
        return apiClient.get<PaginatedResponse<Poll>>("/admin/polls", params);
    },

    getPoll(pollId: number) {
        return apiClient.get<ApiResponse<Poll>>(`/admin/polls/${pollId}`);
    },

    createPoll(payload: CreatePollPayload) {
        return apiClient.post<ApiResponse<Poll>>("/admin/polls", payload);
    },

    updatePoll(pollId: number, payload: UpdatePollPayload) {
        return apiClient.put<ApiResponse<Poll>>(`/admin/polls/${pollId}`, payload);
    },

    deletePoll(pollId: number) {
        return apiClient.delete<ApiResponse<unknown>>(`/admin/polls/${pollId}`);
    },

    getPollSummary(pollId: number) {
        return apiClient.get<ApiResponse<PollSummary>>(`/admin/polls/${pollId}/summary`);
    },

    getPollResponses(pollId: number, params?: Record<string, string>) {
        return apiClient.get<PaginatedResponse<PollResponse>>(
            `/admin/polls/${pollId}/responses`,
            params
        );
    },

    // ── User endpoints ────────────────────────────────────────────────────────

    getActivePolls(params?: Record<string, string>) {
        return apiClient.get<PaginatedResponse<Poll>>("/polls", params);
    },

    vote(pollId: number, payload: VotePollPayload) {
        return apiClient.post<ApiResponse<unknown>>(`/polls/${pollId}/vote`, payload);
    },
};
