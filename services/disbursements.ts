import { apiClient, ApiResponse } from "./api-client";

export interface Disbursement {
    id: string;
    disbursable_type: string;
    disbursable: {
        id: string;
        title: string;
        [key: string]: any;
    };
    requested_by: {
        id: string;
        name: string;
    } | null;
    disbursed_by: {
        id: string;
        name: string;
    } | null;
    amount: string;
    currency: string;
    beneficiary_name: string;
    payment_method: string;
    account_name: string;
    account_number: string;
    bank_name: string;
    status: string;
    proof_of_payment: string | null;
    rejected_reason: string | null;
    created_at: string;
    updated_at: string;
}

export interface DisbursementRequestPayload {
    disbursable_id: string;
    disbursable_type: string;
    beneficiary_name: string;
    amount: string;
    currency: string;
    payment_method: string;
    account_name: string;
    account_number: string;
    bank_name: string;
}

export const disbursementService = {
    listDisbursements() {
        return apiClient.get<ApiResponse<Disbursement[]>>("/disbursements");
    },
    
    getDisbursement(id: string) {
        return apiClient.get<ApiResponse<Disbursement>>(`/disbursements/${id}`);
    },
    
    requestDisbursement(payload: DisbursementRequestPayload) {
        return apiClient.post<ApiResponse<Disbursement>>("/disbursements", payload);
    },
    
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
