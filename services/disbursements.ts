import { apiClient, ApiResponse } from "./api-client";

export type DisbursementStatus =
    | "draft"
    | "pending"
    | "pending_review"
    | "approved"
    | "processing"
    | "sent"
    | "completed"
    | "failed"
    | "rejected"
    | "on_hold"
    | "reversed"
    | string;

export type PayoutMethod =
    | "local_bank_transfer"
    | "international_bank_transfer"
    | "sepa"
    | "ach"
    | "swift"
    | "platform_wallet"
    | "mobile_money"
    | "digital_wallet"
    | "card"
    | string;

export type RecipientType =
    | "campaign_owner"
    | "individual_beneficiary"
    | "organization"
    | "vendor_service_provider"
    | "multiple_beneficiaries"
    | string;

export type RiskLevel = "low" | "medium" | "high";

export interface Disbursement {
    id: string;
    disbursement_code?: string;
    disbursable_type: string;
    disbursable_id?: string;
    disbursable: {
        id: string;
        title: string;
        currency?: string;
        [key: string]: any;
    } | null;
    requested_by: {
        id: string;
        name: string;
        email?: string;
        kyc?: string;
    } | null;
    disbursed_by: {
        id: string;
        name: string;
    } | null;
    recipient_type?: RecipientType;
    recipient_country?: string;
    recipient_email?: string | null;
    recipient_phone?: string | null;
    amount: number | string;
    fee_amount?: number;
    fee_bearer?: "campaign" | "recipient";
    net_amount?: number;
    currency: string;
    target_currency?: string;
    rate?: number;
    estimated_recipient_amount?: number;
    beneficiary_name: string;
    payment_method: PayoutMethod;
    account_name?: string | null;
    account_number?: string | null;
    destination_mask?: string | null;
    bank_name?: string | null;
    bank_code?: string | null;
    routing_number?: string | null;
    swift_bic?: string | null;
    iban?: string | null;
    status: DisbursementStatus;
    purpose?: string | null;
    purpose_description?: string | null;
    documents?: string[];
    compliance_checks?: Record<string, { passed: boolean; message: string; code?: string; severity?: string }>;
    risk_score?: number;
    risk_level?: RiskLevel;
    security_auth_method?: string;
    payout_provider?: string | null;
    provider_reference?: string | null;
    proof_of_payment: string | null;
    rejected_reason: string | null;
    status_history?: Array<{ status: string; timestamp: string; actor_id?: string; note?: string }>;
    created_at: string;
    updated_at: string;
}

export interface CampaignFinancials {
    total_raised: number;
    platform_fees: number;
    available_funds: number;
    disbursed: number;
    pending: number;
    available_balance: number;
    disbursements_count: number;
    currency: string;
}

export interface FeeCalculation {
    requested_amount: number;
    fee_amount: number;
    total_deducted: number;
    recipient_receives: number;
    fee_bearer: "campaign" | "recipient";
    target_currency: string;
    exchange_rate: number;
}

export interface ComplianceEvaluation {
    passed: boolean;
    checks: Record<string, { passed: boolean; message: string; code?: string }>;
    risk_score: number;
    risk_level: "low" | "medium" | "high";
    required_auth_method: "password" | "otp" | "biometric";
    requires_admin_review: boolean;
    fee_calculation: FeeCalculation;
    recommended_provider: string;
}

export interface SubmitDisbursementPayload {
    campaign_id?: string;
    disbursable_id?: string;
    recipient_type?: string;
    beneficiary_name: string;
    recipient_country?: string;
    recipient_email?: string;
    recipient_phone?: string;
    amount: number | string;
    currency?: string;
    target_currency?: string;
    payout_method: string;
    fee_bearer?: "campaign" | "recipient";
    account_name?: string;
    account_number: string;
    bank_name: string;
    bank_code?: string;
    routing_number?: string;
    swift_bic?: string;
    iban?: string;
    purpose: string;
    purpose_description?: string;
    documents?: string[];
    otp?: string;
    password?: string;
}

export const disbursementService = {
    // List all disbursements (General)
    listDisbursements(params?: Record<string, string>) {
        return apiClient.get<ApiResponse<Disbursement[]>>("/disbursements", params);
    },

    // Get single disbursement deep audit details
    getDisbursement(id: string) {
        return apiClient.get<ApiResponse<Disbursement>>(`/disbursements/${id}`);
    },

    // Campaign Financials & Modal Operations
    getCampaignFinancials(campaignId: string) {
        return apiClient.get<ApiResponse<CampaignFinancials>>(`/campaigns/${campaignId}/disbursements/financials`);
    },

    validateDisbursement(campaignId: string, payload: Partial<SubmitDisbursementPayload>) {
        return apiClient.post<ApiResponse<{ compliance: ComplianceEvaluation; fee_calculation: FeeCalculation }>>(
            `/campaigns/${campaignId}/disbursements/validate`,
            payload
        );
    },

    sendOtp(campaignId: string) {
        return apiClient.post<ApiResponse<{ email_masked: string; expires_in: number }>>(
            `/campaigns/${campaignId}/disbursements/send-otp`
        );
    },

    getCampaignDisbursements(campaignId: string) {
        return apiClient.get<ApiResponse<Disbursement[]>>(`/campaigns/${campaignId}/disbursements`);
    },

    submitCampaignDisbursement(campaignId: string, payload: SubmitDisbursementPayload) {
        return apiClient.post<ApiResponse<Disbursement>>(`/campaigns/${campaignId}/disbursements`, payload);
    },

    // Admin Review Queue & Processing
    listAdminQueue(params?: Record<string, string>) {
        return apiClient.get<ApiResponse<Disbursement[]>>("/admin/disbursements", params);
    },

    approveDisbursement(id: string) {
        return apiClient.post<ApiResponse<Disbursement>>(`/admin/disbursements/${id}/approve`);
    },

    holdDisbursement(id: string, reason: string) {
        return apiClient.post<ApiResponse<Disbursement>>(`/admin/disbursements/${id}/hold`, { reason });
    },

    rejectDisbursement(id: string, reason: string) {
        return apiClient.post<ApiResponse<Disbursement>>(`/admin/disbursements/${id}/reject`, { reason });
    },

    // Legacy fallback support
    disburse(id: string, proofOfPayment: File) {
        const formData = new FormData();
        formData.append("proof_of_payment", proofOfPayment);
        return apiClient.post<ApiResponse<Disbursement>>(`/disbursements/${id}/disburse`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    reject(id: string, reason: string) {
        return apiClient.post<ApiResponse<Disbursement>>(`/disbursements/${id}/reject`, {
            rejected_reason: reason,
        });
    },
};
