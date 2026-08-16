"use client";

import * as React from "react";
import { 
    Wallet, 
    ArrowUpRight, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    History, 
    SendHorizontal,
    TrendingUp,
    ShieldCheck,
    Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CampaignFinancials } from "@/services/disbursements";
import { Skeleton } from "@/components/ui/skeleton";

interface CampaignFinancialsCardProps {
    campaignId: string;
    campaignTitle?: string;
    financials?: CampaignFinancials;
    isLoading?: boolean;
    onOpenDisburseModal: () => void;
    onOpenHistoryModal: () => void;
}

export function CampaignFinancialsCard({
    campaignId,
    campaignTitle,
    financials,
    isLoading = false,
    onOpenDisburseModal,
    onOpenHistoryModal,
}: CampaignFinancialsCardProps) {
    if (isLoading || !financials) {
        return (
            <div className="bg-white rounded-3xl border border-[#EAECF0] p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-48 rounded-lg" />
                    <Skeleton className="h-10 w-64 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    const currency = financials.currency || "USD";
    const percentDisbursed = financials.available_funds > 0 
        ? Math.min(100, Math.round((financials.disbursed / financials.available_funds) * 100))
        : 0;

    return (
        <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-sm overflow-hidden transition-all">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#0E3B5D] via-[#134e7c] to-[#0E3B5D] text-white p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-sm">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Verified Campaign Treasury</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                            {campaignTitle ? `${campaignTitle} — Financials` : "Campaign Financial Overview"}
                        </h3>
                        <p className="text-sm text-slate-300 max-w-xl">
                            Real-time disbursement gateway, compliance monitoring, and automated ledger balance.
                        </p>
                    </div>

                    {/* Action Triggers strictly as Modals */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={onOpenHistoryModal}
                            className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-11 px-5 rounded-xl font-semibold gap-2 backdrop-blur-sm transition-all"
                        >
                            <History className="h-4 w-4 text-slate-200" />
                            View Financial Activity
                            {financials.disbursements_count > 0 && (
                                <span className="ml-1 px-2 py-0.5 text-xs bg-white/20 rounded-full font-bold">
                                    {financials.disbursements_count}
                                </span>
                            )}
                        </Button>
                        <Button
                            onClick={onOpenDisburseModal}
                            disabled={financials.available_balance <= 0}
                            className={cn(
                                "h-11 px-6 rounded-xl font-semibold gap-2 transition-all shadow-md",
                                financials.available_balance > 0 
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            <SendHorizontal className="h-4 w-4" />
                            Disburse Funds
                        </Button>
                    </div>
                </div>

                {/* Primary Balance Bar */}
                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">Available for Disbursement</span>
                        <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1">
                            <span>{currency}</span>
                            <span>{Number(financials.available_balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">Total Disbursed to Date</span>
                        <div className="text-xl sm:text-2xl font-bold text-emerald-300 flex items-baseline gap-1">
                            <span>{currency}</span>
                            <span>{Number(financials.disbursed).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">Pending Approvals</span>
                        <div className="text-xl sm:text-2xl font-bold text-amber-300 flex items-baseline gap-1">
                            <span>{currency}</span>
                            <span>{Number(financials.pending).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Financial Breakdown Cards */}
            <div className="p-6 sm:p-8 bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Raised */}
                    <div className="bg-white p-5 rounded-2xl border border-[#EAECF0] shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-[#667085]">
                            <span className="text-xs font-medium uppercase tracking-wider">Total Raised</span>
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-xl font-bold text-[#101828]">
                            {currency} {Number(financials.total_raised).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] text-[#667085]">Gross donor contributions</p>
                    </div>

                    {/* Platform & Payment Fees */}
                    <div className="bg-white p-5 rounded-2xl border border-[#EAECF0] shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-[#667085]">
                            <span className="text-xs font-medium uppercase tracking-wider">Processing Fees</span>
                            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                                <Receipt className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-xl font-bold text-[#101828]">
                            {currency} {Number(financials.platform_fees).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] text-[#667085]">Gateway & platform deductors</p>
                    </div>

                    {/* Net Available Funds */}
                    <div className="bg-white p-5 rounded-2xl border border-[#EAECF0] shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-[#667085]">
                            <span className="text-xs font-medium uppercase tracking-wider">Net Available</span>
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <Wallet className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-xl font-bold text-[#101828]">
                            {currency} {Number(financials.available_funds).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] text-[#667085]">Total funds eligible for payout</p>
                    </div>

                    {/* Disbursements Count & Ratio */}
                    <div className="bg-white p-5 rounded-2xl border border-[#EAECF0] shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-[#667085]">
                            <span className="text-xs font-medium uppercase tracking-wider">Disbursement Progress</span>
                            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                                <ArrowUpRight className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <p className="text-xl font-bold text-[#101828]">{percentDisbursed}%</p>
                            <span className="text-xs text-[#667085]">{financials.disbursements_count} payouts</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                                style={{ width: `${percentDisbursed}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
