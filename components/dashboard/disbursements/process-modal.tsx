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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CloudUpload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { disbursementService, Disbursement } from "@/services/disbursements";
import { toast } from "sonner";

interface ProcessModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    disbursement: Disbursement | null;
    mode: "approve" | "reject" | null;
}

export function ProcessDisbursementModal({
    isOpen,
    onOpenChange,
    disbursement,
    mode,
}: ProcessModalProps) {
    const queryClient = useQueryClient();
    const [proofFile, setProofFile] = React.useState<File | null>(null);
    const [rejectReason, setRejectReason] = React.useState("");

    const approveMutation = useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => {
            return disbursementService.disburse(id, file);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["disbursements"] });
            queryClient.invalidateQueries({ queryKey: ["disbursement-stats"] });
            toast.success("Disbursement approved and completed");
            onOpenChange(false);
            resetForms();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to approve disbursement");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => {
            return disbursementService.reject(id, reason);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["disbursements"] });
            queryClient.invalidateQueries({ queryKey: ["disbursement-stats"] });
            toast.success("Disbursement request rejected");
            onOpenChange(false);
            resetForms();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to reject disbursement");
        },
    });

    const resetForms = () => {
        setProofFile(null);
        setRejectReason("");
    };

    const handleAction = () => {
        if (!disbursement) return;

        if (mode === "approve") {
            if (!proofFile) {
                toast.error("Please upload proof of payment");
                return;
            }
            approveMutation.mutate({ id: disbursement.id, file: proofFile });
        } else if (mode === "reject") {
            if (!rejectReason.trim()) {
                toast.error("Please provide a reason for rejection");
                return;
            }
            rejectMutation.mutate({ id: disbursement.id, reason: rejectReason });
        }
    };

    const isSubmitting = approveMutation.isPending || rejectMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md border-none rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {mode === "approve" ? "Complete Disbursement" : "Reject Request"}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {mode === "approve" ? (
                        <div className="space-y-4">
                            <p className="text-sm text-[#667085]">
                                Please upload the proof of payment to complete the disbursement for 
                                <span className="font-semibold text-[#101828]"> {disbursement?.beneficiary_name}</span>.
                            </p>
                            
                            <div 
                                className={cn(
                                    "border-2 border-dashed border-[#D0D5DD] rounded-xl p-6 flex flex-col items-center justify-center bg-[#F9FAFB] cursor-pointer hover:bg-[#F2F4F7] transition-colors relative",
                                    proofFile && "border-solid border-primary bg-white"
                                )}
                                onClick={() => document.getElementById("proof-upload")?.click()}
                            >
                                <input 
                                    type="file" 
                                    id="proof-upload" 
                                    className="hidden" 
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setProofFile(file);
                                    }}
                                />
                                {proofFile ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                                            <CloudUpload className="h-6 w-6 text-green-600" />
                                        </div>
                                        <p className="text-sm font-medium text-[#101828] truncate max-w-[200px]">
                                            {proofFile.name}
                                        </p>
                                        <button 
                                            className="text-xs text-red-500 hover:underline"
                                            onClick={(e) => { e.stopPropagation(); setProofFile(null); }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <CloudUpload className="h-10 w-10 text-[#667085] mb-2" />
                                        <p className="text-sm text-[#475467]">Click to upload proof of payment</p>
                                        <p className="text-xs text-[#667085] mt-1">PNG, JPG or PDF</p>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Rejection</Label>
                            <Textarea 
                                id="reason"
                                placeholder="State the reason why this request is being rejected..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="min-h-[120px] resize-none"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        className="rounded-lg h-11 border-[#EAECF0]"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAction}
                        disabled={isSubmitting}
                        className={cn(
                            "rounded-lg h-11 min-w-[120px]",
                            mode === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                        )}
                    >
                        {isSubmitting ? "Processing..." : (mode === "approve" ? "Confirm Disbursement" : "Reject Request")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
