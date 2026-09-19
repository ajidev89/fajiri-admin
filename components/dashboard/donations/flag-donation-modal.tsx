"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { donationService, Donation } from "@/services/donations";

interface FlagDonationModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    donation: Donation | null;
}

export function FlagDonationModal({
    isOpen,
    onOpenChange,
    donation,
}: FlagDonationModalProps) {
    const queryClient = useQueryClient();
    const [reason, setReason] = React.useState("");

    React.useEffect(() => {
        if (isOpen) setReason("");
    }, [isOpen]);

    const flagMutation = useMutation({
        mutationFn: () => donationService.flagDonation(donation!.id, reason.trim()),
        onSuccess: () => {
            toast.success("Transaction flagged");
            queryClient.invalidateQueries({ queryKey: ["donations"] });
            queryClient.invalidateQueries({ queryKey: ["donation", donation?.id] });
            onOpenChange(false);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to flag transaction");
        },
    });

    if (!donation) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Flag Transaction</DialogTitle>
                    <DialogDescription>
                        Mark{" "}
                        <span className="font-mono font-medium text-[#101828]">
                            {donation.reference}
                        </span>{" "}
                        for review. The reason is visible to other admins.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Label htmlFor="flag-reason">Reason</Label>
                    <Textarea
                        id="flag-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Suspected chargeback, duplicate payment, mismatched donor details…"
                        rows={4}
                        maxLength={1000}
                    />
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={flagMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => flagMutation.mutate()}
                        disabled={!reason.trim() || flagMutation.isPending}
                    >
                        {flagMutation.isPending && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Flag Transaction
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
