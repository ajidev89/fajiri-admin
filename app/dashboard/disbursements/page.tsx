"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DisbursementStats } from "@/components/dashboard/disbursements/stats-cards";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Download, ShieldCheck, Eye, CheckCircle2, PauseCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DisbursementModal } from "@/components/dashboard/disbursements/disbursement-modal";
import { DisbursementDetailsModal } from "@/components/dashboard/disbursements/disbursement-details-modal";
import { ProcessDisbursementModal } from "@/components/dashboard/disbursements/process-modal";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { disbursementService, Disbursement } from "@/services/disbursements";
import { analyticsService } from "@/services/analytics";
import { format } from "date-fns";

export default function DisbursementsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [selectedDisbursement, setSelectedDisbursement] = useState<Disbursement | null>(null);
    const [processMode, setProcessMode] = useState<"approve" | "hold" | "reject" | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const queryClient = useQueryClient();

    const { data: disbursementsRes, isLoading: isLoadingList } = useQuery({
        queryKey: ["disbursements"],
        queryFn: () => disbursementService.listDisbursements(),
    });

    const { data: statsRes, isLoading: isLoadingStats } = useQuery({
        queryKey: ["disbursement-stats"],
        queryFn: () => analyticsService.getDisbursementStats(),
    });

    const allDisbursements: Disbursement[] = Array.isArray(disbursementsRes?.data)
        ? disbursementsRes.data
        : Array.isArray((disbursementsRes?.data as any)?.data)
        ? (disbursementsRes?.data as any).data
        : [];
    const stats = statsRes?.data;

    const disbursements = React.useMemo(() => {
        const list = Array.isArray(allDisbursements) ? allDisbursements : [];
        if (statusFilter === "all") return list;
        return list.filter((d) => (d.status || "").toLowerCase() === statusFilter.toLowerCase());
    }, [allDisbursements, statusFilter]);

    const handleViewDetails = (disbursement: Disbursement) => {
        setSelectedDisbursement(disbursement);
        setIsDetailsModalOpen(true);
    };

    const handleProcess = (disbursement: Disbursement, mode: "approve" | "hold" | "reject") => {
        setSelectedDisbursement(disbursement);
        setProcessMode(mode);
        setIsProcessModalOpen(true);
    };

    // Columns definition
    const columns: ColumnDef<Disbursement>[] = [
        {
            accessorKey: "disbursement_code",
            header: "Tracking Code",
            cell: ({ row }) => {
                const code = row.original.disbursement_code || `DSB-${row.original.id.substring(0, 8).toUpperCase()}`;
                return (
                    <button
                        onClick={() => handleViewDetails(row.original)}
                        className="font-mono text-xs font-bold text-[#0E3B5D] hover:underline text-left"
                    >
                        {code}
                    </button>
                );
            },
        },
        {
            accessorKey: "disbursable.title",
            header: "Campaign / Need",
            cell: ({ row }) => (
                <div className="flex flex-col max-w-[220px]">
                    <span className="font-semibold text-[#101828] truncate text-xs">
                        {row.original.disbursable?.title || row.original.disbursable?.name || "Campaign Treasury"}
                    </span>
                    <span className="text-[10px] text-[#667085] capitalize">
                        {row.original.recipient_type?.replace(/_/g, " ") || "Beneficiary"}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "beneficiary_name",
            header: "Beneficiary & Account",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#344054]">
                        {row.original.beneficiary_name}
                    </span>
                    <span className="text-[10px] text-[#667085] font-mono">
                        {row.original.destination_mask || `${row.original.bank_name} •••• ${row.original.account_number?.slice(-4)}`}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-black text-xs text-[#101828]">
                        {row.original.currency} {Number(row.original.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    {row.original.fee_amount ? (
                        <span className="text-[10px] text-[#667085]">
                            Fee: {row.original.currency} {Number(row.original.fee_amount).toLocaleString()}
                        </span>
                    ) : null}
                </div>
            ),
        },
        {
            accessorKey: "risk_level",
            header: "Risk Status",
            cell: ({ row }) => {
                const risk = (row.original.risk_level || "low").toLowerCase();
                return (
                    <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1",
                        risk === "low" && "bg-emerald-50 text-emerald-700 border border-emerald-100",
                        risk === "medium" && "bg-amber-50 text-amber-700 border border-amber-100",
                        risk === "high" && "bg-rose-50 text-rose-700 border border-rose-100",
                    )}>
                        <ShieldCheck className="h-3 w-3" />
                        {risk} Risk
                    </span>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = (row.original.status || "pending").toLowerCase();
                return (
                    <div className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center",
                        status === "completed" && "bg-emerald-50 text-emerald-700 border border-emerald-100",
                        status === "processing" && "bg-blue-50 text-blue-700 border border-blue-100",
                        status === "pending_review" && "bg-amber-50 text-amber-700 border border-amber-100",
                        status === "pending" && "bg-amber-50 text-amber-700 border border-amber-100",
                        status === "on_hold" && "bg-orange-50 text-orange-700 border border-orange-100",
                        status === "rejected" && "bg-rose-50 text-rose-700 border border-rose-100",
                    )}>
                        {status.replace(/_/g, " ")}
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => (
                <span className="text-[#667085] text-xs">
                    {format(new Date(row.original.created_at), "MMM dd, yyyy")}
                </span>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const item = row.original;
                const status = (item.status || "").toLowerCase();
                const isActionable = ["pending", "pending_review", "on_hold"].includes(status);

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#667085]">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border border-slate-100 p-1">
                            <DropdownMenuItem 
                                className="text-xs cursor-pointer font-medium gap-2"
                                onClick={() => handleViewDetails(item)}
                            >
                                <Eye className="h-3.5 w-3.5 text-slate-500" />
                                View Deep Audit Details
                            </DropdownMenuItem>

                            {isActionable && (
                                <>
                                    <DropdownMenuItem 
                                        className="text-xs font-semibold text-emerald-600 cursor-pointer gap-2"
                                        onClick={() => handleProcess(item, "approve")}
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Approve & Execute Payout
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        className="text-xs font-semibold text-amber-600 cursor-pointer gap-2"
                                        onClick={() => handleProcess(item, "hold")}
                                    >
                                        <PauseCircle className="h-3.5 w-3.5" />
                                        Place on Compliance Hold
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        className="text-xs font-semibold text-rose-600 cursor-pointer gap-2"
                                        onClick={() => handleProcess(item, "reject")}
                                    >
                                        <XCircle className="h-3.5 w-3.5" />
                                        Reject Request
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 pb-10">
                {/* 9-Step Disbursement Modal */}
                <DisbursementModal 
                    isOpen={isModalOpen} 
                    onOpenChange={setIsModalOpen} 
                />

                {/* Audit Details Modal */}
                <DisbursementDetailsModal
                    isOpen={isDetailsModalOpen}
                    onOpenChange={setIsDetailsModalOpen}
                    disbursement={selectedDisbursement}
                />

                {/* Admin Action Review Modal */}
                <ProcessDisbursementModal 
                    isOpen={isProcessModalOpen}
                    onOpenChange={setIsProcessModalOpen}
                    disbursement={selectedDisbursement}
                    mode={processMode}
                />
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 sm:mt-0">
                    <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#101828]">Campaign Disbursements & Payouts</h2>
                        <p className="text-xs sm:text-sm text-[#475467]">
                            Modal-driven treasury controls, automated AML/sanctions compliance, and multi-rail disbursements.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <Button 
                            className="bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white font-semibold gap-2 transition-all shadow-sm h-11 sm:h-10 flex items-center justify-center rounded-xl"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus className="h-4 w-4" /> Disburse Funds
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <DisbursementStats stats={stats} isLoading={isLoadingStats} />

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {[
                        { key: "all", label: "All Disbursements" },
                        { key: "pending_review", label: "Pending Review" },
                        { key: "processing", label: "Processing" },
                        { key: "completed", label: "Completed" },
                        { key: "on_hold", label: "On Hold" },
                        { key: "rejected", label: "Rejected" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                                statusFilter === tab.key
                                    ? "bg-[#0E3B5D] text-white shadow-sm"
                                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-3xl border border-[#EAECF0] overflow-hidden shadow-sm">
                    <DataTable 
                        columns={columns} 
                        data={disbursements} 
                        searchKey="beneficiary_name" 
                        title="Disbursement Queue" 
                        isLoading={isLoadingList}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
