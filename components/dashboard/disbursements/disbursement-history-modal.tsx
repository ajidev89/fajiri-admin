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
    History, 
    Search, 
    ExternalLink, 
    ArrowUpRight, 
    Filter,
    FileSpreadsheet,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Disbursement, disbursementService } from "@/services/disbursements";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { DisbursementDetailsModal } from "./disbursement-details-modal";
import { Skeleton } from "@/components/ui/skeleton";

interface DisbursementHistoryModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    campaignId: string;
    campaignTitle?: string;
}

export function DisbursementHistoryModal({
    isOpen,
    onOpenChange,
    campaignId,
    campaignTitle,
}: DisbursementHistoryModalProps) {
    const [search, setSearch] = React.useState("");
    const [selectedDisbursement, setSelectedDisbursement] = React.useState<Disbursement | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

    const { data: disbursementsRes, isLoading } = useQuery({
        queryKey: ["campaign-disbursements", campaignId],
        queryFn: () => disbursementService.getCampaignDisbursements(campaignId),
        enabled: isOpen && !!campaignId,
    });

    const disbursements: Disbursement[] = Array.isArray(disbursementsRes?.data)
        ? disbursementsRes.data
        : Array.isArray((disbursementsRes?.data as any)?.data)
        ? (disbursementsRes?.data as any).data
        : [];

    const filtered = (Array.isArray(disbursements) ? disbursements : []).filter((item) => {
        const query = search.toLowerCase();
        const code = (item.disbursement_code || "").toLowerCase();
        const name = (item.beneficiary_name || "").toLowerCase();
        const bank = (item.bank_name || "").toLowerCase();
        const status = (item.status || "").toLowerCase();
        return code.includes(query) || name.includes(query) || bank.includes(query) || status.includes(query);
    });

    const handleRowClick = (item: Disbursement) => {
        setSelectedDisbursement(item);
        setIsDetailsOpen(true);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-none rounded-3xl bg-white shadow-2xl">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#0E3B5D] to-[#134e7c] text-white p-6 sm:p-7 rounded-t-3xl space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                            <History className="h-4 w-4 text-emerald-400" />
                            Financial Activity & Disbursements
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                            {campaignTitle || "Campaign Treasury Activity"}
                        </h2>
                        <p className="text-xs text-slate-300">
                            Complete ledger of requested, pending, and completed payout transactions.
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Search & Filter Bar */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by tracking code, beneficiary, bank..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-11 rounded-xl border-[#EAECF0] bg-slate-50 focus:bg-white text-sm"
                                />
                            </div>
                        </div>

                        {/* List / Table of Disbursements */}
                        {isLoading ? (
                            <div className="space-y-3 py-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                                <div className="h-12 w-12 rounded-full bg-slate-200/60 flex items-center justify-center mx-auto text-slate-400 mb-3">
                                    <History className="h-6 w-6" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900">No Disbursements Found</h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                                    No disbursement requests match your criteria or none have been submitted for this campaign yet.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {filtered.map((item) => {
                                    const status = item.status?.toLowerCase() || "pending";
                                    const riskLevel = item.risk_level?.toLowerCase() || "low";

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => handleRowClick(item)}
                                            className="group p-4 rounded-2xl border border-[#EAECF0] hover:border-blue-400 hover:shadow-md bg-white transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 transition-colors shrink-0">
                                                    <ArrowUpRight className="h-5 w-5" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs font-bold text-[#0E3B5D]">
                                                            {item.disbursement_code || `DSB-${item.id.substring(0, 8).toUpperCase()}`}
                                                        </span>
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                                            status === "completed" && "bg-emerald-50 text-emerald-700 border border-emerald-100",
                                                            status === "processing" && "bg-blue-50 text-blue-700 border border-blue-100",
                                                            status === "pending_review" && "bg-amber-50 text-amber-700 border border-amber-100",
                                                            status === "on_hold" && "bg-orange-50 text-orange-700 border border-orange-100",
                                                            status === "rejected" && "bg-rose-50 text-rose-700 border border-rose-100",
                                                        )}>
                                                            {status.replace(/_/g, " ")}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-900">{item.beneficiary_name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {item.bank_name} • {item.destination_mask || `•••• ${item.account_number?.slice(-4)}`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-1 border-t sm:border-0 pt-2 sm:pt-0">
                                                <span className="text-base font-black text-slate-900">
                                                    {item.currency} {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    {format(new Date(item.created_at), "MMM dd, yyyy")}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-5 bg-slate-50 rounded-b-3xl border-t border-slate-100">
                        <Button 
                            variant="outline" 
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl border-[#EAECF0] h-11 font-semibold"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Modal on Click */}
            <DisbursementDetailsModal
                isOpen={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                disbursement={selectedDisbursement}
            />
        </>
    );
}
