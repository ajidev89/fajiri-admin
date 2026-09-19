"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { AlertTriangle, Check, Copy, FileDown, Flag } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    donationService,
    Donation,
    getDonationTitle,
    getDonationType,
} from "@/services/donations";

interface DonationDetailsModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    donation: Donation | null;
    onDownloadReceipt: (donation: Donation) => void;
    onFlag: (donation: Donation) => void;
    onUnflag: (donation: Donation) => void;
    isUnflagging?: boolean;
}

function formatAmount(amount: number | string | undefined, currency?: string) {
    return `${currency ?? ""} ${Number(amount ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`.trim();
}

function Row({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[#F2F4F7] last:border-0">
            <span className="text-sm text-[#667085] shrink-0">{label}</span>
            <span className={cn("text-sm font-medium text-[#101828] text-right break-all", className)}>
                {value ?? "—"}
            </span>
        </div>
    );
}

export function DonationDetailsModal({
    isOpen,
    onOpenChange,
    donation: initial,
    onDownloadReceipt,
    onFlag,
    onUnflag,
    isUnflagging,
}: DonationDetailsModalProps) {
    const [copied, setCopied] = React.useState(false);

    const { data } = useQuery({
        queryKey: ["donation", initial?.id],
        queryFn: () => donationService.getDonation(initial!.id),
        enabled: isOpen && !!initial?.id,
    });

    const donation: Donation | null = data?.data ?? initial;
    if (!donation) return null;

    const type = getDonationType(donation);
    const status = donation.status?.toLowerCase();

    const copyRef = () => {
        navigator.clipboard.writeText(donation.reference);
        setCopied(true);
        toast.success("Transaction ID copied");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 border-none rounded-3xl bg-white shadow-2xl">
                <div className="bg-gradient-to-r from-[#0E3B5D] to-[#164e78] text-white p-6 rounded-t-3xl space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex px-3 py-1 rounded-full bg-white/10 text-xs font-semibold">
                            {type === "campaign" ? "Campaign" : "Need"} Donation
                        </span>
                        <span
                            className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                                status === "completed" && "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
                                status === "pending" && "bg-amber-500/20 text-amber-300 border-amber-400/30",
                                status === "failed" && "bg-rose-500/20 text-rose-300 border-rose-400/30",
                            )}
                        >
                            {status}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-300 uppercase tracking-wider font-medium">Amount</span>
                        <DialogTitle className="text-3xl font-black text-white">
                            {formatAmount(donation.amount, donation.currency)}
                        </DialogTitle>
                        {donation.base_amount_usd ? (
                            <p className="text-xs text-slate-300 mt-1">
                                ≈ USD {Number(donation.base_amount_usd).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    {donation.is_flagged && (
                        <div className="flex gap-3 p-4 rounded-2xl border border-red-200 bg-red-50">
                            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                            <div className="space-y-1 text-sm">
                                <p className="font-semibold text-red-700">Flagged transaction</p>
                                {donation.flag_reason && (
                                    <p className="text-red-700/90 whitespace-pre-wrap">{donation.flag_reason}</p>
                                )}
                                <p className="text-xs text-red-600/80">
                                    {donation.flagged_at && format(new Date(donation.flagged_at), "dd MMM yyyy, HH:mm")}
                                    {donation.flagged_by?.email && ` · by ${donation.flagged_by.email}`}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="rounded-2xl border border-[#EAECF0] px-4">
                        <Row
                            label="Transaction ID"
                            value={
                                <span className="inline-flex items-center gap-1.5 font-mono">
                                    {donation.reference}
                                    <button onClick={copyRef} className="p-1 rounded hover:bg-slate-100 text-[#667085]">
                                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                    </button>
                                </span>
                            }
                        />
                        <Row label="Type" value={type === "campaign" ? "Campaign" : "Need"} />
                        <Row label="Title" value={getDonationTitle(donation)} />
                        <Row label="Donor" value={donation.name ?? "Anonymous"} />
                        <Row label="Email" value={donation.email} />
                        <Row label="Medium" value={donation.medium} className="capitalize" />
                        {donation.rate != null && donation.rate !== 1 && (
                            <Row label="Exchange Rate" value={donation.rate} />
                        )}
                        <Row
                            label="Date"
                            value={donation.created_at ? format(new Date(donation.created_at), "dd MMM yyyy, HH:mm") : "—"}
                        />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                        {donation.is_flagged ? (
                            <Button
                                variant="outline"
                                onClick={() => onUnflag(donation)}
                                disabled={isUnflagging}
                            >
                                <Flag className="h-4 w-4" /> Remove Flag
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => onFlag(donation)}
                            >
                                <Flag className="h-4 w-4" /> Flag Transaction
                            </Button>
                        )}
                        <Button
                            className="bg-[#0E3B5D] hover:bg-[#0b2f4a] text-white"
                            onClick={() => onDownloadReceipt(donation)}
                        >
                            <FileDown className="h-4 w-4" /> Download Receipt
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
