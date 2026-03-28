"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import DashboardLayout from "@/layout/dashboard";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Define the shape of our data
type Donation = {
    id: string;
    no: number;
    donor: string;
    campaignTitle: string;
    amount: string;
    date: string;
    transactionId: string;
    status: "Success" | "Pending" | "Failed";
};

// Mock data
const donations: Donation[] = [
    {
        id: "1",
        no: 1,
        donor: "Jerome Bell",
        campaignTitle: "Strength is Unity: Cancer Patient Support Program",
        amount: "₦500,000",
        date: "10-02-2026",
        transactionId: "VADEOB248932",
        status: "Success",
    },
    {
        id: "2",
        no: 2,
        donor: "Floyd Miles",
        campaignTitle: "Feed 1,000 Families This Ramadan",
        amount: "₦200,000",
        date: "10-02-2026",
        transactionId: "VADEOB248932",
        status: "Pending",
    },
    {
        id: "3",
        no: 3,
        donor: "Jerome Bell",
        campaignTitle: "Strength is Unity: Cancer Patient Support Program",
        amount: "₦500,000",
        date: "10-02-2026",
        transactionId: "VADEOB248932",
        status: "Failed",
    },
    {
        id: "4",
        no: 4,
        donor: "Jerome Bell",
        campaignTitle: "Strength is Unity: Cancer Patient Support Program",
        amount: "₦500,000",
        date: "10-02-2026",
        transactionId: "VADEOB248932",
        status: "Success",
    },
    {
        id: "5",
        no: 5,
        donor: "Jerome Bell",
        campaignTitle: "Strength is Unity: Cancer Patient Support Program",
        amount: "₦500,000",
        date: "10-02-2026",
        transactionId: "VADEOB248932",
        status: "Success",
    },
    {
        id: "6",
        no: 6,
        donor: "Jerome Bell",
        campaignTitle: "Strength is Unity: Cancer Patient Support Program",
        amount: "₦500,000",
        date: "10-02-2026",
        transactionId: "VADEOB248932",
        status: "Success",
    },
    {
        id: "7",
        no: 7,
        donor: "Jerome Bell",
        campaignTitle: "Strength is Unity: Cancer Patient Support Program",
        amount: "₦500,000",
        date: "10-02-2026",
        transactionId: "VADEOB248932",
        status: "Success",
    },
    {
        id: "8",
        no: 8,
        donor: "Jerome Bell",
        campaignTitle: "Strength is Unity: Cancer Patient Support Program",
        amount: "₦500,000",
        date: "10-02-2026",
        transactionId: "VADEOB248932",
        status: "Success",
    },
];

// Columns definition
const columns: ColumnDef<Donation>[] = [
    {
        accessorKey: "no",
        header: "No",
        cell: ({ row }) => <span className="text-[#667085]">{row.getValue("no")}</span>,
    },
    {
        accessorKey: "donor",
        header: "Donor",
        cell: ({ row }) => <span className="font-medium text-[#101828]">{row.getValue("donor")}</span>,
    },
    {
        accessorKey: "campaignTitle",
        header: "Campaign Title",
        cell: ({ row }) => <span className="text-[#101828] max-w-[200px] block truncate">{row.getValue("campaignTitle")}</span>,
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => <span className="font-medium text-[#101828]">{row.getValue("amount")}</span>,
    },
    {
        accessorKey: "date",
        header: "Date",
    },
    {
        accessorKey: "transactionId",
        header: "Transaction ID",
        cell: ({ row }) => <span className="text-[#475467]">{row.getValue("transactionId")}</span>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <div className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center",
                    status === "Success" && "bg-green-50 text-green-700 border border-green-200",
                    status === "Pending" && "bg-orange-50 text-orange-700 border border-orange-200",
                    status === "Failed" && "bg-red-50 text-red-700 border border-red-200",
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
                    <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Flag Transaction</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function DonationsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-[#101828]">Donations</h2>
                        <p className="text-sm text-[#475467]">Monitor and manage all contributions.</p>
                    </div>
                    <div>
                        <Button variant="outline" className="border-[#EAECF0] text-[#344054] font-semibold flex items-center gap-2">
                            <FileDown className="h-4 w-4" /> Export CSV
                        </Button>
                    </div>
                </div>

                {/* Table Section */}
                <DataTable 
                    columns={columns} 
                    data={donations} 
                    searchKey="donor" 
                    title="Donation Table" 
                />
            </div>
        </DashboardLayout>
    );
}
