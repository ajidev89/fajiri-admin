"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DisbursementStats } from "@/components/dashboard/disbursements/stats-cards";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DisbursementModal } from "@/components/dashboard/disbursements/disbursement-modal";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { disbursementService, Disbursement } from "@/services/disbursements";
import { analyticsService } from "@/services/analytics";
import { toast } from "sonner";
import { ProcessDisbursementModal } from "@/components/dashboard/disbursements/process-modal";
import { format } from "date-fns";

export default function DisbursementsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [selectedDisbursement, setSelectedDisbursement] = useState<Disbursement | null>(null);
    const [processMode, setProcessMode] = useState<"approve" | "reject" | null>(null);
    const queryClient = useQueryClient();

    const { data: disbursementsRes, isLoading: isLoadingList } = useQuery({
        queryKey: ["disbursements"],
        queryFn: () => disbursementService.listDisbursements(),
    });

    const { data: statsRes, isLoading: isLoadingStats } = useQuery({
        queryKey: ["disbursement-stats"],
        queryFn: () => analyticsService.getDisbursementStats(),
    });

    const disbursements = disbursementsRes?.data || [];
    const stats = statsRes?.data;

    const handleProcess = (disbursement: Disbursement, mode: "approve" | "reject") => {
        setSelectedDisbursement(disbursement);
        setProcessMode(mode);
        setIsProcessModalOpen(true);
    };

    // Columns definition
    const columns: ColumnDef<Disbursement>[] = [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => (
                <span className="text-[#667085] text-xs">
                    {row.original.id.substring(0, 8)}...
                </span>
            ),
        },
        {
            accessorKey: "disbursable.title",
            header: "Source Title",
            cell: ({ row }) => (
                <div className="flex flex-col max-w-[250px]">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                            row.original.disbursable_type.includes("Campaign") 
                                ? "bg-blue-50 text-blue-600 border border-blue-100" 
                                : "bg-purple-50 text-purple-600 border border-purple-100"
                        )}>
                            {row.original.disbursable_type.includes("Campaign") ? "Campaign" : "Need"}
                        </span>
                    </div>
                    <span className="font-medium text-[#101828] truncate">
                        {row.original.disbursable?.title || row.original.disbursable?.name || "N/A"}
                    </span>
                    <span className="text-[10px] text-[#667085]">
                        Method: {row.original.payment_method}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "beneficiary_name",
            header: "Beneficiary",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#344054]">
                        {row.original.beneficiary_name}
                    </span>
                    <span className="text-[10px] text-[#667085]">
                        {row.original.bank_name} - {row.original.account_number}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => (
                <span className="font-semibold text-[#101828]">
                    {row.original.currency} {Number(row.original.amount).toLocaleString()}
                </span>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => (
                <span className="text-[#667085] text-sm">
                    {format(new Date(row.original.created_at), "dd-MM-yyyy")}
                </span>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status as string;
                return (
                    <div className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-medium inline-flex items-center capitalize",
                        status === "pending" && "bg-orange-50 text-orange-700 border border-orange-100",
                        status === "completed" && "bg-green-50 text-green-700 border border-green-100",
                        status === "rejected" && "bg-red-50 text-red-700 border border-red-100",
                    )}>
                        {status}
                    </div>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#667085]">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem 
                                className="text-xs cursor-pointer"
                                onClick={() => {
                                    // Placeholder for "View Details"
                                    toast.info("Detailed view is coming soon");
                                }}
                            >
                                View Details
                            </DropdownMenuItem>
                            {item.status === "pending" && (
                                <>
                                    <DropdownMenuItem 
                                        className="text-xs font-medium text-green-600 cursor-pointer"
                                        onClick={() => handleProcess(item, "approve")}
                                    >
                                        Approve & Disburse
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        className="text-xs font-medium text-red-600 cursor-pointer"
                                        onClick={() => handleProcess(item, "reject")}
                                    >
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
                <DisbursementModal 
                    isOpen={isModalOpen} 
                    onOpenChange={setIsModalOpen} 
                />

                <ProcessDisbursementModal 
                    isOpen={isProcessModalOpen}
                    onOpenChange={setIsProcessModalOpen}
                    disbursement={selectedDisbursement}
                    mode={processMode}
                />
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 sm:mt-0">
                    <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#101828]">Disbursements</h2>
                        <p className="text-xs sm:text-sm text-[#475467]">Manage and monitor all disbursement requests.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <Button variant="outline" className="border-[#EAECF0] text-[#344054] font-semibold flex items-center justify-center gap-2 h-11 sm:h-10">
                            <Download className="h-4 w-4" /> Export Data
                        </Button>
                        <Button 
                            className="bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white font-semibold gap-2 transition-all shadow-sm h-11 sm:h-10 flex items-center justify-center"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus className="h-4 w-4" /> New Disbursement Request
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <DisbursementStats stats={stats} isLoading={isLoadingStats} />

                {/* Table Section */}
                <div className="bg-white rounded-3xl border border-[#EAECF0] overflow-hidden shadow-sm">
                    <DataTable 
                        columns={columns} 
                        data={disbursements} 
                        searchKey="beneficiary_name" 
                        title="Disbursement Table" 
                        isLoading={isLoadingList}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
