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

// Define the shape of our data
type Disbursement = {
    id: string;
    campaignTitle: string;
    requestedBy: string;
    amount: string;
    date: string;
    status: "Pending" | "Completed" | "Rejected" | "Approved" | "Sent";
};

// Mock data
const disbursements: Disbursement[] = [
    {
        id: "DS-001",
        campaignTitle: "Strength is Unity: Cancer Patient Support Program",
        requestedBy: "Aisha Bello",
        amount: "₦500,000",
        date: "27-02-2026",
        status: "Pending",
    },
    {
        id: "DS-002",
        campaignTitle: "Feed 1,000 Families This Ramadan",
        requestedBy: "Aisha Bello",
        amount: "₦500,000",
        date: "27-02-2026",
        status: "Completed",
    },
    {
        id: "DS-003",
        campaignTitle: "Build a Community Health Center",
        requestedBy: "Aisha Bello",
        amount: "₦500,000",
        date: "27-02-2026",
        status: "Rejected",
    },
    {
        id: "DS-004",
        campaignTitle: "Strength is Unity: Cancer Patient Support Program",
        requestedBy: "Aisha Bello",
        amount: "₦500,000",
        date: "27-02-2026",
        status: "Approved",
    },
    {
        id: "DS-005",
        campaignTitle: "Strength is Unity: Cancer Patient Support Program",
        requestedBy: "Aisha Bello",
        amount: "₦500,000",
        date: "27-02-2026",
        status: "Sent",
    },
    {
        id: "DS-006",
        campaignTitle: "Strength is Unity: Cancer Patient Support Program",
        requestedBy: "Aisha Bello",
        amount: "₦500,000",
        date: "27-02-2026",
        status: "Pending",
    },
];

// Columns definition
const columns: ColumnDef<Disbursement>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <span className="text-[#667085]">{row.getValue("id")}</span>,
    },
    {
        accessorKey: "campaignTitle",
        header: "Campaign Title",
        cell: ({ row }) => <span className="font-medium text-[#101828] max-w-[200px] block truncate">{row.getValue("campaignTitle")}</span>,
    },
    {
        accessorKey: "requestedBy",
        header: "Requested By",
    },
    {
        accessorKey: "amount",
        header: "Amount",
    },
    {
        accessorKey: "date",
        header: "Date",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <div className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center",
                    status === "Pending" && "bg-orange-50 text-orange-700",
                    status === "Completed" && "bg-green-50 text-green-700",
                    status === "Rejected" && "bg-red-50 text-red-700",
                    status === "Approved" && "bg-blue-50 text-blue-700 border border-blue-200",
                    status === "Sent" && "bg-purple-50 text-purple-700 border border-purple-200",
                )}>
                    {status}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#667085]">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Approve Request</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Reject Request</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function DisbursementsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <DisbursementModal 
                    isOpen={isModalOpen} 
                    onOpenChange={setIsModalOpen} 
                />
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-[#101828]">Disbursements</h2>
                        <p className="text-sm text-[#475467]">Manage and monitor all disbursement requests.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="border-[#EAECF0] text-[#344054] font-semibold flex items-center gap-2">
                            <Download className="h-4 w-4" /> Export Data
                        </Button>
                        <Button 
                            className="bg-[#0E3B5D] hover:bg-[#0E3B5D]/90 text-white font-semibold gap-2"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus className="h-4 w-4" /> New Disbursement Request
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <DisbursementStats />

                {/* Table Section */}
                <DataTable 
                    columns={columns} 
                    data={disbursements} 
                    searchKey="campaignTitle" 
                    title="Disbursement Table" 
                />
            </div>
        </DashboardLayout>
    );
}
