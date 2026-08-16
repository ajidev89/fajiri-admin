"use client";

import * as React from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ShieldCheck, 
    FileText, 
    Building2, 
    User, 
    ExternalLink,
    AlertTriangle,
    ArrowRight,
    Copy,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Disbursement } from "@/services/disbursements";
import { format } from "date-fns";
import { toast } from "sonner";

interface DisbursementDetailsModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    disbursement: Disbursement | null;
}

export function DisbursementDetailsModal({
    isOpen,
    onOpenChange,
    disbursement,
}: DisbursementDetailsModalProps) {
    const [copied, setCopied] = React.useState(false);

    if (!disbursement) return null;

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success("Disbursement reference copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const status = disbursement.status?.toLowerCase() || "pending";
    const riskLevel = disbursement.risk_level?.toLowerCase() || "low";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none rounded-3xl bg-white shadow-2xl">
                {/* Header with DSB reference */}
                <div className="bg-gradient-to-r from-[#0E3B5D] to-[#164e78] text-white p-6 rounded-t-3xl space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm">
                            <span className="capitalize">{disbursement.recipient_type?.replace(/_/g, " ") || "Beneficiary"}</span>
                        </div>
                        <div className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                            status === "completed" && "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
                            status === "processing" && "bg-blue-500/20 text-blue-300 border border-blue-400/30",
                            status === "pending_review" && "bg-amber-500/20 text-amber-300 border border-amber-400/30",
                            status === "on_hold" && "bg-orange-500/20 text-orange-300 border border-orange-400/30",
                            status === "rejected" && "bg-rose-500/20 text-rose-300 border border-rose-400/30",
                        )}>
                            {status.replace(/_/g, " ")}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <span className="text-xs text-slate-300 uppercase tracking-wider font-medium">Tracking Code</span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <h2 className="text-2xl font-black tracking-wide font-mono">
                                    {disbursement.disbursement_code || `DSB-${disbursement.id.substring(0, 8).toUpperCase()}`}
                                </h2>
                                <button 
                                    onClick={() => copyCode(disbursement.disbursement_code || disbursement.id)}
                                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-slate-200"
                                >
                                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="text-xs text-slate-300 uppercase tracking-wider font-medium">Payout Amount</span>
                            <p className="text-2xl font-black text-white">
                                {disbursement.currency} {Number(disbursement.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Compliance & Risk Screening Badge */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm",
                                riskLevel === "low" && "bg-emerald-100 text-emerald-700",
                                riskLevel === "medium" && "bg-amber-100 text-amber-700",
                                riskLevel === "high" && "bg-rose-100 text-rose-700"
                            )}>
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 capitalize">Risk Assessment: {riskLevel} Risk</h4>
                                <p className="text-xs text-slate-500">
                                    Security Score: {disbursement.risk_score ?? 0}/100 • Method: {disbursement.security_auth_method || "2FA Verified"}
                                </p>
                            </div>
                        </div>
                        {disbursement.payout_provider && (
                            <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 uppercase">
                                Rail: {disbursement.payout_provider}
                            </span>
                        )}
                    </div>

                    {/* Recipient & Bank Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl border border-[#EAECF0] bg-white space-y-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <User className="h-4 w-4 text-blue-600" />
                                Recipient Details
                            </div>
                            <div className="space-y-1">
                                <p className="text-base font-bold text-slate-900">{disbursement.beneficiary_name}</p>
                                {disbursement.recipient_email && (
                                    <p className="text-xs text-slate-600">{disbursement.recipient_email}</p>
                                )}
                                {disbursement.recipient_phone && (
                                    <p className="text-xs text-slate-600">{disbursement.recipient_phone}</p>
                                )}
                                <p className="text-xs text-slate-400">Country Rail: {disbursement.recipient_country || "NG"}</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl border border-[#EAECF0] bg-white space-y-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <Building2 className="h-4 w-4 text-purple-600" />
                                Destination Account
                            </div>
                            <div className="space-y-1">
                                <p className="text-base font-bold text-slate-900">{disbursement.bank_name}</p>
                                <p className="text-xs font-mono text-slate-700">
                                    Account: {disbursement.destination_mask || `${disbursement.bank_name} •••• ${disbursement.account_number?.slice(-4)}`}
                                </p>
                                {disbursement.swift_bic && (
                                    <p className="text-xs font-mono text-slate-500">SWIFT/BIC: {disbursement.swift_bic}</p>
                                )}
                                {disbursement.iban && (
                                    <p className="text-xs font-mono text-slate-500">IBAN: {disbursement.iban}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Financial & Dynamic Fee Breakdown */}
                    <div className="p-5 rounded-2xl border border-[#EAECF0] bg-slate-50 space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Ledger & Fee Accounting
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Requested Payout Amount:</span>
                                <span className="font-semibold text-slate-900">
                                    {disbursement.currency} {Number(disbursement.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Processing & Gateway Fee ({disbursement.fee_bearer || "campaign"} bears fee):</span>
                                <span className="font-semibold text-slate-900">
                                    {disbursement.currency} {Number(disbursement.fee_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Estimated Recipient Receives:</span>
                                <span className="font-bold text-emerald-700">
                                    {disbursement.target_currency || disbursement.currency} {Number(disbursement.estimated_recipient_amount || disbursement.net_amount || disbursement.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Purpose & Description */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Purpose / Audit Reason</h4>
                        <div className="p-4 rounded-2xl bg-white border border-[#EAECF0]">
                            <p className="text-sm font-bold text-slate-900">{disbursement.purpose || "Campaign Disbursement"}</p>
                            {disbursement.purpose_description && (
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{disbursement.purpose_description}</p>
                            )}
                        </div>
                    </div>

                    {/* Supporting Documents */}
                    {disbursement.documents && disbursement.documents.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Attached Documents</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {disbursement.documents.map((doc, idx) => (
                                    <a
                                        key={idx}
                                        href={doc}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs font-medium text-blue-600"
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                                            <span className="truncate">Document {idx + 1}</span>
                                        </div>
                                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Compliance Checklist Summary */}
                    {disbursement.compliance_checks && Object.keys(disbursement.compliance_checks).length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Compliance Screening Log</h4>
                            <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                                {Object.entries(disbursement.compliance_checks).map(([key, check]) => (
                                    <div key={key} className="flex items-center justify-between py-1 border-b border-slate-200/50 last:border-0">
                                        <span className="text-slate-600 capitalize">{key.replace(/_/g, " ")}</span>
                                        <div className="flex items-center gap-1.5">
                                            {check.passed ? (
                                                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Passed
                                                </span>
                                            ) : (
                                                <span className="text-rose-600 font-semibold flex items-center gap-1">
                                                    <XCircle className="h-3.5 w-3.5" /> Flagged
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status History Timeline */}
                    {disbursement.status_history && disbursement.status_history.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Audit Trail Timeline</h4>
                            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                                {disbursement.status_history.map((event, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-blue-600 ring-4 ring-white" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 capitalize">
                                                Status: {event.status?.replace(/_/g, " ")}
                                            </p>
                                            {event.note && (
                                                <p className="text-xs text-slate-600 mt-0.5">{event.note}</p>
                                            )}
                                            <span className="text-[10px] text-slate-400">
                                                {format(new Date(event.timestamp), "MMM dd, yyyy HH:mm:ss")}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 bg-slate-50 rounded-b-3xl border-t border-slate-100">
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto rounded-xl border-[#EAECF0] h-11 font-semibold"
                    >
                        Close Audit View
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
