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
import { Textarea } from "@/components/ui/textarea";
import { 
    ShieldCheck, 
    ShieldAlert, 
    AlertTriangle, 
    CheckCircle2, 
    XCircle, 
    PauseCircle, 
    FileText, 
    ExternalLink, 
    Building2, 
    User,
    DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { disbursementService, Disbursement } from "@/services/disbursements";
import { toast } from "sonner";

interface ProcessModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    disbursement: Disbursement | null;
    mode: "approve" | "hold" | "reject" | null;
}

export function ProcessDisbursementModal({
    isOpen,
    onOpenChange,
    disbursement,
    mode,
}: ProcessModalProps) {
    const queryClient = useQueryClient();
    const [actionReason, setActionReason] = React.useState("");

    const approveMutation = useMutation({
        mutationFn: (id: string) => disbursementService.approveDisbursement(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["disbursements"] });
            queryClient.invalidateQueries({ queryKey: ["admin-disbursements"] });
            queryClient.invalidateQueries({ queryKey: ["disbursement-stats"] });
            toast.success("Disbursement approved and payment payout processed");
            onOpenChange(false);
            setActionReason("");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to approve disbursement");
        },
    });

    const holdMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => {
            return disbursementService.holdDisbursement(id, reason);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["disbursements"] });
            queryClient.invalidateQueries({ queryKey: ["admin-disbursements"] });
            queryClient.invalidateQueries({ queryKey: ["disbursement-stats"] });
            toast.success("Disbursement placed on compliance hold");
            onOpenChange(false);
            setActionReason("");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to place on hold");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => {
            return disbursementService.rejectDisbursement(id, reason);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["disbursements"] });
            queryClient.invalidateQueries({ queryKey: ["admin-disbursements"] });
            queryClient.invalidateQueries({ queryKey: ["disbursement-stats"] });
            toast.success("Disbursement request rejected");
            onOpenChange(false);
            setActionReason("");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to reject disbursement");
        },
    });

    const handleAction = () => {
        if (!disbursement) return;

        if (mode === "approve") {
            approveMutation.mutate(disbursement.id);
        } else if (mode === "hold") {
            if (!actionReason.trim()) {
                toast.error("Please provide a reason for placing this disbursement on hold");
                return;
            }
            holdMutation.mutate({ id: disbursement.id, reason: actionReason });
        } else if (mode === "reject") {
            if (!actionReason.trim()) {
                toast.error("Please provide a reason for rejection");
                return;
            }
            rejectMutation.mutate({ id: disbursement.id, reason: actionReason });
        }
    };

    const isSubmitting = approveMutation.isPending || holdMutation.isPending || rejectMutation.isPending;
    const riskLevel = disbursement?.risk_level?.toLowerCase() || "low";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl border-none rounded-3xl p-0 overflow-hidden bg-white shadow-2xl">
                {/* Header */}
                <div className={cn(
                    "p-6 text-white space-y-2",
                    mode === "approve" && "bg-gradient-to-r from-emerald-700 to-teal-800",
                    mode === "hold" && "bg-gradient-to-r from-amber-700 to-orange-800",
                    mode === "reject" && "bg-gradient-to-r from-rose-700 to-red-800"
                )}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
                            Admin Treasury Review
                        </span>
                        <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                            {disbursement?.disbursement_code || `DSB-${disbursement?.id?.substring(0, 8)}`}
                        </span>
                    </div>

                    <h2 className="text-xl font-bold">
                        {mode === "approve" && "Approve & Execute Payout"}
                        {mode === "hold" && "Place on Compliance Hold"}
                        {mode === "reject" && "Reject Disbursement Request"}
                    </h2>
                </div>

                <div className="p-6 space-y-4">
                    {/* Summary Info */}
                    {disbursement && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Beneficiary:</span>
                                <span className="font-bold text-slate-900">{disbursement.beneficiary_name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Destination:</span>
                                <span className="font-mono text-slate-800">
                                    {disbursement.destination_mask || `${disbursement.bank_name} •••• ${disbursement.account_number?.slice(-4)}`}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Disbursement Amount:</span>
                                <span className="font-bold text-slate-900 text-sm">
                                    {disbursement.currency} {Number(disbursement.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-slate-500">Risk Assessment:</span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full font-bold uppercase text-[10px]",
                                    riskLevel === "low" && "bg-emerald-100 text-emerald-800",
                                    riskLevel === "medium" && "bg-amber-100 text-amber-800",
                                    riskLevel === "high" && "bg-rose-100 text-rose-800",
                                )}>
                                    {riskLevel} Risk (Score: {disbursement.risk_score ?? 0}/100)
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action reason if Hold or Reject */}
                    {(mode === "hold" || mode === "reject") && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">
                                {mode === "hold" ? "Hold Justification & Additional Requirements" : "Rejection Reason"}
                            </label>
                            <Textarea
                                placeholder={mode === "hold" 
                                    ? "Explain why this payout is placed on hold (e.g. pending identity re-verification, invoice clarification)..."
                                    : "Explain why this disbursement is rejected..."
                                }
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                className="min-h-[100px] rounded-xl border-[#EAECF0] resize-none text-xs"
                            />
                        </div>
                    )}

                    {mode === "approve" && (
                        <p className="text-xs text-slate-500 leading-relaxed">
                            By approving this request, the automated payout engine will initiate a direct transfer to the recipient's bank account or wallet, deduct platform ledger funds, and notify the campaign creator.
                        </p>
                    )}
                </div>

                <DialogFooter className="p-5 bg-slate-50 rounded-b-3xl border-t border-slate-100 flex items-center justify-end gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl h-11 border-[#EAECF0] font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAction}
                        disabled={isSubmitting}
                        className={cn(
                            "rounded-xl h-11 px-6 font-semibold shadow-sm",
                            mode === "approve" && "bg-emerald-600 hover:bg-emerald-700 text-white",
                            mode === "hold" && "bg-amber-600 hover:bg-amber-700 text-white",
                            mode === "reject" && "bg-rose-600 hover:bg-rose-700 text-white"
                        )}
                    >
                        {isSubmitting ? "Processing..." : (
                            mode === "approve" ? "Confirm & Execute Payout" :
                            mode === "hold" ? "Place on Hold" : "Confirm Rejection"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
